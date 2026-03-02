import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const ACCESS_KEY = 'bth_access_token';
const REFRESH_KEY = 'bth_refresh_token';

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function setAccessToken(token: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, token);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function setRefreshToken(token: string) {
  await SecureStore.setItemAsync(REFRESH_KEY, token);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

async function refreshAccessToken() {
  const refresh_token = await getRefreshToken();
  if (!refresh_token) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-client': 'mobile',
    },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    access_token: string | null;
    refresh_token?: string;
  };

  if (!data.access_token) return null;

  await setAccessToken(data.access_token);
  if (data.refresh_token) await setRefreshToken(data.refresh_token);

  return data.access_token;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  ctx: { retry?: boolean } = { retry: true },
) {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      'x-client': 'mobile',
    },
  });

  if (res.status === 401 && ctx.retry !== false) {
    const next = await refreshAccessToken();
    if (next) {
      return apiFetch(path, init, { retry: false });
    }
    await clearSession();
  }

  return res;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-client': 'mobile',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Login failed (${res.status})`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
  };

  await setAccessToken(data.access_token);
  await setRefreshToken(data.refresh_token);
}
