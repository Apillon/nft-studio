import { Application } from 'express';
import { AuthorizationErrorCode, SerializedStrategy } from '../config/values';
import { NextFunction, Request, Response } from '../http';
import { ResourceError } from '../lib/errors';
import { DropReservation } from '../models/drop-reservation';
import { readDropReservationToken } from '../lib/jwt';
import { createDropReservation } from '../lib/create-drop-reservation';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post(
    '/poap-drops/:id/reserve-drop',
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, params, body } = req;
  //validate token
  const token = body.token;
  const jwtData = readDropReservationToken(token);
  if (!jwtData) {
    throw new ResourceError(AuthorizationErrorCode.INVALID_TOKEN);
  }

  const dropReservation = await createDropReservation(
    context,
    +params.id,
    body as DropReservation,
  );

  return res.respond(200, dropReservation.serialize(SerializedStrategy.ADMIN));
}
