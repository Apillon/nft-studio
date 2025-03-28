import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { PopulateStrategy } from '../config/values';
import { ValidationError } from '../lib/errors';
import { User } from '../models/user';
import { checkCaptcha } from '../lib/captcha';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post(
    '/users/signup-email-claim',
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  await checkCaptcha(body.token);

  const user = new User({}, context).populate(body, PopulateStrategy.PROFILE);

  try {
    await user.validate();
  } catch (err) {
    await user.handle(err);
  }

  if (user.isValid()) {
    await user.create();
    return res.respond(201, { success: 'ok' });
  } else {
    throw new ValidationError(user, context, 'create-user');
  }
}
