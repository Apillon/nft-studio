import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { generateDropReservationToken } from '../lib/jwt';
import { AuthenticateAdmin } from '../middlewares/authentication';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.get(
    '/drop-reservation-token',
    AuthenticateAdmin,
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function resolve(req: Request, res: Response): Promise<void> {
  return res.respond(200, { token: generateDropReservationToken() });
}
