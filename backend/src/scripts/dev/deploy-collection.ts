import { CollectionType, EvmChain, LogLevel, Nft } from '@apillon/sdk';
import { env } from '../../config/env';

(async () => {
  const nft = new Nft({
    apiUrl: env.APILLON_API_URL,
    key: env.APILLON_KEY,
    secret: env.APILLON_SECRET,
    logLevel: env.APP_ENV === 'production' ? LogLevel.ERROR : LogLevel.VERBOSE,
  });

  const collection = await nft.create({
    chain: EvmChain.MOONBASE,
    collectionType: CollectionType.GENERIC,
    name: 'Drop test',
    description: 'Specific ID drop test',
    symbol: 'DT',
    royaltiesFees: 0,
    royaltiesAddress: '0x0000000000000000000000000000000000000000',
    baseUri: 'https://test.com/metadata/',
    baseExtension: '.json',
    maxSupply: 0,
    isRevokable: false,
    isSoulbound: false,
    isAutoIncrement: false, // set how you want
    drop: false,
  });
  console.log(collection.serialize());
})().catch((err) => console.log(err));
