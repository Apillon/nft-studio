import { Application } from 'express';
import { RouteErrorCode } from '../config/values';
import { NextFunction, Request, Response } from '../http';
import { ResourceError } from '../lib/errors';
import { generateDropReservationToken } from '../lib/jwt';
import { AuthenticateAdmin } from '../middlewares/authentication';
import { PoapDrop } from '../models/poap-drop';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.get(
    '/poap-drops/:id/drop-reservation-token',
    AuthenticateAdmin,
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, params, query } = req;
  //Check poap drop
  const poapDrop = await new PoapDrop({}, { context }).populateById(+params.id);

  if (!poapDrop.exists()) {
    throw new ResourceError(RouteErrorCode.POAP_DROP_DOES_NOT_EXISTS);
  }
  //Maybe add some validation here. Is it possible to generate token outside drop start and end date ...

  return res.respond(200, { token: await generateDropReservationToken() });
}
