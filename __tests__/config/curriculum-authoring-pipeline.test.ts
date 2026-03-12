import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function read(relativePath: string) {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');
}

describe('curriculum authoring pipeline', () => {
  it('seeds Convex from the canonical published curriculum manifest', () => {
    const seedSource = read('convex/seed.ts');

    expect(seedSource).toContain('seedPublishedCurriculum');
    expect(seedSource).toContain('buildPublishedCurriculumSeedPlan');
    expect(seedSource).not.toContain('const versionId = await ctx.db.insert("lesson_versions"');
  });

  it('keeps capstone out of instructional unit counts on the public landing surface', () => {
    const publicSource = read('convex/public.ts');

    expect(publicSource).toContain('function isCapstoneLesson');
    expect(publicSource).toContain('instructionalLessons');
    expect(publicSource).toContain('unitCount: uniqueUnits.size');
  });
});
