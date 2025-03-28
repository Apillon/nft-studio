import { verify } from 'hcaptcha';
import { AppEnvironment, ValidatorErrorCode } from '../config/values';
import { env } from '../config/env';
import { ResourceError } from './errors';

export type Captcha = { eKey: string; token: string };
/**
 * Given a captcha token, verify if the token is valid and the captcha has been successfully solved by the user
 * @param {string} captchaToken
 * @returns {Promise<boolean>}
 */
export async function checkCaptcha(captchaToken: string): Promise<boolean> {
  //Skip check for local_dev and test environment
  if (
    [AppEnvironment.LOCAL_DEV, AppEnvironment.TEST].includes(
      env.APP_ENV as AppEnvironment,
    )
  ) {
    return true;
  }

  //If captcha is not configured, skip check
  if (!env.CAPTCHA_SECRET) {
    return true;
  }

  if (!captchaToken) {
    throwCodeException(ValidatorErrorCode.CAPTCHA_NOT_PRESENT);
  }

  await verifyCaptcha(captchaToken);

  return true;
}

async function verifyCaptcha(
  token: string,
  secret: string = env.CAPTCHA_SECRET,
): Promise<boolean> {
  try {
    return (await verify(secret, token)).success;
  } catch (err) {
    console.error('Error verifying captcha!', err);
    throwCodeException(ValidatorErrorCode.CAPTCHA_INVALID);
  }
}

function throwCodeException(code: ValidatorErrorCode) {
  throw new ResourceError(code, null, 'checkCaptcha');
}