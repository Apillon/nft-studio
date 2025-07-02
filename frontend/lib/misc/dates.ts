/**
 *  Date and time functions
 */
export const optionsDateTime: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};
export const optionsDate: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};
export const optionsMonthDay: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};

export function formatDate(dateTime: number | string | Date, options: Intl.DateTimeFormatOptions): string {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-us', options);
}
export function dateTimeToDate(dateTime: string): string {
  return formatDate(dateTime, optionsDate);
}
export function dateTimeToMonthDay(dateTime: string): string {
  return formatDate(dateTime, optionsMonthDay);
}
export function dateTimeToDateAndTime(dateTime: string): string {
  return formatDate(dateTime, optionsDateTime);
}
/** Timestamp in seconds to DateTime */
export function timestampToDateAndTime(timestamp: number): string {
  return formatDate(timestamp * 1000, optionsDateTime);
}
