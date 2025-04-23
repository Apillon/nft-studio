import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { User } from '../models/user';
import { ResourceError } from '../lib/errors';
import { RouteErrorCode } from '../config/values';
import { claim } from '../lib/claim';

export function inject(app: Application) {
  app.post('/users/claim-admin', (req: Request, res: Response, next: NextFunction) => {
    resolve(req, res).catch(next);
  });
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  const user = await new User({}, context).populateById(body.userId);

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
