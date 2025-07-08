import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { PopulateStrategy, ValidatorErrorCode } from '../config/values';
import { AuthenticateAdmin } from '../middlewares/authentication';
import { BatchUsers } from '../models/batch-users';
import { ResourceError, ValidationError } from '../lib/errors';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post(
    '/users',
    AuthenticateAdmin,
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  const usersToCreate = body.users;

  const emailSet = new Set<string>();
  const walletSet = new Set<string>();

  for (const user of usersToCreate) {
    const { email, wallet } = user;

    if (email && emailSet.has(email)) {
      throw new ResourceError(ValidatorErrorCode.DUPLICATED_MAIL);
    }
    if (wallet && walletSet.has(wallet)) {
      throw new ResourceError(ValidatorErrorCode.DUPLICATED_WALLET);
    }

    if (email) {
      emailSet.add(email);
    }
    if (wallet) {
      walletSet.add(wallet);
    }
  }

  const users = new BatchUsers({}, context).populate(
    body,
    PopulateStrategy.ADMIN,
  );

  try {
    await users.validate();
  } catch (err) {
    await users.handle(err);
  }

  if (users.isValid()) {
    await users.create();
    return res.respond(201, { success: 'ok' });
  } else {
    throw new ValidationError(users, context, 'create-user');
  }
}
