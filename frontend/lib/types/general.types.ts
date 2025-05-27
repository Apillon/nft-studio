import type { TagProps } from 'naive-ui';
import type { Address } from 'viem';

export type AuthResponseProfile = {
  id: number;
  authUser: { id: number; status: number; username: string; email?: string; roles: any[]; permissions: any[] };
};

export type AuthResponse = { profile: AuthResponseProfile; authToken: { status: boolean; data: string } };

declare global {
  type TagType = TagProps['type'];

  type CsvItem = {
    amount?: number | null;
    email?: string | null;
    email_start_send_time?: string;
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
  type BalanceResponse = GeneralResponse<{ balance: number }>;
  type IpnsResponse = GeneralResponse<{ link: string }>;
  type TokenResponse = GeneralResponse<{ token: string }>;
  type ClaimResponse = GeneralResponse<{ success: boolean; transactionHash: Address }>;

  interface UserInterface {
    airdrop_status: number;
    amount: number;
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

  type UserResponse = GeneralResponse<UserInterface>;
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

  type Metadata = { id: number; name?: string | null; description?: string | null; image?: string | null };
}
