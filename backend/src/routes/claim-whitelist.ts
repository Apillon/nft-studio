import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { RouteErrorCode } from '../config/values';
import { ResourceError } from '../lib/errors';
import { User } from '../models/user';
import { claim } from '../lib/claim';
import { validateEvmWallet } from '../lib/wallet-verify';

/**∂
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post('/claim-whitelist', (req: Request, res: Response, next: NextFunction) => {
    resolve(req, res).catch(next);
  });
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  const wallet = body.address;
  validateEvmWallet(wallet, body.signature, body.timestamp, body.isSmart);

  const user = await new User({}, context).populateByWallet(wallet);

  if (!user.exists()) {
    throw new ResourceError(RouteErrorCode.WALLET_NOT_VALID);
  }

  const txHash = await claim(user);
  user.tx_hash = txHash;
  await user.update();

  return res.respond(200, {
    success: true,
    transactionHash: txHash,
  });
}
