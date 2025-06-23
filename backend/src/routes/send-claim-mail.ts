import { Application } from 'express';
import { NextFunction, Request, Response } from '../http';
import { AuthenticateAdmin } from '../middlewares/authentication';
import { Job } from '../models/job';
import { env } from '../config/env';
import { MysqlConnectionManager } from '../lib/mysql-connection-manager';
import { AirdropStatus, SqlModelStatus } from '../config/values';

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

  const mysql = await MysqlConnectionManager.getInstance();

  if (env.MAX_SUPPLY) {
    const mintedCount = await mysql.paramExecute(
      `SELECT COUNT(id) as total FROM user WHERE
              airdrop_status IN (
                ${AirdropStatus.AIRDROP_COMPLETED}               
              )
              AND status = @status
            ;
           `,
      { status: SqlModelStatus.ACTIVE },
    );
    const numOfReservations = mintedCount[0].total;
    const availableNftLeft = env.MAX_SUPPLY - numOfReservations;

    if (availableNftLeft <= 0) {
      return res.respond(400, {
        error: 'No NFTs left to claim',
      });
    }

    const usersToAddToBatch = await mysql.paramExecute(
      `SELECT COUNT(id) as total from user
      WHERE airdrop_status = @airdrop_status
      AND status = @status
     `,
      {
        airdrop_status: AirdropStatus.PENDING,
        status: SqlModelStatus.ACTIVE,
      },
    );

    const numOfUsersToAdd = usersToAddToBatch[0].total;

    if (numOfUsersToAdd > availableNftLeft) {
      return res.respond(400, {
        error: 'Not enough NFTs left to claim for all users',
      });
    }
  }

  const job = new Job({}, { context });

  await job.sendClaimEmails();

  return res.respond(200, { success: true });
}
