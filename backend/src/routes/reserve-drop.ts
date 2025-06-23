import { Application } from 'express';
import {
  AirdropStatus,
  AuthorizationErrorCode,
  RouteErrorCode,
  SerializedStrategy,
} from '../config/values';
import { NextFunction, Request, Response } from '../http';
import { ResourceError } from '../lib/errors';
import {
  generateEmailAirdropToken,
  readDropReservationToken,
} from '../lib/jwt';
import { User } from '../models/user';
import { SmtpSendTemplate } from '../lib/node-mailer';
import { parseUrl } from '../lib/claim';

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.post(
    '/reserve-drop',
    (req: Request, res: Response, next: NextFunction) => {
      resolve(req, res).catch(next);
    },
  );
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { context, body } = req;
  //validate token
  const token = body.token;
  const jwtData = readDropReservationToken(token);
  if (!jwtData) {
    throw new ResourceError(AuthorizationErrorCode.INVALID_TOKEN);
  }

  let user = await new User({}, context).populateByEmail(body.email);

  if (user.exists()) {
    throw new ResourceError(RouteErrorCode.DROP_ALREADY_RESERVED);
  }

  user = new User(body, context);
  await user.create();

  const emailAirdropToken = generateEmailAirdropToken(user.email);

  try {
    //Send email
    await SmtpSendTemplate(
      [user.email],
      'Claim your proof of attendance NFT',
      'en-airdrop-claim',
      {
        link: parseUrl(emailAirdropToken),
      },
    );

    user.airdrop_status = AirdropStatus.EMAIL_SENT;
    await user.update();
  } catch (err) {
    console.error('Error sending mail and updating drop reservation', err);
    user.airdrop_status = AirdropStatus.EMAIL_ERROR;
    await user.update();
  }

  return res.respond(200, user.serialize(SerializedStrategy.ADMIN));
}
