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

export interface ProjectionRow {
  id: string;
}

export function projectToRowValues<T extends Record<string, unknown>>(
  rows: ProjectionRow[],
  source: T,
  coerceToString?: boolean,
): Record<string, string> {
  return Object.fromEntries(
    rows.map((row) => {
      const raw = source[row.id];
      return [row.id, coerceToString && raw !== undefined && raw !== null ? String(raw) : (raw as string)];
    }),
  );
}

export function projectToRowSelections(
  rows: ProjectionRow[],
  source: Record<string, string | string[] | number | undefined>,
): Record<string, string | string[]> {
  return Object.fromEntries(
    rows.map((row) => [row.id, source[row.id] as string | string[]]).filter(([, value]) => value !== undefined),
  );
}
