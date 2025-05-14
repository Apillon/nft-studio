import { env } from '../config/env';
import { AirdropStatus, JobName, SqlModelStatus } from '../config/values';
import { Job } from '../models/job';
import { User } from '../models/user';
import { parseUrl } from './claim';
import { generateEmailAirdropToken } from './jwt';
import { LogType, writeLog } from './logger';
import { MySql } from './mysql';
import { SmtpSendTemplate } from './node-mailer';
import { dateToSqlString } from './sql-utils';

type JobType = Pick<Job, 'id' | 'name' | 'createTime' | 'parameters'>;

export const processJob = async (job: JobType, mysql: MySql) => {
  try {
    switch (job.name) {
      case JobName.SEND_CLAIM_EMAIL:
        await sendClaimEmails(job, mysql);
        break;
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }

    await mysql.paramExecute(
      `
            UPDATE job SET status = @status, finishedTime = NOW() WHERE id = @id
        `,
      {
        status: SqlModelStatus.COMPLETED,
        id: job.id,
      },
    );
  } catch (e) {
    await mysql.paramExecute(
      `UPDATE job SET status = @status, lastError = @error WHERE id = @id`,
      {
        status: SqlModelStatus.DELETED,
        error: e.message,
        id: job.id,
      },
    );
  }
};

const sendClaimEmails = async (job: JobType, mysql: MySql) => {
  let availableNftLeft = 0;

  if (env.MAX_SUPPLY) {
    const res = await mysql.paramExecute(
      `SELECT COUNT(id) as total FROM user WHERE
              airdrop_status IN (
                ${AirdropStatus.EMAIL_SENT},
                ${AirdropStatus.WALLET_LINKED},
                ${AirdropStatus.TRANSACTION_CREATED},
                ${AirdropStatus.AIRDROP_COMPLETED},
                ${AirdropStatus.IN_WAITING_LINE}
              )
              AND status = @status
            ;
           `,
      { status: SqlModelStatus.ACTIVE },
    );
    const numOfReservations = res[0].total;
    availableNftLeft = env.MAX_SUPPLY - numOfReservations;
  }

  const conn = await mysql.start();

  try {
    const users = (await mysql.paramExecute(
      `
        SELECT * FROM user
        WHERE airdrop_status = @airdrop_status
        AND status = @status
        AND email_start_send_time < @date
        FOR UPDATE;
    `,
      {
        airdrop_status: AirdropStatus.PENDING,
        status: SqlModelStatus.ACTIVE,
        date: job.createTime,
      },
      conn,
    )) as User[];

    if (users.length === 0) {
      return;
    }

    const updates = [];
    let currentUser: User;
    for (let i = 0; i < users.length; i++) {
      currentUser = users[i];
      try {
        if (!env.MAX_SUPPLY || i < availableNftLeft) {
          if (currentUser.email) {
            const token = generateEmailAirdropToken(currentUser.email);
            const res = await SmtpSendTemplate(
              [currentUser.email],
              'Claim your NFT',
              'en-signup-email-airdrop-claim',
              {
                appUrl: env.APP_URL,
                link: parseUrl(token),
                claimExpiresIn: env.CLAIM_EXPIRES_IN,
              },
              'Apillon',
            );

            updates.push(
              `(${currentUser.id}, '${currentUser.email}', ${res ? AirdropStatus.EMAIL_SENT : AirdropStatus.EMAIL_ERROR}, '${dateToSqlString(new Date())}')`,
            );
          }
        } else {
          //Currently, waiting line for airdrop is full.Send info email and set appropriate status
          if (currentUser.email) {
            const res = await SmtpSendTemplate(
              [currentUser.email],
              'You have been placed on a waitlist for NFT Airdrop token',
              'en-airdrop-waiting-line',
              {
                appUrl: env.APP_URL,
              },
              'Apillon',
            );

            updates.push(
              `(${currentUser.id}, '${currentUser.email}', ${
                res ? AirdropStatus.IN_WAITING_LINE : AirdropStatus.EMAIL_ERROR
              }, '${dateToSqlString(new Date())}')`,
            );
          }
        }
      } catch (e) {
        writeLog(LogType.ERROR, e, 'cron.ts', 'sendClaimEmails');
        updates.push(
          `(${currentUser.id}, '${currentUser.email}', ${AirdropStatus.EMAIL_ERROR}, '${dateToSqlString(new Date())}')`,
        );
      }
    }

    writeLog(LogType.ERROR, updates);

    if (updates.length > 0) {
      const sql = `
        INSERT INTO user (id, email, airdrop_status, email_sent_time)
        VALUES ${updates.join(',')}
        ON DUPLICATE KEY UPDATE
        airdrop_status = VALUES(airdrop_status),
        email_sent_time = VALUES(email_sent_time)`;

      await mysql.paramExecute(sql, null, conn);
    }

    await mysql.commit(conn);
  } catch (e) {
    writeLog(LogType.ERROR, e, 'cron.ts', 'sendClaimEmails');
    await mysql.rollback(conn);
    throw e;
  }
};
