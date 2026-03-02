import { createHash, randomBytes } from 'crypto';

export function generateRefreshToken() {
  return randomBytes(48).toString('base64url');
}

export function hashRefreshToken(token: string) {
  const pepper =
    process.env.REFRESH_TOKEN_PEPPER ?? 'dev-refresh-pepper-change-me';
  return createHash('sha256').update(`${pepper}:${token}`).digest('hex');
}

export function refreshCookieOptions() {
  const prod = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: prod,
    sameSite: 'lax' as const,
    path: '/auth',
  };
}
