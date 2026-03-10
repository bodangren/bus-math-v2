import { describe, expect, it } from 'vitest';

import { validateActivityProps } from '@/lib/db/validation';

describe('validateActivityProps', () => {
  it('accepts documented alias keys by resolving them to canonical activity schemas', () => {
    const result = validateActivityProps('spreadsheet-activity', {
      template: 'balance-sheet',
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
