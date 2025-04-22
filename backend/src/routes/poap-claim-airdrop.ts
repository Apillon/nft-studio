import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { AirdropStatus, RouteErrorCode } from '../config/values';
import { ResourceError } from '../lib/errors';
import { Identity, LogLevel, Nft } from '@apillon/sdk';
import { LogType, writeLog } from '../lib/logger';
import { env } from '../config/env';
import { DropReservation } from '../models/drop-reservation';
import { PoapDrop } from '../models/poap-drop';
import { readEmailAirdropPoapToken } from '../lib/jwt';
import { createDropReservation } from '../lib/create-drop-reservation';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post('/claim-poap', (req: Request, res: Response, next: NextFunction) => {
    resolve(req, res).catch(next);
  });
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  if (!body.signature || !body.address) {
    throw new ResourceError(RouteErrorCode.SIGNATURE_NOT_PRESENT);
  }

  const identity = new Identity(null);
  const { isValid } = identity.validateEvmWalletSignature({
    walletAddress: body.address,
    signature: body.signature,
    signatureValidityMinutes: 10,
    message: `test\n${body.timestamp}`,
    timestamp: body.timestamp,
  });

  if (!isValid) {
    throw new ResourceError(RouteErrorCode.SIGNATURE_NOT_PRESENT);
  }
  const wallet = body.address;

  if (!body.jwt) {
    throw new ResourceError(RouteErrorCode.REQUEST_TOKEN_NOT_PRESENT);
  }

  const { email, poapId } = readEmailAirdropPoapToken(body.jwt);
  if (!email) {
    throw new ResourceError(RouteErrorCode.REQUEST_TOKEN_INVALID);
  }

  let dropReservation = await new DropReservation(
    {},
    { context },
  ).populateByDropAndEmail(+poapId, email);

  if (!dropReservation.exists()) {
    dropReservation = await createDropReservation(
      context,
      +poapId,
      new DropReservation(
        {
          wallet,
          airdropStatus: AirdropStatus.PENDING,
          email,
          poapDrop_id: poapId,
        },
        { context },
      ),
    );
  }

  if (
    ![
      AirdropStatus.PENDING,
      AirdropStatus.EMAIL_SENT,
      AirdropStatus.WALLET_LINKED,
      AirdropStatus.EMAIL_ERROR,
    ].includes(dropReservation.airdropStatus)
  ) {
    throw new ResourceError(RouteErrorCode.AIRDROP_ALREADY_CLAIMED);
  }

  dropReservation.airdropStatus = AirdropStatus.WALLET_LINKED;
  dropReservation.wallet = wallet;
  await dropReservation.update();

  const poapDrop = await new PoapDrop({}, { context }).populateById(
    dropReservation.poapDrop_id,
  );

  const collection = new Nft({
    key: env.APILLON_KEY,
    secret: env.APILLON_SECRET,
    logLevel: LogLevel.VERBOSE,
  }).collection(poapDrop.collectionUuid);

  try {
    const res = await collection.mint({
      receivingAddress: wallet,
      quantity: 1,
    });
    dropReservation.airdropStatus = res.success
      ? AirdropStatus.AIRDROP_COMPLETED
      : AirdropStatus.AIRDROP_ERROR;
  } catch (e) {
    writeLog(
      LogType.ERROR,
      'Error creating airdrop',
      'claim-airdrop.ts',
      'resolve',
      e,
    );
    dropReservation.airdropStatus = AirdropStatus.AIRDROP_ERROR;
    throw new Error(e);
  }

  await dropReservation.update();
  return res.respond(200, { success: true });
}
