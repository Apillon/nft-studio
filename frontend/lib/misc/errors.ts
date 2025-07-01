/**
 * Get assorted error messages: messages for fields (validation) and general errors
 */
export function apiError(
  err: {
    data: {
      code?: number;
      message?: string;
      path?: string[];
      errors?: { code: number; message: string; path: string[] }[];
    };
  },
  getMessage = true,
  defaultMessage = ''
): { errors: (string | number)[]; fields: { [k: string]: string | number } } {
  if (err?.data?.code) {
    return {
      errors: [getMessage ? getErrorMsg(err.data.code, defaultMessage) : err.data.code],
      fields: {},
    };
  }

  if (!err?.data?.errors || !Array.isArray(err.data.errors) || !err.data.errors.length) {
    return { errors: [getMessage ? getErrorMsg(undefined, defaultMessage) : 500001], fields: {} };
  }

  const res = {
    errors: [] as (string | number)[],
    fields: {} as { [k: string]: string | number },
  };

  err.data.errors.forEach(e => {
    if (e.path && e.path.length && typeof e.path[0] === 'string') {
      res.fields[e.path[0]] = getMessage ? getErrorMsg(e.code, defaultMessage) : e.code;
    } else {
      res.errors.push(getMessage ? getErrorMsg(e.code, defaultMessage) : e.code);
    }
  });

  return res;
}

export function getErrorMsg(code = 500001, defaultMessage = '') {
  if (code === 500001 && defaultMessage) {
    return defaultMessage;
  }

  if (!(code in ErrorCodes)) {
    return defaultMessage || ErrorCodes[500001];
  }

  return ErrorCodes[code];
}

/**
 * Define message for each error
 */
export const ErrorCodes = {
  // RouteErrorCode
  400000: 'Invalid request. Please check your input and try again.',
  400001: 'Profile not identified. Please ensure your profile is set up correctly.',
  400002: 'Invalid profile credentials. Please verify your credentials and try again.',
  400003: 'Request token is invalid. Please request a new token.',
  400004: 'User does not exist. Please log in with a different wallet.',
  400005: 'Missing signature. Please provide a valid signature.',
  400006: 'Token does not exist. Please verify the token and try again.',
  400007: 'NFT has already been claimed. You cannot claim it again.',
  400009: 'Invalid admin. Please log in with a different wallet.',
  400011: 'Wallet is not eligible. Please try using another wallet.',
  400012: 'You have already created a reservation. Please check your email for details.',
  400013: 'Reservation does not exist. Please create a new reservation.',
  400014: 'Airdrop claim has expired.',
  400015: 'Airdrop is already in waiting line.',
  403001: 'Authentication token is missing. Please log in to continue.',
  403002: 'Unknown user. Please verify your credentials.',
  403003: 'Unauthorized access. You do not have permission to perform this action.',
  403004: 'Account not activated. Please activate your account to proceed.',
  422001: 'Email is missing. Please provide a valid email address.',
  422002: 'Invalid email address. Please check and try again.',
  422003: 'User with this e-mail is already signed up. Please add different recipient.',
  422004: 'User does not exist. Please log in with a different wallet.',
  422005: 'Captcha is not configured. Please contact support.',
  422006: 'Captcha verification is required. Please solve the captcha.',
  422007: 'Captcha error. Please solve the captcha again.',
  422008: 'User has already minted. Duplicate minting is not allowed.',
  422009: 'User with this wallet address already exists. Please use a different wallet.',
  422013: 'Wallet address is not valid.',
  422014: 'Email or wallet address is required. Please provide one of them.',

  // SystemErrorCode
  500000: 'DEFAULT_SYSTEM_ERROR',
  500001: 'There was an error with your request. Please try again later.',
  500002: 'SQL_SYSTEM_ERROR',
  500003: 'VECTOR_DB_SYSTEM_ERROR',
  500004: 'EMAIL_SYSTEM_ERROR',
} as { [k: number]: string };
