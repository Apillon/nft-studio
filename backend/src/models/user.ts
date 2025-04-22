import { AirdropStatus, PopulateStrategy, SerializedStrategy, SystemErrorCode, ValidatorErrorCode } from '../config/values';
import { enumInclusionValidator, uniqueFieldValue } from '../lib/validators';
import { BaseSqlModel, prop } from './base-sql-model';
import { stringTrimParser, utcDateParser } from '../lib/parsers';
import { integerParser, stringParser } from '@rawmodel/parsers';
import { Context } from '../context';
import { ResourceError, SqlError } from '../lib/errors';
import { getQueryParams, selectAndCountQuery } from '../lib/sql-utils';

export class User extends BaseSqlModel {
  /**
   * wallet
   */
  protected _tableName = 'user';

  /**
   * email
   */
  @prop({
    parser: { resolver: stringTrimParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [SerializedStrategy.DB, SerializedStrategy.PROFILE, SerializedStrategy.ADMIN],
    validators: [
      {
        resolver: uniqueFieldValue('user', 'email', undefined, true),
        code: ValidatorErrorCode.PROFILE_EMAIL_ALREADY_TAKEN,
      },
    ],
    fakeValue: 'test@email.com',
  })
  public email?: string | null;

  /**
   * email_start_send_time
   */
  @prop({
    parser: { resolver: utcDateParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [PopulateStrategy.DB, SerializedStrategy.PROFILE, SerializedStrategy.ADMIN],
    validators: [],
    defaultValue: new Date(),
    fakeValue: new Date(),
  })
  public email_start_send_time: Date;

  /**
   * email_sent_time
   */
  @prop({
    parser: { resolver: utcDateParser() },
    populatable: [PopulateStrategy.DB],
    serializable: [SerializedStrategy.PROFILE, SerializedStrategy.ADMIN],
    validators: [],
  })
  public email_sent_time: Date;

  /**
   * nft_id
   */
  // TO-DO Not exist on signup
  @prop({
    parser: { resolver: integerParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [SerializedStrategy.DB, SerializedStrategy.PROFILE, SerializedStrategy.ADMIN],
    fakeValue: null,
  })
  public nft_id: number;

  /**
   * signature
   */
  @prop({
    parser: { resolver: stringParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [SerializedStrategy.DB, SerializedStrategy.PROFILE, SerializedStrategy.ADMIN],
    fakeValue: null,
  })
  public signature: string | null;

  /**
   * amount
   */
  @prop({
    parser: { resolver: integerParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [SerializedStrategy.DB, SerializedStrategy.PROFILE, SerializedStrategy.ADMIN],
    validators: [],
    defaultValue: 1,
    fakeValue: 1,
  })
  public amount: number;

  /**
   * wallet
   */
  @prop({
    parser: { resolver: stringParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [SerializedStrategy.DB, SerializedStrategy.PROFILE, SerializedStrategy.ADMIN],
    fakeValue: null,
  })
  public wallet: string;

  /**
   * tx hash
   */
  @prop({
    parser: { resolver: stringParser() },
    populatable: [PopulateStrategy.DB],
    serializable: [SerializedStrategy.DB, SerializedStrategy.ADMIN],
    fakeValue: null,
  })
  public tx_hash: string;

  /**
   * airdrop status
   */
  @prop({
    parser: { resolver: integerParser() },
    populatable: [PopulateStrategy.DB],
    serializable: [SerializedStrategy.DB, SerializedStrategy.ADMIN],
    validators: [
      {
        resolver: enumInclusionValidator(AirdropStatus),
        code: ValidatorErrorCode.DATA_MODEL_INVALID_STATUS,
      },
    ],
    defaultValue: AirdropStatus.PENDING,
    fakeValue() {
      return AirdropStatus.PENDING;
    },
  })
  public airdrop_status: number;

  /**
   * Class constructor.
   * @param data Input data.
   * @param context Context.
   */
  public constructor(data?: any, context?: Context) {
    super(data, { context });
  }

  public async create() {
    const conn = await this.db().start();

    try {
      await this.insert(SerializedStrategy.DB, conn);
      await this.db().commit(conn);
    } catch (err) {
      await this.db().rollback(conn);
      throw new SqlError(err, this.getContext(), SystemErrorCode.DATABASE_ERROR, 'user/create');
    } finally {
      conn.release();
    }
  }

  public async validateWallet() {
    const data = await this.db().paramQuery(
      `
      SELECT 1
      FROM user
      WHERE email <> @email
      AND wallet = @wallet;
    `,
      {
        email: this.email,
        wallet: this.wallet,
      }
    );
    if (data && data.length) {
      throw new ResourceError(ValidatorErrorCode.WALLET_BELONGS_TO_ANOTHER_USER);
    }
  }

  public async populateByWallet(wallet: string) {
    const data = await this.db().paramQuery(
      `
      SELECT * FROM ${this._tableName}
      WHERE wallet = @wallet
    `,
      { wallet: wallet.toLowerCase() }
    );

    if (data && data.length) {
      return this.populate(data[0], PopulateStrategy.DB);
    } else {
      return this.reset();
    }
  }

  public async populateByEmail(email: string) {
    const data = await this.db().paramQuery(
      `
      SELECT * FROM ${this._tableName}
      WHERE email = @email
    `,
      { email }
    );

    if (data && data.length) {
      return this.populate(data[0], PopulateStrategy.DB);
    } else {
      return this.reset();
    }
  }

  /**
   * returns airdrop user statistics.
   */
  public async getStatistics() {
    const data = await this.db().paramQuery(
      `
      SELECT 
      count(*) as total,
        SUM(IF(airdrop_status = 1, 1, 0)) as pending,
        SUM(IF(airdrop_status in (2,4,5,6,7), 1, 0)) as emailSent,
        SUM(IF(airdrop_status in (4,5,6,7), 1, 0)) as walletLinked,
        SUM(IF(airdrop_status = 6, 1, 0)) as airdropped,
        SUM(IF(airdrop_status in (3, 7), 1, 0)) as threwError
    FROM user;
    `
    );
    if (data && data.length) {
      return data[0];
    } else {
      throw new Error();
    }
  }

  /**
   * returns list of matched users
   * @param urlQuery search/paging/order parameters
   */
  public async getList(urlQuery) {
    // set default values or null for all params that we pass to sql query
    const defaultParams = {
      id: null,
      email: null,
      status: null,
    };

    // map url query with sql fields
    const fieldMap = {
      id: 'u.id',
      email: 'u.email',
      status: 'u.status',
    };
    const { params, filters } = getQueryParams(defaultParams, 'u', fieldMap, urlQuery);
    if (filters.limit === -1) {
      filters.limit = null;
    }

    let serializedStrategy = SerializedStrategy.ADMIN;
    const sqlQuery = {
      qSelect: `
        SELECT
          u.id, u.email, u.nft_id,
          u.tx_hash, u.status,
          u.createTime, u.updateTime,
          u.airdrop_status, u.email_start_send_time,
          u.email_sent_time, u.wallet
        `,
      qFrom: `
        FROM user u
        WHERE
          (@id IS NULL OR u.id = @id)
          AND (@email IS NULL OR u.email LIKE CONCAT('%', @email, '%'))
          AND (@status IS NULL OR u.status = @status)
        `,
      qGroup: `
        `,
      qFilter: `
        ORDER BY ${filters.orderArr ? `${filters.orderArr.join(', ') || 'u.updateTime DESC'}` : 'u.updateTime DESC'}
        ${filters.limit !== null ? `LIMIT ${filters.limit} OFFSET ${filters.offset}` : ''};
      `,
    };

    const { items, total } = await selectAndCountQuery(this.db(), sqlQuery, params, 'u.id');
    const conn = await this.db().db.getConnection();
    try {
      const populatedItems = await Promise.all(
        items.map(async item => {
          const u = new User({}, this.getContext()).populate(item, PopulateStrategy.DB);
          return u.serialize(serializedStrategy);
        })
      );
      await conn.release();
      return { items: populatedItems, total };
    } catch (e) {
      throw e;
    } finally {
      await conn.release();
    }
  }
}
