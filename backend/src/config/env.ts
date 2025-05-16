import * as dotenv from 'dotenv';
import { ClaimType } from './values';
/**
 * Environment object interface.
 */
export interface IEnv {
  APP_ENV: string;
  APP_SECRET: string;
  APP_URL: string;
  LOG_TARGET: string;

  API_HOST: string;
  API_PORT: number;

  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_DATABASE: string;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  MYSQL_POOL: number;

  PAGE_DEFAULT_LIMIT: number;
  PAGE_MAX_LIMIT: number;

  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USERNAME: string;
  SMTP_PASSWORD: string;
  SMTP_NAME_FROM: string;
  SMTP_EMAIL_FROM: string;
  SMTP_EMAIL_FROM_HELLO: string;

  ADMIN_WALLET: string[];

  MYSQL_HOST_TEST: string;
  MYSQL_PORT_TEST: number;
  MYSQL_DATABASE_TEST: string;
  MYSQL_USER_TEST: string;
  MYSQL_PASSWORD_TEST: string;
  MYSQL_POOL_TEST: number;

  MAX_SUPPLY: number;

  APILLON_API_URL: string;
  APILLON_KEY: string;
  APILLON_SECRET: string;
  COLLECTION_UUID: string;

  CAPTCHA_SECRET: string;

  CLAIM_EXPIRES_IN: number;

  CLAIM_START: number;
  CLAIM_TYPE: number;
}
/**
 * Load variables from .env.
 */
dotenv.config();

/**
 * Environment variables
 */
export const env: IEnv = {
  /**
   * Application environment info.
   */
  APP_ENV: process.env['APP_ENV'] || 'production',
  APP_SECRET: process.env['APP_SECRET'] || 'notasecret',
  APP_URL: (() => {
    const url = process.env['APP_URL'] || 'http://localhost:8000';
    return url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `http://${url}`;
  })(),

  /**
   * Log writing destination.
   */
  LOG_TARGET: process.env['LOG_TARGET'] || 'console',

  /**
   * HTTP server hostname and port.
   */
  API_HOST: process.env['API_HOST'] || '127.0.0.1',
  API_PORT: process.env['API_PORT']
    ? parseInt(`${process.env['API_PORT']}`)
    : 3001,

  /**
   * Admin
   */
  ADMIN_WALLET:
    process.env['ADMIN_WALLET']?.toLocaleLowerCase().split(/[,;]/) || [],

  /**
   * Mysql URL.
   */
  MYSQL_HOST: process.env['MYSQL_HOST'],
  MYSQL_PORT: process.env['MYSQL_PORT']
    ? parseInt(`${process.env['MYSQL_PORT']}`)
    : 3306,
  MYSQL_DATABASE: process.env['MYSQL_DATABASE'],
  MYSQL_USER: process.env['MYSQL_USER'],
  MYSQL_PASSWORD: process.env['MYSQL_PASSWORD'],
  MYSQL_POOL: process.env['MYSQL_POOL']
    ? parseInt(`${process.env['MYSQL_POOL']}`)
    : 1,

  /**
   * Pagination default size limit.
   */
  PAGE_DEFAULT_LIMIT: process.env['PAGE_DEFAULT_LIMIT']
    ? parseInt(`${process.env['PAGE_DEFAULT_LIMIT']}`)
    : 100,

  /**
   * Pagination maximum size limit.
   */
  PAGE_MAX_LIMIT: process.env['PAGE_MAX_LIMIT']
    ? parseInt(`${process.env['PAGE_MAX_LIMIT']}`)
    : 500,

  /** SMTP */
  SMTP_HOST: process.env['SMTP_HOST'] || 'localhost',
  SMTP_PORT: process.env['SMTP_PORT']
    ? parseInt(`${process.env['SMTP_PORT']}`)
    : 587,
  SMTP_USERNAME: process.env['SMTP_USERNAME'] || '',
  SMTP_PASSWORD: process.env['SMTP_PASSWORD'] || '',
  SMTP_NAME_FROM: process.env['SMTP_NAME_FROM'] || 'System',
  SMTP_EMAIL_FROM: process.env['SMTP_EMAIL_FROM'] || 'noreply@localhost',
  SMTP_EMAIL_FROM_HELLO:
    process.env['SMTP_EMAIL_FROM_HELLO'] || 'noreply@localhost',

  /**
   * Mysql test URL.
   */
  MYSQL_HOST_TEST: process.env['MYSQL_HOST_TEST'],
  MYSQL_PORT_TEST: process.env['MYSQL_PORT_TEST']
    ? parseInt(`${process.env['MYSQL_PORT_TEST']}`)
    : 3306,
  MYSQL_DATABASE_TEST: process.env['MYSQL_DATABASE_TEST'],
  MYSQL_USER_TEST: process.env['MYSQL_USER_TEST'],
  MYSQL_PASSWORD_TEST: process.env['MYSQL_PASSWORD_TEST'],
  MYSQL_POOL_TEST: process.env['MYSQL_POOL_TEST']
    ? parseInt(`${process.env['MYSQL_POOL_TEST']}`)
    : 1,

  /**
   * Apillon
   */
  APILLON_API_URL: process.env['APILLON_API_URL'],
  APILLON_KEY: process.env['APILLON_KEY'],
  APILLON_SECRET: process.env['APILLON_SECRET'],
  COLLECTION_UUID: process.env['COLLECTION_UUID'],
  MAX_SUPPLY: process.env['MAX_SUPPLY']
    ? parseInt(`${process.env['MAX_SUPPLY']}`)
    : 0,

  CAPTCHA_SECRET: process.env['CAPTCHA_SECRET'],
  CLAIM_EXPIRES_IN: process.env['CLAIM_EXPIRES_IN']
    ? parseInt(`${process.env['CLAIM_EXPIRES_IN']}`)
    : 72,

  CLAIM_START: process.env['CLAIM_START']
    ? parseInt(`${process.env['CLAIM_START']}`)
    : undefined,
  CLAIM_TYPE: ClaimType.AIRDROP,
};
