import { clearAuth, getAuthHeaders } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const parseJsonSafe = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    const preview = text.slice(0, 200).replace(/\s+/g, ' ');
    throw new Error(`API returned non-JSON (status ${res.status}). Response: ${preview}`);
  }
};

export const apiFetch = async (path, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (res.status === 401 || res.status === 403) {
    clearAuth();
    window.location.href = '/login';
  }

  return res;
};

export { API_BASE };
