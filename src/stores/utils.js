const monthsInRussian = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const daysOfWeekInRussian = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export default function formatDate(dateString) {
  const datePart = dateString.split(' ')[0];
  const [year, month, day] = datePart.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = daysOfWeekInRussian[date.getDay() === 0 ? 6 : date.getDay() - 1];

  return `${day} ${monthsInRussian[month - 1]} ${year}, ${dayOfWeek}`;
}
