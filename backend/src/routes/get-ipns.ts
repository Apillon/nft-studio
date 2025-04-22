import { Storage } from '@apillon/sdk';
import { Application } from 'express';
import { env } from '../config/env';
import { NextFunction, Request, Response } from '../http';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.get('/ipns-link/:ipns', (req: Request, res: Response, next: NextFunction) => {
    resolve(req, res).catch(next);
  });
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const storage = new Storage({
    key: env.APILLON_KEY,
    secret: env.APILLON_SECRET,
    apiUrl: env.APILLON_API_URL,
  });

  const ipns = await storage.generateIpfsLink(req.params.ipns, 'ipns');

  return res.respond(200, { link: ipns });
}
