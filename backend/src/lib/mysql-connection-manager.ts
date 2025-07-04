import { env } from '../config/env';
import { MySql } from './mysql';

export class MysqlConnectionManager {
  private static mysql: MySql = null;

  static initialize(mysql: MySql) {
    this.mysql = mysql;
  }

  static getInstance(): MySql {
    if (!this.mysql) {
      console.log('creating instance');
      this.mysql = new MySql(env);
      this.mysql.connect();
    }

    return this.mysql;
  }

  static async destroyInstance() {
    if (this.mysql) {
      await this.mysql.close();
      this.mysql = null;
    }
  }
}
