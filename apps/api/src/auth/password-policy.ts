export function assertStrongPassword(password: string) {
  const min = Number(process.env.AUTH_PASSWORD_MIN_LENGTH ?? 12);

  if (password.length < min) {
    throw new Error(`Password must be at least ${min} characters`);
  }

  // Require complexity by default (can be relaxed via env)
  const requireComplex =
    (process.env.AUTH_PASSWORD_REQUIRE_COMPLEXITY ?? 'true') === 'true';
  if (!requireComplex) return;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (!(hasLower && hasUpper && hasDigit && hasSymbol)) {
    throw new Error('Password must include upper, lower, digit, and symbol');
  }
}
