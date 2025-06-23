import { BaseSqlModel } from '../models/base-sql-model';

/**
 * Expose standard validators.
 */
export * from '@rawmodel/validators';

/**
 * Validate if array is present.
 * @param value any
 */
export function customPresenceValidator() {
  return function (value: any) {
    return !value;
  };
}

/**
 * Validates uniqueness of field value.
 */
export function uniqueFieldValue(
  sqlTableName: string,
  fieldName: string,
  idField = 'id',
  checkNull = false,
) {
  return async function (this: BaseSqlModel, value: any) {
    if (!checkNull && (value === null || value === undefined)) {
      return true;
    }
    const count = await this.db()
      .paramExecute(
        `
      SELECT COUNT(*) as Count FROM \`${sqlTableName}\`
      WHERE \`${fieldName}\` = @value
      AND (@id IS NULL OR (@id IS NOT NULL AND \`${idField}\` <> @id ))`,
        { value, id: this.id },
      )
      .then((rows) => rows[0].Count);

    return count === 0;
  };
}

/**
 * Validates uniqueness of field value by foreign id.
 */
export function uniqueFieldValueById(
  sqlTableName: string,
  fieldName: string,
  foreignId: string,
  idField = 'id',
  checkNull = false,
) {
  return async function (this: BaseSqlModel, value: any) {
    if (!checkNull && (value === null || value === undefined)) {
      return true;
    }
    const count = await this.db()
      .paramExecute(
        `
      SELECT COUNT(*) as Count FROM \`${sqlTableName}\`
      WHERE \`${fieldName}\` = @value AND \`${foreignId}\` = @foreignId
      AND (@id IS NULL OR (@id IS NOT NULL AND \`${idField}\` <> @id ))`,
        { value, id: this.id, foreignId: this[foreignId] },
      )
      .then((rows) => rows[0].Count);

    return count === 0;
  };
}

/**
 * Validates uniqueness of field value by foreign id.
 */
export function uniqueFieldValueByIdActive(
  sqlTableName: string,
  fieldName: string,
  foreignId: string,
  idField = 'id',
  checkNull = false,
) {
  return async function (this: BaseSqlModel, value: any) {
    if (!checkNull && (value === null || value === undefined)) {
      return true;
    }
    const count = await this.db()
      .paramExecute(
        `
      SELECT COUNT(*) as Count FROM \`${sqlTableName}\`
      WHERE \`${fieldName}\` = @value AND \`${foreignId}\` = @foreignId AND status < 9
      AND (@id IS NULL OR (@id IS NOT NULL AND \`${idField}\` <> @id ))`,
        { value, id: this.id, foreignId: this[foreignId] },
      )
      .then((rows) => rows[0].Count);

    return count === 0;
  };
}
/**
 *  Validates existence of item in a different table.
 */

export function foreignKeyPresence(sqlTableName: string) {
  return async function (this: BaseSqlModel, value: any) {
    const count = await this.db()
      .paramExecute(
        `
      SELECT COUNT(*) as Count FROM \`${sqlTableName}\`
      WHERE id = @value
    `,
        { value },
      )
      .then((rows) => rows[0].Count);

    return count !== 0;
  };
}

/**
 *  Validates if value is inside enumerator
 */
export function enumInclusionValidator(enumerator: any) {
  return function (value: any) {
    let valid = false;
    for (const key in enumerator) {
      if (enumerator.hasOwnProperty(key)) {
        if (value === enumerator[key]) {
          valid = true;
          break;
        }
      }
    }
    return valid;
  };
}

export function regexValidator(regex: RegExp) {
  return function (value: any) {
    if (!regex) {
      return false;
    }
    regex.lastIndex = 0;
    return regex.test(value);
  };
}
