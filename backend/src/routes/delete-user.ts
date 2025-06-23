import { NextFunction, Request, Response } from '../http';
import { Application } from 'express';
import { AuthenticateAdmin } from '../middlewares/authentication';
import { User } from '../models/user';
import { ValidationError } from '../lib/errors';

export function inject(app: Application) {
  app.delete(
    '/users/:userId',
    AuthenticateAdmin,
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { params, context } = req;
  const userId = params.userId;
  const user = await new User({}, context).populateById(+userId);

  if (!user.exists()) {
    return res.respond(404, { error: 'User not found' });
  }

  try {
    await user.removeFromDb();
    return res.respond(200, { success: 'User deleted successfully' });
  } catch {
    throw new ValidationError(user, context, 'delete-user');
  }
}
