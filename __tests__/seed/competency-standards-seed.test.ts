import { describe, expect, it } from 'vitest';

import {
  COMPETENCY_STANDARD_UPSERT_SQL,
  getUnitOneStandardsPath,
  loadStandardsFromFile,
  validateStandardSeedData,
} from '../../supabase/seed/02-competency-standards';

describe('competency standards seed', () => {
  it('loads full Unit 1 ACC-1.1 through ACC-1.7 coverage', () => {
    const standards = loadStandardsFromFile(getUnitOneStandardsPath());
    const codes = standards.map((standard) => standard.code).sort();

    expect(codes).toEqual([
      'ACC-1.1',
      'ACC-1.2',
      'ACC-1.3',
      'ACC-1.4',
      'ACC-1.5',
      'ACC-1.6',
      'ACC-1.7',
    ]);
  });

  it('rejects duplicate standard codes', () => {
    const standards = loadStandardsFromFile(getUnitOneStandardsPath());

    const withDuplicateCode = [...standards, { ...standards[0] }];

    expect(() => validateStandardSeedData(withDuplicateCode)).toThrow(/duplicate/i);
  });

  it('keeps upsert SQL idempotent via ON CONFLICT (code)', () => {
    expect(COMPETENCY_STANDARD_UPSERT_SQL).toMatch(/insert into competency_standards/i);
    expect(COMPETENCY_STANDARD_UPSERT_SQL).toMatch(/on conflict\s*\(code\)/i);
    expect(COMPETENCY_STANDARD_UPSERT_SQL).toMatch(/do update set/i);
  });
});
