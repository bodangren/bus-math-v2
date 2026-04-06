import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const componentPath = path.resolve(
  process.cwd(),
  'components/activities/exercises/DDBComparisonMastery.tsx',
);

describe('DDBComparisonMastery double-submit guard', () => {
  const source = fs.readFileSync(componentPath, 'utf8');

  it('declares a submittedRef using useRef', () => {
    expect(source).toMatch(/submittedRef\s*=\s*useRef\s*\(\s*false\s*\)/);
  });

  it('checks submittedRef.current before proceeding in handleSubmit', () => {
    expect(source).toMatch(/if\s*\(\s*submittedRef\.current\s*\)\s*return/);
  });

  it('sets submittedRef.current to true before setSubmitted', () => {
    const submitMatch = source.match(
      /const\s+handleSubmit[\s\S]*?}\s*,\s*\[/,
    );
    expect(submitMatch).toBeTruthy();
    const submitBody = submitMatch![0];
    const refSetIndex = submitBody.indexOf('submittedRef.current = true');
    const setStateIndex = submitBody.indexOf('setSubmitted(true)');
    expect(refSetIndex).toBeGreaterThanOrEqual(0);
    expect(setStateIndex).toBeGreaterThanOrEqual(0);
    expect(refSetIndex).toBeLessThan(setStateIndex);
  });

  it('resets submittedRef.current in handleNewProblem', () => {
    expect(source).toMatch(
      /handleNewProblem[\s\S]*?submittedRef\.current\s*=\s*false/,
    );
  });
});
