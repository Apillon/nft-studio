import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { Project } from '@apillon/sdk';
import { env } from '../config/env';

export function inject(app: Application) {
  app.get('/project', (req: Request, res: Response, next: NextFunction) => {
    resolve(req, res).catch(next);
  });
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const balance = await new Project({
    apiUrl: env.APILLON_API_URL,
    key: env.APILLON_KEY,
    secret: env.APILLON_SECRET,
  }).getCreditBalance();

  return res.respond(200, {
    balance: balance,
  });
}
