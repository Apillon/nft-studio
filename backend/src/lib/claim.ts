import { LogLevel, Nft } from '@apillon/sdk';
import { env } from '../config/env';
import { User } from '../models/user';
import { LogType, writeLog } from './logger';
import { ResourceError } from './errors';
import { AirdropStatus, RouteErrorCode } from '../config/values';

export async function claim(user: User): Promise<string> {
  const collection = new Nft({
    apiUrl: env.APILLON_API_URL,
    key: env.APILLON_KEY,
    secret: env.APILLON_SECRET,
    logLevel: env.APP_ENV === 'production' ? LogLevel.ERROR : LogLevel.VERBOSE,
  }).collection(env.COLLECTION_UUID);

  validateAirdropStatus(user.airdrop_status);

  let response = null;
  try {
    const mintData = {
      receivingAddress: user.wallet,
      quantity: user.amount || 1,
    };

    if (user.nft_id) {
      mintData['idsToMint'] = [user.nft_id];
    }

    response = await collection.mint(mintData);
    user.airdrop_status = response.success
      ? AirdropStatus.AIRDROP_COMPLETED
      : AirdropStatus.AIRDROP_ERROR;
  } catch (e) {
    writeLog(
      LogType.ERROR,
      'Error creating airdrop',
      'claim-airdrop.ts',
      'resolve',
      e,
    );
    user.airdrop_status = AirdropStatus.AIRDROP_ERROR;
    throw new Error(e);
  }

  await user.update();
  if (response && response.success) {
    return response.transactionHash;
  } else {
    throw new ResourceError(RouteErrorCode.AIRDROP_ERROR);
  }
}

export function validateAirdropStatus(airdropStatus: AirdropStatus) {
  if (
    airdropStatus == AirdropStatus.TRANSACTION_CREATED ||
    airdropStatus == AirdropStatus.AIRDROP_COMPLETED
  ) {
    throw new ResourceError(RouteErrorCode.AIRDROP_ALREADY_CLAIMED);
  }

  if (airdropStatus == AirdropStatus.AIRDROP_CLAIM_EXPIRED) {
    throw new ResourceError(RouteErrorCode.AIRDROP_CLAIM_EXPIRED);
  }

  if (airdropStatus == AirdropStatus.IN_WAITING_LINE) {
    throw new ResourceError(RouteErrorCode.AIRDROP_IN_WAITING_LINE);
  }

  if (airdropStatus == AirdropStatus.AIRDROP_ERROR) {
    throw new ResourceError(RouteErrorCode.AIRDROP_ERROR);
  }
}

export function parseUrl(token: string) {
  const appUrl = new URL(env.APP_URL);
  const basePath = appUrl.pathname.replace(/\/$/, ''); // Remove trailing slash if present
  appUrl.pathname = `${basePath}/claim`; // Append '/claim' to the path
  appUrl.searchParams.set('nftToken', token);

  return appUrl.toString(); // Return the full URL as a string
}
