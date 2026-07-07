const pad = (value) => String(value).padStart(2, '0');

export const formatDateInput = (value = new Date()) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const formatMonthInput = (value = new Date()) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
};

export const formatYearInput = (value = new Date()) => {
  return String(new Date(value).getFullYear());
};

export const formatWeekInput = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
  const weekNumber = 1 + Math.round((date - firstThursday) / 604800000);
  return `${date.getFullYear()}-W${pad(weekNumber)}`;
};

export const getDateRangeFromWeekValue = (weekValue) => {
  if (!weekValue || !weekValue.includes('-W')) {
    const today = new Date();
    return getDateRangeFromWeekValue(formatWeekInput(today));
  }

  const [yearPart, weekPart] = weekValue.split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);

  if (!year || !week) {
    const today = new Date();
    return getDateRangeFromWeekValue(formatWeekInput(today));
  }

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

  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday,
    end: sunday,
    startDate: formatDateInput(monday),
    endDate: formatDateInput(sunday)
  };
};

export const getPeriodDateRange = ({ period = 'monthly', date, week, month, year } = {}) => {
  if (period === 'daily') {
    const start = new Date(date || formatDateInput(new Date()));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === 'weekly') {
    const { start, end } = getDateRangeFromWeekValue(week);
    return { start, end };
  }

  if (period === 'yearly') {
    const yearValue = Number(year || new Date().getFullYear());
    const start = new Date(yearValue, 0, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(yearValue, 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

  const monthValue = month || formatMonthInput(new Date());
  const [yearPart, monthPart] = monthValue.split('-');
  const yearNum = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  const start = new Date(yearNum, monthIndex, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

export const buildPeriodQuery = ({ period = 'monthly', date, week, month, year } = {}) => {
  if (period === 'daily') {
    return { period, date: date || formatDateInput(new Date()) };
  }

  if (period === 'weekly') {
    const { startDate, endDate } = getDateRangeFromWeekValue(week);
    return { period, startDate, endDate };
  }

  if (period === 'yearly') {
    return { period, year: Number(year || new Date().getFullYear()) };
  }

  const monthValue = month || formatMonthInput(new Date());
  const [yearNum, monthNumber] = monthValue.split('-');
  return { period, month: Number(monthNumber), year: Number(yearNum) };
};

export const getDefaultPeriodFilters = () => {
  const now = new Date();
  return {
    period: 'monthly',
    date: formatDateInput(now),
    week: formatWeekInput(now),
    month: formatMonthInput(now),
    year: formatYearInput(now)
  };
};

export const isDateWithinRange = (value, filters) => {
  if (!value) return false;
  const current = new Date(value);
  if (Number.isNaN(current.getTime())) return false;
  const { start, end } = getPeriodDateRange(filters);
  return current >= start && current <= end;
};
