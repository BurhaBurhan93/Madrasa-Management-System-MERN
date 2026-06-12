/**
 * Auth utility — single source of truth for token management.
 * All token reads/writes go through here to prevent stale/fake tokens.
 */

const TOKEN_KEY   = 'token';
const ROLE_KEY    = 'userRole';
const USER_KEY    = 'user';
const AUTH_KEY    = 'isAuthenticated';
const USER_ID_KEY = 'userId';

/** Decode JWT payload without verifying signature (verification is server-side). */
const decodePayload = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

/** Returns true only if token exists AND is not expired. */
export const isTokenValid = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  // Reject obviously fake tokens (e.g. "demo-token-staff")
  if (!token.includes('.') || token.split('.').length !== 3) return false;
  const payload = decodePayload(token);
  if (!payload || !payload.exp) return false;
  // exp is in seconds
  return payload.exp * 1000 > Date.now();
};

/** Get token — returns null if invalid/expired. */
export const getToken = () => {
  if (!isTokenValid()) {
    clearAuth();
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

/** Get Authorization header object — safe to spread into fetch headers. */
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Get current user role. */
export const getUserRole = () => localStorage.getItem(ROLE_KEY);

/** Get current user object. */
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); }
  catch { return null; }
};

/** Clear all auth data from localStorage. */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem('isDemoMode');
};

/** Save auth data after successful login. */
export const saveAuth = (token, user, role) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(AUTH_KEY, 'true');
  localStorage.setItem(USER_ID_KEY, user.id || user._id || '');
};
