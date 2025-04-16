export interface ConfigInterface {
  APP_URL: string;
  API_BASE: string;
  CLAIM_START: number;
  CHAIN_ID: number;
  CAPTCHA_KEY: string;
  CONTRACT_ADDRESS: string | null;
  METADATA_BASE_URI: string | null;
  METADATA_TOKEN: string | null;
}

export type AuthResponseProfile = {
  id: number;
  authUser: { id: number; status: number; username: string; email?: string; roles: any[]; permissions: any[] };
};

export type AuthResponse = { profile: AuthResponseProfile; authToken: { status: boolean; data: string } };

declare global {
  type CsvItem = {
    email: string | null;
    email_start_send_time: string;
    email_send_time?: string | null;
    nft_id?: number | null;
    tx_hash?: string | null;
    wallet?: string | null;
    airdrop_status?: number | null;
    status?: number | null;
  };

  /** Papa parser */
  type CsvFileData<T> = {
    data: Array<T>;
    errors: Array<any>;
    meta: {
      aborted: boolean;
      cursor: number;
      delimeter: string;
      fields: Array<string>;
      linebreak: string;
      truncated: boolean;
    };
  };

  /** Response */
  type GeneralResponse<T> = { data: T; id: string; status: number };
  type GeneralItemsResponse<T> = { data: { items: Array<T>; total: number }; id: string; status: number };
  type SuccessResponse = GeneralResponse<{ success: boolean }>;
  interface WhitelistClaimInterface {
    amount: number;
    createTime: string;
    id: number;
    signature: string;
    status: number;
    updateTime: string;
    wallet: string;
  }
  type WhitelistClaimResponse = GeneralResponse<WhitelistClaimInterface>;
  type ClaimResponse = GeneralResponse<{ success: boolean; transactionHash: string }>;

  interface UserInterface {
    airdrop_status: number;
    createTime?: string;
    email: string | null;
    email_sent_time: string | null;
    email_start_send_time: string | null;
    id?: number | null;
    nft_id?: number | null;
    status?: number;
    tx_hash?: string | null;
    updateTime?: string;
    wallet: string | null;
  }

  type UsersResponse = GeneralItemsResponse<UserInterface>;

  type LoginInterface = { jwt: string };
  type LoginResponse = GeneralResponse<LoginInterface>;

  interface StatisticsInterface {
    airdropped: number;
    emailSent: number;
    pending: number;
    threwError: number;
    total: number;
    walletLinked: number;
  }

  type StatisticsResponse = GeneralResponse<StatisticsInterface>;

  type Metadata = { name: string; description: string; image: string };
}
