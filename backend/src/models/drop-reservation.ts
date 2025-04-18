import { integerParser, stringParser } from '@rawmodel/parsers';
import { presenceValidator } from '@rawmodel/validators';
import {
  AirdropStatus,
  PopulateStrategy,
  SerializedStrategy,
  ValidatorErrorCode,
} from '../config/values';
import { stringTrimParser } from '../lib/parsers';
import { BaseSqlModel, prop } from './base-sql-model';
import { ValidationError } from '../lib/errors';
import { PoolConnection } from 'mysql2/promise';
import { getQueryParams, selectAndCountQuery } from '../lib/sql-utils';

export class DropReservation extends BaseSqlModel {
  protected _tableName = 'drop_reservation';

  @prop({
    parser: { resolver: integerParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
    ],
    validators: [
      {
        resolver: presenceValidator(),
        code: ValidatorErrorCode.DROP_RESERVATION_REQUIRED_DATA_NOT_PRESENT,
      },
    ],
  })
  public poapDrop_id: number;

  @prop({
    parser: { resolver: stringTrimParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
    ],
    validators: [
      {
        resolver: presenceValidator(),
        code: ValidatorErrorCode.DROP_RESERVATION_REQUIRED_DATA_NOT_PRESENT,
      },
    ],
  })
  public email: string;

  @prop({
    parser: { resolver: integerParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
    ],
    validators: [
      {
        resolver: presenceValidator(),
        code: ValidatorErrorCode.DROP_RESERVATION_REQUIRED_DATA_NOT_PRESENT,
      },
    ],
    defaultValue: AirdropStatus.PENDING,
  })
  public airdropStatus: AirdropStatus;

  @prop({
    parser: { resolver: stringParser() },
    populatable: [PopulateStrategy.DB],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
    ],
    fakeValue: null,
  })
  public wallet: string;

  @prop({
    parser: { resolver: stringParser() },
    populatable: [PopulateStrategy.DB],
    serializable: [SerializedStrategy.DB, SerializedStrategy.ADMIN],
    fakeValue: null,
  })
  public txHash: string;

  public async populateByDropAndEmail(poapDrop_id: number, email: string) {
    const data = await this.db().paramQuery(
      `
      SELECT * FROM ${this._tableName}
      WHERE poapDrop_id = @poapDrop_id AND email = @email
    `,
      { poapDrop_id, email },
    );

    if (data && data.length) {
      return this.populate(data[0], PopulateStrategy.DB);
    } else {
      return this.reset();
    }
  }

  public async validateAndCreate(conn?: PoolConnection) {
    try {
      await this.validate();
    } catch (err) {
      await this.handle(err);
    }

    if (!this.isValid()) {
      throw new ValidationError(
        this,
        this.getContext(),
        'DropReservation.create()',
      );
    }

    await this.insert(SerializedStrategy.DB, conn);
  }

  public async validateAndUpdate(conn?: PoolConnection) {
    try {
      await this.validate();
    } catch (err) {
      await this.handle(err);
    }

    if (!this.isValid()) {
      throw new ValidationError(
        this,
        this.getContext(),
        'DropReservation.create()',
      );
    }

    await this.update(SerializedStrategy.UPDATE_DB, { conn });
  }

  public async getList(urlQuery) {
    const { params, filters } = getQueryParams(
      { poap_id: null },
      'dr',
      {},
      urlQuery,
    );
    if (filters.limit === -1) {
      filters.limit = null;
    }

    const sqlQuery = {
      qSelect: `
        SELECT *
        `,
      qFrom: `
        FROM drop_reservation dr
        WHERE
          (@poapDrop_id = dr.poapDrop_id)
        `,
      qGroup: `
        `,
      qFilter: `
        ORDER BY ${
          filters.orderArr
            ? `${filters.orderArr.join(', ') || 'dr.updateTime DESC'}`
            : 'dr.updateTime DESC'
        };
      `,
    };

    return await selectAndCountQuery(this.db(), sqlQuery, params, 'dr.id');
  }
}