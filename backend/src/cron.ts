import { CronJob } from 'cron';
import { MysqlConnectionManager } from './lib/mysql-connection-manager';
import { SmtpSendTemplate } from './lib/node-mailer';
import { env } from './config/env';
import { generateEmailAirdropToken } from './lib/jwt';
import { LogType, writeLog } from './lib/logger';
import { MySql } from './lib/mysql';
import { AirdropStatus, SqlModelStatus } from './config/values';
import { Job } from './models/job';
import { processJob } from './lib/job';
import { parseUrl } from './lib/claim';
import { INftActionResponse, LogLevel, Nft } from '@apillon/sdk';

export class Cron {
  private cronJobs: CronJob[] = [];

  constructor(private mysql: MySql) {
    MysqlConnectionManager.initialize(mysql);
    this.cronJobs.push(new CronJob('* * * * *', this.handleJobs, null, false));

    if (env.MAX_SUPPLY > 0) {
      this.cronJobs.push(
        new CronJob('* * * * *', this.processExpiredClaims, null, false),
      );
    }
  }

  start() {
    for (const cronJob of this.cronJobs) {
      cronJob.start();
    }
  }

  async stop() {
    for (const cronJob of this.cronJobs) {
      await cronJob.stop();
    }
    await MysqlConnectionManager.destroyInstance();
  }

  async processExpiredClaims() {
    const mysql = MysqlConnectionManager.getInstance();
    const conn = await mysql.start();

    try {
      const usersWithExpiredClaim = (
        await mysql.paramExecute(
          `SELECT * FROM user WHERE
          airdrop_status = @airdrop_status
          AND status = @status
          AND DATE_ADD(email_sent_time, INTERVAL ${env.CLAIM_EXPIRES_IN} HOUR) < NOW()
          FOR UPDATE
        ;
       `,
          {
            airdrop_status: AirdropStatus.EMAIL_SENT,
            status: SqlModelStatus.ACTIVE,
          },
          conn,
        )
      ).map((x) => x.id);

      if (usersWithExpiredClaim.length) {
        //Update those users to claim expired
        await mysql.paramExecute(
          `UPDATE user
          SET airdrop_status = @airdrop_status
          WHERE id IN (${usersWithExpiredClaim.join(',')})
        ;
       `,
          { airdrop_status: AirdropStatus.AIRDROP_CLAIM_EXPIRED },
          conn,
        );
        console.info(
          usersWithExpiredClaim.length +
            ' users updated to AIRDROP_CLAIM_EXPIRED',
        );

        //Get users in waiting line and set their airdrop status to PENDING, so that they will recieve email for claim
        const usersInWaitingLine = await mysql.paramExecute(
          `SELECT * FROM user WHERE
          airdrop_status = @airdrop_status
          AND status = @status
          ORDER BY createTime ASC
          LIMIT ${usersWithExpiredClaim.length}
          FOR UPDATE
        ;
       `,
          {
            airdrop_status: AirdropStatus.IN_WAITING_LINE,
            status: SqlModelStatus.ACTIVE,
          },
          conn,
        );

        console.info(
          `Num of users in waiting line: ${usersInWaitingLine.length}`,
        );

        if (usersInWaitingLine.length) {
          await mysql.paramExecute(
            `UPDATE user
                SET
                airdrop_status = @airdrop_status,
                email_sent_time = NOW()
                WHERE id IN (${usersInWaitingLine.map((x) => x.id).join(',')})
              ;
            `,
            { airdrop_status: AirdropStatus.EMAIL_SENT },
            conn,
          );
          console.info(
            `${usersInWaitingLine.map((x) => x.id).join(',')} should me moved from waiting line. Sending emails....`,
          );

          const collection = usersInWaitingLine.some(
            (user) => user.wallet && !user.email,
          )
            ? new Nft({
                apiUrl: env.APILLON_API_URL,
                key: env.APILLON_KEY,
                secret: env.APILLON_SECRET,
                logLevel:
                  env.APP_ENV === 'production'
                    ? LogLevel.ERROR
                    : LogLevel.VERBOSE,
              }).collection(env.COLLECTION_UUID)
            : null;

          let mintResponse: INftActionResponse;

          for (const user of usersInWaitingLine) {
            if (user.email) {
              try {
                const token = generateEmailAirdropToken(user.email);
                await SmtpSendTemplate(
                  [user.email],
                  'Claim your NFT',
                  'en-airdrop-claim',
                  {
                    appUrl: env.APP_URL,
                    link: parseUrl(token),
                    claimExpiresIn: env.CLAIM_EXPIRES_IN,
                  },
                  'Apillon',
                );
              } catch (err) {
                console.error(err);
                await mysql.paramExecute(
                  `UPDATE user
                    SET airdrop_status = @airdrop_status,
                    WHERE id = @user_id)
                ;
              `,
                  {
                    airdrop_status: AirdropStatus.EMAIL_ERROR,
                    user_id: user.id,
                  },
                  conn,
                );
              }
            } else if (user.wallet) {
              try {
                mintResponse = await collection.mint({
                  receivingAddress: user.wallet,
                  quantity: user.amount || 1,
                });
                if (mintResponse.success) {
                  await mysql.paramExecute(
                    `UPDATE user
                      SET airdrop_status = @airdrop_status,
                      WHERE id = @user_id)
                    ;
                  `,
                    {
                      airdrop_status: AirdropStatus.AIRDROP_COMPLETED,
                      user_id: user.id,
                    },
                    conn,
                  );
                } else {
                  await mysql.paramExecute(
                    `UPDATE user
                      SET airdrop_status = @airdrop_status,
                      WHERE id = @user_id)
                    ;
                  `,
                    {
                      airdrop_status: AirdropStatus.AIRDROP_ERROR,
                      user_id: user.id,
                    },
                    conn,
                  );
                }
              } catch (err) {
                console.error(err);
                await mysql.paramExecute(
                  `UPDATE user
                    SET airdrop_status = @airdrop_status,
                    WHERE id = @user_id)
                ;
              `,
                  {
                    airdrop_status: AirdropStatus.AIRDROP_ERROR,
                    user_id: user.id,
                  },
                  conn,
                );
              }
            }
          }
        }
      }

      await mysql.commit(conn);
    } catch (e) {
      writeLog(LogType.ERROR, e, 'cron.ts', 'processExpiredClaims');
      await mysql.rollback(conn);
    }
  }

  async handleJobs() {
    const mysql = MysqlConnectionManager.getInstance();

    const jobsToExecute = (await mysql.paramExecute(
      `SELECT * FROM job WHERE
        status = @status
        ORDER BY createTime ASC`,
      {
        status: SqlModelStatus.DRAFT,
      },
    )) as Job[];

    for (const job of jobsToExecute) {
      try {
        await processJob(job, mysql);
      } catch (e) {
        writeLog(LogType.ERROR, e, 'cron.ts', 'handleJobs');
      }
    }
  }
}
