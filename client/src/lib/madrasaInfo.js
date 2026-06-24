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

export const getMadrasaLogo = (info) => info?.logo || "";

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
