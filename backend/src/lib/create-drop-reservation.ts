import { env } from '../config/env';
import { AirdropStatus, RouteErrorCode } from '../config/values';
import { Context } from '../context';
import { DropReservation } from '../models/drop-reservation';
import { PoapDrop } from '../models/poap-drop';
import { ResourceError } from './errors';
import { generateEmailAirdropPoapToken } from './jwt';
import { SmtpSendTemplate } from './node-mailer';

export const createDropReservation = async (
  context: Context,
  poapDropId: number,
  body: DropReservation,
) => {
  const poapDrop = await new PoapDrop({}, { context }).populateById(poapDropId);
  if (!poapDrop.exists()) {
    throw new ResourceError(RouteErrorCode.POAP_DROP_DOES_NOT_EXISTS);
  }

  //check if reservation for that email already exists
  let dropReservation = await new DropReservation(
    {},
    { context },
  ).populateByDropAndEmail(poapDrop.id, body.email);

  if (dropReservation.exists()) {
    throw new ResourceError(RouteErrorCode.DROP_ALREADY_RESERVED);
  }

  dropReservation = new DropReservation(
    {
      ...body,
      poapDrop_id: poapDrop.id,
    },
    { context },
  );
  await dropReservation.validateAndCreate();

  const emailAirdropToken = generateEmailAirdropPoapToken(
    dropReservation.email,
    dropReservation.poapDrop_id,
  );

  try {
    console.warn(`${env.APP_URL}/claim?token=${emailAirdropToken}`);
    //Send email
    await SmtpSendTemplate(
      [dropReservation.email],
      'Claim your proof of attendance NFT',
      'en-airdrop-claim',
      {
        link: `${env.APP_URL}/claim?token=${emailAirdropToken}`,
      },
    );

    dropReservation.airdropStatus = AirdropStatus.EMAIL_SENT;
    await dropReservation.update();
  } catch (err) {
    console.error('Error sending mail and updating drop reservation', err);
    dropReservation.airdropStatus = AirdropStatus.EMAIL_ERROR;
    await dropReservation.update();
  }

  return dropReservation;
};
