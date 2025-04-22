import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { AuthenticateAdmin } from '../middlewares/authentication';
import { Job } from '../models/job';

export function inject(app: Application) {
  app.post(
    '/send-claim-mail',
    AuthenticateAdmin,
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context } = req;

  const job = new Job({}, { context });

  await job.sendClaimEmails();

  return res.respond(200, { success: true });
}
