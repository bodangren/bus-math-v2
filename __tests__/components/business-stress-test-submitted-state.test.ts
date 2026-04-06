import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const componentPath = path.resolve(
  process.cwd(),
  'components/activities/simulations/BusinessStressTest.tsx',
);

describe('BusinessStressTest submitted state', () => {
  const source = fs.readFileSync(componentPath, 'utf8');

  it('declares a submitted state variable using useState', () => {
    expect(source).toMatch(/const\s*\[\s*submitted\s*,\s*setSubmitted\s*\]\s*=\s*useState\s*\(\s*false\s*\)/);
  });

  it('sets submitted to true in the survival submission path (handleNextRound)', () => {
    expect(source).toMatch(/handleNextRound[\s\S]{0,500}setSubmitted\s*\(\s*true\s*\)/);
  });

  it('sets submitted to true in the bankruptcy submission path (useEffect)', () => {
    expect(source).toMatch(/useEffect[\s\S]{0,800}setSubmitted\s*\(\s*true\s*\)/);
  });

  it('has disabled={submitted} on the Restart Test button', () => {
    expect(source).toMatch(/disabled\s*=\s*\{\s*submitted\s*\}/);
  });

  it('resets submitted to false in the reset function', () => {
    expect(source).toMatch(
      /const\s+reset\s*=\s*\(\)\s*=>[\s\S]{0,400}setSubmitted\s*\(\s*false\s*\)/,
    );
  });
});
