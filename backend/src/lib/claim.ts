import { LogLevel, Nft } from '@apillon/sdk';
import { env } from '../config/env';
import { AirdropStatus, User } from '../models/user';
import { LogType, writeLog } from './logger';
import { ResourceError } from './errors';
import { RouteErrorCode } from '../config/values';

export async function claim(user: User): Promise<string> {
  const collection = new Nft({
    key: env.APILLON_KEY,
    secret: env.APILLON_SECRET,
    logLevel: LogLevel.VERBOSE,
  }).collection(env.COLLECTION_UUID);

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
    user.airdrop_status = response.success ? AirdropStatus.AIRDROP_COMPLETED : AirdropStatus.AIRDROP_ERROR;
  } catch (e) {
    writeLog(LogType.ERROR, 'Error creating airdrop', 'claim-airdrop.ts', 'resolve', e);
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
