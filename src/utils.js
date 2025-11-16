import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// eslint-disable-next-line import/extensions, import/no-unresolved
import { useFinancialMonitoringStoreUser, FormatDateType } from '@/stores/financialMonitoringStoreUser';

dayjs.extend(utc);
dayjs.extend(timezone);

const monthsInRussian = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const daysOfWeekInRussian = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export const Months = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export const DaysOfWeek = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

export const FormatType = {
  DEFAULT: 'default',
  FULL_DATE_SHORT_WEEKDAY: 'fullDateShortWeekday',
  DATE_WITHOUT_TIME: 'dateWithoutTime',
  DATE_WITH_TIME: 'dateWithTime',
  TIME: 'time',
};

export const DATE_FORMATS = {
  [FormatDateType.DD_MM_YYYY_DOT]: 'DD.MM.YYYY',
  [FormatDateType.DD_MM_YYYY_DASH]: 'DD-MM-YYYY',
  [FormatDateType.DD_MM_YYYY_SLASH]: 'DD/MM/YYYY',
  [FormatDateType.MM_DD_YYYY_SLASH]: 'MM/DD/YYYY',
  [FormatDateType.YYYY_MM_DD_DOT]: 'YYYY.MM.DD',
  [FormatDateType.ISO_8601]: 'YYYY-MM-DD',
  [FormatDateType.YYYY_MM_DD_SLASH]: 'YYYY/MM/DD',
};

function to12Hour(hourStr) {
  const hour = Number(hourStr);
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const hour12 = (((hour + 11) % 12) + 1).toString().padStart(2, '0');
  return { hour12, meridiem };
}

export function formatDate(dateString, formatType) {
  const timeMatch = dateString.match(/T(\d{2}):(\d{2})/);
  const rawHours = timeMatch ? timeMatch[1] : '00';
  const rawMinutes = timeMatch ? timeMatch[2] : '00';
  const rawTime = `${rawHours}:${rawMinutes}`;

  const date = dayjs(dateString);

  const financialMonitoringStoreUser = useFinancialMonitoringStoreUser();
  const use12HFormat = financialMonitoringStoreUser.isUse12HFormat;

  if (formatType === FormatType.FULL_DATE_SHORT_WEEKDAY) {
    const day = date.date();
    const month = date.month() + 1;
    const year = date.year();

    const dowIndex = date.day() === 0 ? 6 : date.day() - 1;
    const dayOfWeek = daysOfWeekInRussian[dowIndex];

    return `${day} ${monthsInRussian[month - 1]} ${year}, ${dayOfWeek}`;
  }

  if (formatType === FormatType.DATE_WITHOUT_TIME) {
    const pattern = DATE_FORMATS[financialMonitoringStoreUser.currentFormatDateType] || DATE_FORMATS[FormatDateType.DD_MM_YYYY_DOT];
    const formattedDate = date.format(pattern);

    return formattedDate;
  }

  if (formatType === FormatType.DATE_WITH_TIME) {
    const pattern = DATE_FORMATS[financialMonitoringStoreUser.currentFormatDateType] || DATE_FORMATS[FormatDateType.DD_MM_YYYY_DOT];
    const formattedDate = date.format(pattern);

    if (use12HFormat) {
      const { hour12, meridiem } = to12Hour(rawHours);
      return `${formattedDate} ${hour12}:${rawMinutes} ${meridiem}`;
    }

    return `${formattedDate} ${rawTime}`;
  }

  if (formatType === FormatType.TIME) {
    if (use12HFormat) {
      const { hour12, meridiem } = to12Hour(rawHours);
      return `${hour12}:${rawMinutes} ${meridiem}`;
    }

    return `${rawTime} `;
  }

  return dateString;
}

export function formatDateWithUtc(dateString, formatType) {
  const base = formatDate(dateString, formatType);
  const explicitOffset = dateString.match(/([+-]\d{2}:\d{2})$/)?.[1] ?? '';
  return explicitOffset ? `${base} (UTC${explicitOffset})` : base;
}

export function formatDateForTab(date) {
  const selectedDate = new Date(date);
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const year = selectedDate.getFullYear();
  return `${month}/${year}`;
}

export function getDetectedTimeZone() {
  if (
    typeof Intl === 'object' && typeof Intl.DateTimeFormat === 'function' && typeof Intl.DateTimeFormat().resolvedOptions === 'function') {
    const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return detectedTimeZone || 'UTC';
  }
  return 'UTC';
}

export default {
  formatDate,
  formatDateForTab,
  getDetectedTimeZone,
  formatDateWithUtc,
};
