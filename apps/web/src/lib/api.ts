import { clearToken, getToken, setToken } from './auth';
import { getErrorMessage } from './api-error';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) return null;
        const data = (await res.json()) as { access_token: string | null };
        if (!data.access_token) return null;

        setToken(data.access_token);
        return data.access_token;
      } catch {
        return null;
      } finally {
        refreshing = null;
      }
    })();
  }

  return refreshing;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  ctx: { retry?: boolean } = { retry: true },
) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401 && ctx.retry !== false) {
    const next = await refreshAccessToken();
    if (next) {
      return apiFetch(
        path,
        {
          ...options,
          headers: {
            ...(options.headers ?? {}),
            authorization: `Bearer ${next}`,
          },
        },
        { retry: false },
      );
    }

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
