import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { AirdropStatus, RouteErrorCode } from '../config/values';
import { ResourceError, ValidationError } from '../lib/errors';
import { User } from '../models/user';
import { claim, validateEvmWallet } from '../lib/claim';

/**∂
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post('/claim', (req: Request, res: Response, next: NextFunction) => {
    resolve(req, res).catch(next);
  });
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  const wallet = body.address;
  validateEvmWallet(wallet, body.signature, body.timestamp);

  const user = await new User({}, context).populateByWallet(wallet);
  if (user.exists()) {
    throw new ResourceError(RouteErrorCode.AIRDROP_ALREADY_CLAIMED);
  }

  user.airdrop_status = AirdropStatus.WALLET_LINKED;
  user.amount = 1;
  user.wallet = wallet;
  user.signature = body.signature;

  try {
    await user.validate();
    await user.create();
  } catch (err) {
    await user.handle(err);
  }

  const txHash = await claim(user);
  user.tx_hash = txHash;
  await user.update();

  return res.respond(200, {
    success: true,
    transactionHash: txHash,
  });
}
