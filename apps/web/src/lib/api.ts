import { clearToken, getToken } from './auth';
import { getErrorMessage } from './api-error';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const msg = await getErrorMessage(res);
    throw new Error(`API error ${res.status}: ${msg}`);
  }

  return res;
}
