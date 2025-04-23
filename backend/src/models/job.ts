import { dateParser, integerParser, stringParser } from '@rawmodel/parsers';
import { BaseSqlModel, prop } from './base-sql-model';
import {
  JobName,
  PopulateStrategy,
  SerializedStrategy,
  SqlModelStatus,
  ValidatorErrorCode,
} from '../config/values';
import { enumInclusionValidator, presenceValidator } from '../lib/validators';
import { JSONParser } from '../lib/parsers';

export class Job extends BaseSqlModel {
  protected _tableName = 'job';
  /**
   * status
   */
  @prop({
    parser: { resolver: integerParser() },
    populatable: [PopulateStrategy.DB],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.EXTENDED_DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
    ],
    validators: [
      {
        resolver: presenceValidator(),
        code: ValidatorErrorCode.DATA_MODEL_STATUS_MISSING,
      },
      {
        resolver: enumInclusionValidator(SqlModelStatus),
        code: ValidatorErrorCode.DATA_MODEL_INVALID_STATUS,
      },
    ],
    defaultValue: SqlModelStatus.DRAFT,
    fakeValue() {
      return SqlModelStatus.DRAFT;
    },
  })
  public status: number;

  /**
   * job name
   */
  @prop({
    parser: { resolver: stringParser() },
    populatable: [PopulateStrategy.DB],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.EXTENDED_DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
    ],
    validators: [
      {
        resolver: presenceValidator(),
        code: ValidatorErrorCode.REQUIRED_DATA_MISSING,
      },
    ],
  })
  public name: string;

  /**
   * time of last successful run - set at the end of execution
   */
  @prop({
    parser: { resolver: dateParser() },
    populatable: [PopulateStrategy.DB],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.EXTENDED_DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
    ],
  })
  public finishedTime: Date | null;

  /**
   * last error info
   */
  @prop({
    parser: { resolver: stringParser() },
    populatable: [PopulateStrategy.DB],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.EXTENDED_DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
    ],
  })
  public lastError: string | null;

  /**
   * object with parameters
   */
  @prop({
    parser: { resolver: JSONParser() },
    populatable: [PopulateStrategy.DB],
    serializable: [
      SerializedStrategy.DB,
      SerializedStrategy.EXTENDED_DB,
      SerializedStrategy.PROFILE,
      SerializedStrategy.ADMIN,
    ],
    defaultValue: {},
  })
  public parameters: any;

  public async sendClaimEmails(): Promise<this> {
    this.populate({
      name: JobName.SEND_CLAIM_EMAIL,
    });

    await this.insert(SerializedStrategy.DB);

    return this;
  }
}
