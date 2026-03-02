'use client';

import { apiFetch } from './api';

export type Me = { email?: string; roles?: string[] };

const KEY = 'bth_me_cache';

export function getCachedMe(): Me | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Me) : null;
  } catch {
    return null;
  }
}

export function setCachedMe(me: Me) {
  window.localStorage.setItem(KEY, JSON.stringify(me));
}

export function clearCachedMe() {
  window.localStorage.removeItem(KEY);
}

export async function fetchAndCacheMe() {
  const res = await apiFetch('/me');
  const me = (await res.json()) as Me;
  setCachedMe(me);
  return me;
}

export function isAdmin(me: Me | null) {
  return Boolean(me?.roles?.includes('ADMIN'));
}
