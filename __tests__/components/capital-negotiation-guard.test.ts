import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const componentPath = path.resolve(
  process.cwd(),
  'components/activities/simulations/CapitalNegotiation.tsx',
);

describe('CapitalNegotiation double-submit guard', () => {
  const source = fs.readFileSync(componentPath, 'utf8');

  it('imports useRef from react', () => {
    expect(source).toMatch(/import\s*\{[^}]*\buseRef\b[^}]*\}\s*from\s*['"]react['"]/);
  });

  it('declares a submittedRef using useRef', () => {
    expect(source).toMatch(/submittedRef\s*=\s*useRef\s*\(\s*false\s*\)/);
  });

  it('checks submittedRef.current before proceeding in handleFinalize', () => {
    expect(source).toMatch(/handleFinalize[\s\S]{0,200}if\s*\(\s*submittedRef\.current\s*\)\s*return/);
  });

  it('sets submittedRef.current to true before onSubmit', () => {
    const refSetIndex = source.indexOf('submittedRef.current = true');
    const onSubmitIndex = source.indexOf('onSubmit?.(envelope)');
    expect(refSetIndex).toBeGreaterThanOrEqual(0);
    expect(onSubmitIndex).toBeGreaterThanOrEqual(0);
    expect(refSetIndex).toBeLessThan(onSubmitIndex);
  });

  it('resets submittedRef.current in the reset function', () => {
    expect(source).toMatch(
      /reset[\s\S]{0,200}submittedRef\.current\s*=\s*false/,
    );
  });
});
