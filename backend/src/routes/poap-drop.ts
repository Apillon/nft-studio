import { Application } from 'express';
import { PopulateStrategy, RouteErrorCode, SerializedStrategy } from '../config/values';
import { NextFunction, Request, Response } from '../http';
import { PoapDrop } from '../models/poap-drop';
import { ResourceError } from '../lib/errors';
import { DropReservation } from '../models/drop-reservation';
import { AuthenticateAdmin } from '../middlewares/authentication';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.get('/poap-drops', AuthenticateAdmin, (req: Request, res: Response, next: NextFunction) => {
    getPoapDrops(req, res).catch(next);
  });

  app.get('/poap-drops/:dropId', AuthenticateAdmin, (req: Request, res: Response, next: NextFunction) => {
    getPoapDrops(req, res).catch(next);
  });

  app.delete('/poap-drops/:dropId', AuthenticateAdmin, (req: Request, res: Response, next: NextFunction) => {
    deletePoapDrop(req, res).catch(next);
  });

  app.put('/poap-drops', AuthenticateAdmin, (req: Request, res: Response, next: NextFunction) => {
    putPoapDrop(req, res).catch(next);
  });

  app.get(
    '/poap-drops/:dropId/drop-reservations',
    AuthenticateAdmin,
    (req: Request, res: Response, next: NextFunction) => {
      getPoapDropReservations(req, res).catch(next);
    }
  );
}

export async function getPoapDrops(req: Request, res: Response): Promise<void> {
  const { context, params, query } = req;
  if (params.dropId) {
    return res.respond(
      200,
      (await new PoapDrop({}, { context }).populateById(+params.dropId)).serialize(SerializedStrategy.ADMIN)
    );
  } else {
    return res.respond(200, await new PoapDrop({}, { context }).getList(query));
  }
}

export async function putPoapDrop(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  const poapDrop = new PoapDrop({}, { context });

  if (!body.id) {
    //Create
    poapDrop.populate(body, PopulateStrategy.ADMIN);
    await poapDrop.validateAndCreate();
    return res.respond(201, poapDrop.serialize(SerializedStrategy.ADMIN));
  } else {
    //Update
    await poapDrop.populateById(body.id);
    if (!poapDrop.exists()) {
      throw new ResourceError(RouteErrorCode.POAP_DROP_DOES_NOT_EXISTS);
    }

    poapDrop.populate(body, SerializedStrategy.ADMIN);

    await poapDrop.validateAndUpdate();
    return res.respond(201, poapDrop.serialize(SerializedStrategy.ADMIN));
  }
}

export async function deletePoapDrop(req: Request, res: Response): Promise<void> {
  const { context, params, query } = req;
  if (params.dropId) {
    const poapDrop = await new PoapDrop({}, { context }).populateById(+params.dropId);
    if (poapDrop.exists()) {
      await poapDrop.removeFromDb();
    }
    return res.respond(200, { success: true });
  }
}

export async function getPoapDropReservations(req: Request, res: Response): Promise<void> {
  const { context, params, query } = req;
  query.poapDrop_id = params.dropId;
  return res.respond(200, await new DropReservation({}, { context }).getList(query));
}