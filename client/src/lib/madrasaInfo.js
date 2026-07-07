const MADRASA_INFO_CACHE_KEY = "madrasaInfo";
const MADRASA_INFO_UPDATED_EVENT = "madrasa-info-updated";

export const getCachedMadrasaInfo = () => {
  try {
    const raw = localStorage.getItem(MADRASA_INFO_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCachedMadrasaInfo = (info) => {
  try {
    localStorage.setItem(MADRASA_INFO_CACHE_KEY, JSON.stringify(info));
    window.dispatchEvent(new Event(MADRASA_INFO_UPDATED_EVENT));
  } catch {
    // Ignore storage and broadcast failures.
  }
};

export const subscribeToMadrasaInfo = (listener) => {
  const handleStorage = (event) => {
    if (event.key === MADRASA_INFO_CACHE_KEY) listener();
  };

  const handleCustomUpdate = () => listener();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(MADRASA_INFO_UPDATED_EVENT, handleCustomUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(MADRASA_INFO_UPDATED_EVENT, handleCustomUpdate);
  };
};

export const getMadrasaDisplayName = (info) =>
  info?.name?.trim() || "Madrasa EMIS";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getBackendOrigin = () => API_BASE.replace(/\/api$/, '');

export const normalizeLogoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/')) {
    return `${getBackendOrigin()}${url}`;
  }
  return url;
};

export const getMadrasaLogo = (info) => {
  if (info?.logo) {
    return normalizeLogoUrl(info.logo);
  }
  const initial = (info?.name?.trim()?.[0] || 'M').toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="url(#g)"/><defs><linearGradient id="g" x1="0" y1="0" x2="48" y2="48"><stop stop-color="#06b6d4"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs><text x="24" y="30" text-anchor="middle" fill="white" font-size="20" font-weight="bold">${initial}</text></svg>`)}`;
};

export const getMadrasaAddressText = (info) => {
  const address = info?.address;

  if (!address) return "";
  if (typeof address === "string") return address.trim();

  return [
    address.fullAddress,
    address.village,
    address.district,
    address.province,
  ]
    .filter((value, index, array) => {
      const normalized = String(value || "").trim();
      return (
        normalized &&
        array.findIndex((item) => String(item || "").trim() === normalized) ===
          index
      );
    })
    .join(", ");
};
