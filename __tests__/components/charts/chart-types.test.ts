import { describe, expect, it } from 'vitest';

import { buildChartConfig, DEFAULT_CHART_COLORS, formatCurrency } from '../../../components/activities/charts/chart-types';

describe('buildChartConfig', () => {
  it('maps series to chart config entries with labels', () => {
    const config = buildChartConfig([
      { key: 'revenue', label: 'Revenue' },
      { key: 'expenses', label: 'Expenses' }
    ]);

    expect(config.revenue.label).toBe('Revenue');
    expect(config.expenses.label).toBe('Expenses');
  });

  it('assigns colors from the default palette by index', () => {
    const config = buildChartConfig([{ key: 'a', label: 'A' }]);

    expect(config.a.color).toBe(DEFAULT_CHART_COLORS[0]);
  });

  it('uses explicit color when provided', () => {
    const config = buildChartConfig([{ key: 'a', label: 'A', color: 'red' }]);

    expect(config.a.color).toBe('red');
  });

  it('wraps palette index for more series than colors', () => {
    const series = DEFAULT_CHART_COLORS.map((_, i) => ({ key: `s${i}`, label: `S${i}` }));
    const config = buildChartConfig([...series, { key: 'extra', label: 'Extra' }]);

    expect(config.extra.color).toBe(DEFAULT_CHART_COLORS[0]);
  });

  it('returns empty config for empty series', () => {
    expect(buildChartConfig([])).toEqual({});
  });
});

describe('formatCurrency', () => {
  it('formats whole dollars with no cents', () => {
    expect(formatCurrency(1500)).toBe('$1,500');
  });

  it('rounds to nearest dollar', () => {
    expect(formatCurrency(1499.99)).toBe('$1,500');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-2500)).toBe('-$2,500');
  });

  it('supports non-USD currency', () => {
    const result = formatCurrency(1000, 'EUR');
    expect(result).toContain('1,000');
  });

  it('returns fallback for NaN', () => {
    expect(formatCurrency(NaN)).toBe('—');
  });

  it('returns fallback for Infinity', () => {
    expect(formatCurrency(Infinity)).toBe('—');
    expect(formatCurrency(-Infinity)).toBe('—');
  });
});
