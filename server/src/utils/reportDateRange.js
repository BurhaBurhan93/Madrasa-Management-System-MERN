const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

const getMonthRange = (year, month) => {
  const normalizedYear = Number(year);
  const normalizedMonth = Number(month);
  const start = new Date(normalizedYear, normalizedMonth - 1, 1);
  const end = new Date(normalizedYear, normalizedMonth, 0, 23, 59, 59, 999);
  return { start, end };
};

const getWeekRangeFromDate = (value = new Date()) => {
  const start = startOfDay(value);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end: endOfDay(end) };
};

const getWeekRangeFromValue = (weekValue) => {
  if (!weekValue || !String(weekValue).includes('-W')) return getWeekRangeFromDate(new Date());

  const [yearPart, weekPart] = String(weekValue).split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);
  if (!year || !week) return getWeekRangeFromDate(new Date());

  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const day = simple.getDay();
  const monday = new Date(simple);

  if (day === 0) {
    monday.setDate(simple.getDate() - 6);
  } else if (day <= 4) {
    monday.setDate(simple.getDate() - day + 1);
  } else {
    monday.setDate(simple.getDate() + 8 - day);
  }

  return getWeekRangeFromDate(monday);
};

const normalizeCustomRange = (startDate, endDate) => {
  const start = startDate ? startOfDay(startDate) : startOfDay(endDate);
  const end = endDate ? endOfDay(endDate) : endOfDay(startDate);
  return { start, end };
};

const getDateRangeFromQuery = (query = {}, options = {}) => {
  const { defaultPeriod = 'monthly' } = options;
  const { period, date, startDate, endDate, month, year, week } = query;

  if (startDate || endDate) {
    const range = normalizeCustomRange(startDate, endDate);
    if (isValidDate(range.start) && isValidDate(range.end)) return range;
  }

  if (date) {
    const parsed = new Date(date);
    if (isValidDate(parsed)) return { start: startOfDay(parsed), end: endOfDay(parsed) };
  }

  if (week) {
    return getWeekRangeFromValue(week);
  }

  if (month && year) {
    const range = getMonthRange(year, month);
    if (isValidDate(range.start) && isValidDate(range.end)) return range;
  }

  if (period === 'daily') {
    return { start: startOfDay(new Date()), end: endOfDay(new Date()) };
  }

  if (period === 'weekly') {
    return getWeekRangeFromDate(new Date());
  }

  if (period === 'yearly') {
    const currentYear = new Date().getFullYear();
    return { start: new Date(currentYear, 0, 1), end: new Date(currentYear, 11, 31, 23, 59, 59, 999) };
  }

  if (defaultPeriod === 'monthly' || period === 'monthly' || !period) {
    const today = new Date();
    return getMonthRange(today.getFullYear(), today.getMonth() + 1);
  }

  return { start: startOfDay(new Date()), end: endOfDay(new Date()) };
};

module.exports = {
  getDateRangeFromQuery
};
