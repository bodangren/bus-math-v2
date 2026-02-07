import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const seedDir = path.join(process.cwd(), 'supabase', 'seed');

function listSeedFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.sql') || file.endsWith('.ts'))
    .map((file) => path.join(dir, file));
}

function findLegacyPhaseReferences(content: string): string[] {
  const checks: Array<{ label: string; pattern: RegExp }> = [
    { label: 'INSERT INTO phases', pattern: /\binsert\s+into\s+phases\b/i },
    { label: 'UPDATE phases', pattern: /\bupdate\s+phases\b/i },
    { label: 'DELETE FROM phases', pattern: /\bdelete\s+from\s+phases\b/i },
    { label: 'FROM phases', pattern: /\bfrom\s+phases\b/i },
    { label: 'JOIN phases', pattern: /\bjoin\s+phases\b/i },
    { label: ".from('phases')", pattern: /\.from\(\s*['\"]phases['\"]\s*\)/i },
    { label: '.insert(phases)', pattern: /\.insert\(\s*phases\s*\)/i },
    {
      label: "import phases schema",
      pattern: /import\s+\{[^}]*\bphases\b[^}]*\}\s+from\s+['\"][^'\"]*schema\/phases['\"]/i,
    },
  ];

  return checks.filter((check) => check.pattern.test(content)).map((check) => check.label);
}

describe('supabase seeds use versioned lesson-phase schema', () => {
  it('does not reference legacy phases table in seed files', () => {
    const offenders = listSeedFiles(seedDir)
      .map((filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = findLegacyPhaseReferences(content);

        return {
          filePath: path.relative(process.cwd(), filePath),
          matches,
        };
      })
      .filter((entry) => entry.matches.length > 0);

    expect(offenders).toEqual([]);
  });
});
