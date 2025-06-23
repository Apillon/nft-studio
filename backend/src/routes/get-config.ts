import { Application } from 'express';
import { AuthenticateAdmin } from '../middlewares/authentication';
import { NextFunction, Request, Response } from '../http';
import { isCustomSmtp } from '../lib/node-mailer';

export function inject(app: Application) {
  app.get(
    '/config',
    AuthenticateAdmin,
    (req: Request, res: Response, next: NextFunction) => {
      try {
        resolve(req, res);
      } catch (error) {
        next(error); // Pass the error to the error-handling middleware
      }
    },
  );
}

export function resolve(_req: Request, res: Response) {
  return res.respond(200, {
    isCustomSmtp: isCustomSmtp(),
  });
}
