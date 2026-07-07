const normalizeLanguage = (value, fallback = 'en') => {
  if (typeof value !== 'string') return fallback;

  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const unquoted =
    trimmed.startsWith('"') && trimmed.endsWith('"')
      ? trimmed.slice(1, -1)
      : trimmed;

  if (unquoted === 'dari') return 'dari';
  if (unquoted === 'prs' || unquoted === 'ps' || unquoted === 'en') {
    return unquoted;
  }

  return fallback;
};

export const readStoredLanguage = (key, fallback = 'en') => {
  if (typeof window === 'undefined') return fallback;

  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return normalizeLanguage(JSON.parse(raw), fallback);
  } catch {
    return normalizeLanguage(raw, fallback);
  }
};

export const writeStoredLanguage = (key, value) => {
  if (typeof window === 'undefined') return normalizeLanguage(value);

  const normalized = normalizeLanguage(value);
  window.localStorage.setItem(key, normalized);
  return normalized;
};

export const toI18nLanguage = (value, fallback = 'en') => {
  const normalized = normalizeLanguage(value, fallback);
  return normalized === 'dari' ? 'prs' : normalized;
};

