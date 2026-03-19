import { describe, expect, it } from 'vitest';

import { validateActivityProps } from '@/lib/db/validation';

describe('validateActivityProps', () => {
  it('accepts canonical activity keys', () => {
    const result = validateActivityProps('spreadsheet', {
      template: 'balance-sheet',
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects removed compatibility aliases', () => {
    const result = validateActivityProps('spreadsheet-activity', {
      template: 'balance-sheet',
    });

    expect(result.valid).toBe(false);
    expect(result.errors[0]?.message).toMatch(/Unknown activity component/);
  });
});
