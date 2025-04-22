import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { RouteErrorCode } from '../config/values';
import { ResourceError } from '../lib/errors';
import { User } from '../models/user';
import { Identity } from '@apillon/sdk';

/**∂
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post('/claim/validate', (req: Request, res: Response, next: NextFunction) => {
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

  const user = await new User({}, context).populateByWallet(body.address);

  if (!user.exists()) {
    throw new ResourceError(RouteErrorCode.WALLET_NOT_VALID);
  }

  await user.update();

  return res.respond(200, {
    success: true,
  });
}
