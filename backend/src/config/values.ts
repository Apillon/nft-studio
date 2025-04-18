/**
 * Serialized strategy.
 */
export enum SerializedStrategy {
  PROFILE = 'profile',
  DB = 'db',
  EXTENDED_DB = 'extended_db',
  ADMIN = 'admin',
  UPDATE_DB = 'update_db',
}

/**
 * Populate strategy.
 */
export enum PopulateStrategy {
  ADMIN = 'admin',
  PROFILE = 'profile',
  DB = 'db',
}

/**
 * Default user roles
 */
export enum DefaultUserRoles {
  ADMIN = 1,
  USER = 2,
}

/**
 * Default pagination values.
 */
export enum PaginationValues {
  PAGE_MAX_LIMIT = 100,
  PAGE_DEFAULT_LIMIT = 25,
}

export enum AppEnvironment {
  LOCAL_DEV = 'local',
  TEST = 'testing',
  DEV = 'development',
  STG = 'staging',
  PROD = 'production',
}

/**
 * Request Token types.
 */
export enum RequestToken {
  AUTH_ADMIN = 'authAdmin',
  AIRDROP_EMAIL = 'airdropEmail',
  DROP_RESERVATION = 'dropReservation',
}

/**
 * System Error codes.
 */
export enum SystemErrorCode {
  UNHANDLED_SYSTEM_ERROR = 500000,
  DATABASE_ERROR = 500001,
  EMAIL_SENDING_ERROR = 500002,
}

/**
 * Authorization Error codes.
 */
export enum AuthorizationErrorCode {
  MISSING_AUTH_TOKEN = 403001,
  UNKNOWN_USER = 403002,
  UNAUTHORIZED = 403003,
  NOT_ACTIVATED = 403004,
  INVALID_TOKEN = 403005,
  TOKEN_EXPIRED = 403006
}

/**
 * Validator Error codes.
 */
export enum ValidatorErrorCode {
  DEFAULT = 422000,
  PROFILE_EMAIL_NOT_PRESENT = 422001,
  PROFILE_EMAIL_NOT_VALID = 422002,
  PROFILE_EMAIL_ALREADY_TAKEN = 422003,
  USERS_NOT_PRESENT = 422004,
  CAPTCHA_NOT_CONFIGURED = 422005,
  CAPTCHA_NOT_PRESENT = 422006,
  CAPTCHA_INVALID = 422007,
  USER_ALREADY_MINTED = 422008,
  WALLET_BELONGS_TO_ANOTHER_USER = 422009,
  POAP_DROP_REQUIRED_DATA_NOT_PRESENT = 422010,
  DROP_RESERVATION_REQUIRED_DATA_NOT_PRESENT = 422011,
  DATA_MODEL_STATUS_MISSING = 422100,
  DATA_MODEL_INVALID_STATUS = 422101,
}

/**
 * Route Error codes.
 */
export enum RouteErrorCode {
  INVALID_REQUEST = 400000,
  PROFILE_NOT_IDENTIFIED = 400001,
  PROFILE_CREDENTIALS_INVALID = 400002,
  REQUEST_TOKEN_INVALID = 400003,
  USER_DOES_NOT_EXIST = 400004,
  SIGNATURE_NOT_PRESENT = 400005,
  REQUEST_TOKEN_NOT_PRESENT = 400006,
  AIRDROP_ALREADY_CLAIMED = 400007,
  INVALID_SIGNATURE = 400008,
  INVALID_ADMIN = 400009,
  AIRDROP_ERROR = 400010,
  POAP_DROP_DOES_NOT_EXISTS = 400011,
  DROP_ALREADY_RESERVED = 400012,
  DROP_RESERVATION_DOES_NOT_EXISTS = 400013,
}

export enum AirdropStatus {
  PENDING = 1,
  EMAIL_SENT = 2,
  EMAIL_ERROR = 3,
  WALLET_LINKED = 4,
  TRANSACTION_CREATED = 5,
  AIRDROP_COMPLETED = 6,
  AIRDROP_ERROR = 7,
}