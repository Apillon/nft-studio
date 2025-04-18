import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { RouteErrorCode, ValidatorErrorCode } from '../config/values';
import { ResourceError } from '../lib/errors';
import { readEmailAirdropToken } from '../lib/jwt';
import { AirdropStatus, User } from '../models/user';
import { Identity, LogLevel, Nft } from '@apillon/sdk';
import { LogType, writeLog } from '../lib/logger';
import { env } from '../config/env';
import { claim } from '../lib/claim';

/**∂
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post('/users/claim', (req: Request, res: Response, next: NextFunction) => {
    resolve(req, res).catch(next);
  });
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  if (!body.signature || !body.address) {
    throw new ResourceError(RouteErrorCode.SIGNATURE_NOT_PRESENT);
  }

  const identity = new Identity(null);
  const { isValid } = await identity.validateEvmWalletSignature({
    walletAddress: body.address,
    signature: body.signature,
    signatureValidityMinutes: 10,
    message: `test\n${body.timestamp}`,
    timestamp: body.timestamp,
  });

  if (!isValid) {
    throw new ResourceError(RouteErrorCode.SIGNATURE_NOT_PRESENT);
  }

  const user = await new User({}, context).populateByWallet(body.address);

  if (user.exists()) {
    throw new ResourceError(RouteErrorCode.AIRDROP_ALREADY_CLAIMED);
  }

  user.airdrop_status = AirdropStatus.WALLET_LINKED;
  user.amount = 1;
  user.wallet = body.address;
  user.signature = body.signature;

  await user.update();

  const txHash = await claim(user);
  user.tx_hash = txHash;
  await user.update();

  return res.respond(200, {
    success: 'ok',
    transactionHash: txHash,
  });
}
