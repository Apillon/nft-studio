import { Nft } from '@apillon/sdk';
import { Application } from 'express';
import { env } from '../config/env';
import { NextFunction, Request, Response } from '../http';
import { AuthenticateAdmin } from '../middlewares/authentication';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.get(
    '/nft-collections',
    AuthenticateAdmin,
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );

  app.get(
    '/nft-collections/:collectionUuid',
    AuthenticateAdmin,
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { params } = req;

  const nft = new Nft({
    key: env.APILLON_KEY,
    secret: env.APILLON_SECRET,
    apiUrl: env.APILLON_API_URL,
  });

  if (params.collectionUuid) {
    return res.respond(200, await nft.collection(params.collectionUuid).get());
  } else {
    const collections = await nft.listCollections({});
    return res.respond(200, collections);
  }
}
