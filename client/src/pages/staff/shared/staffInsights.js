export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(Number(value || 0));

export const toTitleCase = (value) =>
  String(value || 'Unknown')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const groupCountBy = (items, getKey) => {
  const map = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name: toTitleCase(name), value }));
};

export const groupSumBy = (items, getKey, getValue) => {
  const map = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    map.set(key, (map.get(key) || 0) + Number(getValue(item) || 0));
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name: toTitleCase(name), value }));
};

export const getMonthLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
};

export const getLastMonths = (items, dateSelector, valueSelector = () => 1) => {
  const map = new Map();

  items.forEach((item) => {
    const rawDate = dateSelector(item);
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return;
    const monthKey = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    map.set(monthKey, (map.get(monthKey) || 0) + Number(valueSelector(item) || 0));
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .slice(-6)
    .map(([isoDate, value]) => ({ name: getMonthLabel(isoDate), value }));
};
