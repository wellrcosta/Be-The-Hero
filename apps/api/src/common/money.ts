export function centsToMoneyString(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function parseMoneyToCents(input: string): number {
  // Accept "10", "10.5", "10.50", "10,50".
  const normalized = input.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error('Invalid money value');
  }

  const [intPart, decPart = ''] = normalized.split('.');
  const cents = Number(intPart) * 100 + Number((decPart + '00').slice(0, 2));

  if (!Number.isFinite(cents)) {
    throw new Error('Invalid money value');
  }

  return cents;
}
