'use client';

import { isJwtExpired } from './jwt';

const KEY = 'bth_access_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem(KEY);
  if (!token) return null;

  if (isJwtExpired(token)) {
    clearToken();
    return null;
  }

  return token;
}

export function setToken(token: string) {
  window.localStorage.setItem(KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(KEY);
}
