import { Application } from 'express';
import { env } from '../config/env';
import { AirdropStatus, ClaimType, RouteErrorCode } from '../config/values';
import { NextFunction, Request, Response } from '../http';
import { claim } from '../lib/claim';
import { ResourceError } from '../lib/errors';
import { readEmailAirdropToken } from '../lib/jwt';
import { User } from '../models/user';
import { validateEvmWallet } from '../lib/wallet-verify';
import { ClaimGuard } from '../middlewares/claim';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post(
    '/claim-airdrop',
    ClaimGuard,
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  const wallet = body.address;
  validateEvmWallet(wallet, body.signature, body.timestamp, body.isSmart);

  if (!body.jwt) {
    throw new ResourceError(RouteErrorCode.REQUEST_TOKEN_NOT_PRESENT);
  }

  const { email } = readEmailAirdropToken(body.jwt);
  if (!email) {
    throw new ResourceError(RouteErrorCode.REQUEST_TOKEN_INVALID);
  }

  const user = await new User({}, context).populateByEmail(email);

  if (!user.exists()) {
    if (env.CLAIM_TYPE === ClaimType.POAP) {
      throw new ResourceError(RouteErrorCode.DROP_RESERVATION_DOES_NOT_EXISTS);
    } else {
      throw new ResourceError(RouteErrorCode.USER_DOES_NOT_EXIST);
    }
  }

  user.airdrop_status = AirdropStatus.WALLET_LINKED;
  user.wallet = wallet;

  await user.validateWallet();
  await user.update();

  const txHash = await claim(user);
  user.tx_hash = txHash;
  await user.update();

  return res.respond(200, {
    success: true,
    transactionHash: txHash,
  });
}
