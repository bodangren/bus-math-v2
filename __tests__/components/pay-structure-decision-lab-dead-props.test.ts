import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const componentPath = path.resolve(
  process.cwd(),
  'components/activities/simulations/PayStructureDecisionLab.tsx',
);

describe('PayStructureDecisionLab dead props cleanup', () => {
  const source = fs.readFileSync(componentPath, 'utf8');

  it('does not declare unused onComplete prop in interface', () => {
    expect(source).not.toMatch(/onComplete\?/);
  });
});
