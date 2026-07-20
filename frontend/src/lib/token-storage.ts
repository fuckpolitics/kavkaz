const ACCESS_KEY = 'kavkaz_access_token';
const REFRESH_KEY = 'kavkaz_refresh_token';

let memoryAccessToken: string | null = null;

export function getAccessToken(): string | null {
  if (memoryAccessToken) {
    return memoryAccessToken;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  memoryAccessToken = localStorage.getItem(ACCESS_KEY);
  return memoryAccessToken;
}

export function setAccessToken(token: string | null) {
  memoryAccessToken = token;
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    localStorage.setItem(ACCESS_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_KEY);
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    localStorage.setItem(REFRESH_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_KEY);
  }
}

export function clearTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}
