import { dateParser } from '@rawmodel/parsers';

/**
 * Returns parser function which converts a value to a string.
 */
export function stringTrimParser() {
  return (value: any) => {
    try {
      return value.toString().trim();
    } catch (e) {
      return null;
    }
  };
}

/**
 * Returns parser function which converts a value to a string.
 */
export function stringLowerCaseParser() {
  return (value: any) => {
    try {
      return value.toString().toLowerCase();
    } catch (e) {
      return null;
    }
  };
}

export function utcDateParser() {
  return (value: any) => {
    const parser = dateParser();
    const parsedDate = parser(value);
    if (parsedDate instanceof Date) {
      return new Date(
        Date.UTC(
          parsedDate.getUTCFullYear(),
          parsedDate.getUTCMonth(),
          parsedDate.getUTCDate(),
          parsedDate.getUTCHours(),
          parsedDate.getUTCMinutes(),
          parsedDate.getUTCSeconds(),
          parsedDate.getUTCMilliseconds(),
        ),
      );
    }
    return parsedDate;
  };
}

export function JSONParser(): any {
  return (value: string | any) => {
    try {
      if (typeof value == 'string') {
        return JSON.parse(value);
      }
      return value;
    } catch (e) {
      return null;
    }
  };
}
