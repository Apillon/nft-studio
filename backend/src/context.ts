import { IEnv } from './config/env';
import { readAdminAuthToken } from './lib/jwt';
import { MySql } from './lib/mysql';

/**
 * Request object context holds personalized request-based information.
 */
export class Context {
  public id: number;
  public env: IEnv;
  public mysql: MySql;
  public isAdmin: boolean;

  /**
   * Class constructor.
   */
  public constructor(env: IEnv, mysql: MySql) {
    this.id = 0;
    this.env = env;
    this.mysql = mysql;
    this.isAdmin = false;
  }

  /**
   * Authenticates a profile from authentication token.
   * @param req ExpressJS request object.
   */
  public authenticateAdmin(token: string) {
    const data = readAdminAuthToken(token);
    if (data?.wallet) {
      this.isAdmin = true;
      return this;
    }

    return this;
  }
}
