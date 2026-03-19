export function formatAccountingAmount(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function toNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function sumValues(values: Array<number | string | null | undefined>) {
  return values.reduce<number>((sum, value) => sum + toNumber(value), 0);
}
