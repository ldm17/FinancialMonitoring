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

export function formatDate(dateString) {
  const datePart = dateString.split(' ')[0];
  const [year, month, day] = datePart.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = daysOfWeekInRussian[date.getDay() === 0 ? 6 : date.getDay() - 1];

  return `${day} ${monthsInRussian[month - 1]} ${year}, ${dayOfWeek}`;
}

export function formatDateForTab(date) {
  const selectedDate = new Date(date);
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const year = selectedDate.getFullYear();
  return `${month}/${year}`;
}

export default { formatDate, formatDateForTab };
