import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const componentPath = path.resolve(
  process.cwd(),
  'components/activities/simulations/PitchPresentationBuilder.tsx',
);

describe('PitchPresentationBuilder dead props cleanup', () => {
  const source = fs.readFileSync(componentPath, 'utf8');

  it('does not render dead "Save Progress" button', () => {
    expect(source).not.toMatch(/Save Progress/);
  });
});
