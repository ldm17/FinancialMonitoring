import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// eslint-disable-next-line import/extensions, import/no-unresolved
import { useFinancialMonitoringStore } from '@/stores/financialMonitoringStore';

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
  DATE_WITHOUT_TIME: 'dateWithoutTime',
  DATE_WITH_TIME: 'dateWithTime',
  TIME: 'time',
};

export function formatDate(dateString, formatType) {
  const timeMatch = dateString.match(/T(\d{2}):(\d{2})/);
  const rawHours = timeMatch ? timeMatch[1] : '00';
  const rawMinutes = timeMatch ? timeMatch[2] : '00';
  const rawTime = `${rawHours}:${rawMinutes}`;

  const date = dayjs(dateString);

  if (formatType === FormatType.DATE_WITHOUT_TIME) {
    const day = date.date();
    const month = date.month() + 1;
    const year = date.year();

    const dowIndex = date.day() === 0 ? 6 : date.day() - 1;
    const dayOfWeek = daysOfWeekInRussian[dowIndex];

    return `${day} ${monthsInRussian[month - 1]} ${year}, ${dayOfWeek}`;
  }

  if (formatType === FormatType.DATE_WITH_TIME) {
    const day = date.format('DD');
    const month = date.format('MM');
    const year = date.format('YYYY');

    const explicitOffset = dateString.match(/([+-]\d{2}:\d{2})$/)?.[1] ?? '';

    const financialMonitoringStore = useFinancialMonitoringStore();
    const defaultTimeZoneWithUtcOffset = financialMonitoringStore.defaultTimeZoneWithUtcOffset.timeZone;

    // Привязываем дату к дефолтной зоне пользователя
    // Переводим только дату (день/месяц/год) в нужную зону,
    // часы‑минуты оставляем как есть (keepLocalTime = true)
    const dateStringWithTimeZone = date.tz(defaultTimeZoneWithUtcOffset, true);
    const zoneOffset = dateStringWithTimeZone.format('Z'); // например "+01:00"

    const utcOffsetInfo = explicitOffset && explicitOffset !== zoneOffset ? `(UTC${explicitOffset})` : '';

    return `${day}.${month}.${year} ${rawTime} ${utcOffsetInfo}`.trim();
  }

  if (formatType === FormatType.TIME) {
    const financialMonitoringStore = useFinancialMonitoringStore();
    const defaultTimeZoneWithUtcOffset = financialMonitoringStore.defaultTimeZoneWithUtcOffset.timeZone;

    const offset = dateString.match(/([+-]\d{2}:\d{2})$/)?.[1] || null;

    const dateStringWithTimeZone = dayjs(dateString).tz(defaultTimeZoneWithUtcOffset);

    const utcOffsetInfo = offset !== dateStringWithTimeZone.format('Z') ? `(UTC${offset})` : '';

    return `${rawTime} ${utcOffsetInfo}`.trim();
  }

  return dateString;
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

export default { formatDate, formatDateForTab };
