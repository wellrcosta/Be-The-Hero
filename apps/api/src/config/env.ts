export function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export function requireInProduction(name: string): string | undefined {
  const isProd = process.env.NODE_ENV === 'production';
  const v = process.env[name];
  if (isProd && !v) {
    throw new Error(
      `Missing required environment variable in production: ${name}`,
    );
  }
  return v;
}
