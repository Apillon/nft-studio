import { dateParser } from '@rawmodel/parsers';
import { presenceValidator } from '@rawmodel/validators';
import {
  PopulateStrategy,
  SerializedStrategy,
  ValidatorErrorCode,
} from '../config/values';
import { stringTrimParser } from '../lib/parsers';
import { BaseSqlModel, prop } from './base-sql-model';
import { ValidationError } from '../lib/errors';
import { PoolConnection } from 'mysql2/promise';
import { getQueryParams, selectAndCountQuery } from '../lib/sql-utils';

export class PoapDrop extends BaseSqlModel {
  protected _tableName = 'poap_drop';

  @prop({
    parser: { resolver: stringTrimParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
      SerializedStrategy.UPDATE_DB,
    ],
    validators: [
      {
        resolver: presenceValidator(),
        code: ValidatorErrorCode.POAP_DROP_REQUIRED_DATA_NOT_PRESENT,
      },
    ],
    fakeValue: 'Fake Poap drop',
  })
  public title: string;

  @prop({
    parser: { resolver: stringTrimParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
      SerializedStrategy.UPDATE_DB,
    ],
  })
  public description: string;

  @prop({
    parser: { resolver: dateParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
      SerializedStrategy.UPDATE_DB,
    ],
    validators: [
      {
        resolver: presenceValidator(),
        code: ValidatorErrorCode.POAP_DROP_REQUIRED_DATA_NOT_PRESENT,
      },
    ],
    fakeValue: new Date(),
  })
  public startTime: Date;

  @prop({
    parser: { resolver: dateParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
      SerializedStrategy.UPDATE_DB,
    ],
    validators: [
      {
        resolver: presenceValidator(),
        code: ValidatorErrorCode.POAP_DROP_REQUIRED_DATA_NOT_PRESENT,
      },
    ],
    fakeValue: new Date(),
  })
  public endTime: Date;

  @prop({
    parser: { resolver: stringTrimParser() },
    populatable: [PopulateStrategy.DB, PopulateStrategy.ADMIN],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
      SerializedStrategy.UPDATE_DB,
    ],
  })
  public website: string;

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
        code: ValidatorErrorCode.POAP_DROP_REQUIRED_DATA_NOT_PRESENT,
      },
    ],
  })
  public collectionUuid: string;

  public async validateAndCreate(conn?: PoolConnection) {
    try {
      await this.validate();
    } catch (err) {
      await this.handle(err);
    }

    if (!this.isValid()) {
      throw new ValidationError(this, this.getContext(), 'PoapDrop.create()');
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
      throw new ValidationError(this, this.getContext(), 'PoapDrop.create()');
    }

    await this.update(SerializedStrategy.UPDATE_DB, { conn });
  }

  public async getList(urlQuery) {
    const { params, filters } = getQueryParams(
      { id: null, title: null, status: null },
      'pd',
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
        FROM poap_drop pd
        WHERE
          (@id IS NULL OR pd.id = @id)
          AND (@title IS NULL OR pd.title LIKE CONCAT('%', @title, '%'))
          AND (@status IS NULL OR pd.status = @status)
        `,
      qGroup: `
        `,
      qFilter: `
        ORDER BY pd.startTime DESC;
      `,
    };

    return await selectAndCountQuery(this.db(), sqlQuery, params, 'pd.id');
  }
}
