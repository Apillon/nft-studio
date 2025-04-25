import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { AirdropStatus, RouteErrorCode } from '../config/values';
import { ResourceError } from '../lib/errors';
import { User } from '../models/user';
import { validateAirdropStatus, validateEvmWallet } from '../lib/claim';

/**∂
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post('/claim-validate', (req: Request, res: Response, next: NextFunction) => {
    resolve(req, res).catch(next);
  });
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  const wallet = body.address;
  validateEvmWallet(wallet, body.signature, body.timestamp);

  const user = await new User({}, context).populateByWallet(wallet);
  if (!user.exists()) {
    throw new ResourceError(RouteErrorCode.WALLET_NOT_VALID);
  }

  validateAirdropStatus(user.airdrop_status);

  user.airdrop_status = AirdropStatus.WALLET_LINKED;
  await user.update();

  return res.respond(200, {
    success: true,
  });
}
