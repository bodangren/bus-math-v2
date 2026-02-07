import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile() && /\.test\.(ts|tsx)$/.test(entry.name)) {
      files.push(path.relative(ROOT, fullPath).replace(/\\/g, '/'));
    }
  }

  return files;
}

describe('co-located test migration guardrail', () => {
  it('keeps unit/integration tests under __tests__ or tests', () => {
    const legacySourceDirs = ['app', 'components', 'hooks', 'lib', 'supabase'];
    const discovered = new Set<string>();

    for (const candidate of legacySourceDirs) {
      const candidatePath = path.join(ROOT, candidate);
      if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isDirectory()) {
        continue;
      }

      for (const file of walk(candidatePath)) {
        discovered.add(file);
      }
    }

    const offenders = [...discovered].sort();

    expect(offenders).toEqual([]);
    expect(fs.existsSync(path.join(ROOT, 'proxy.test.ts'))).toBe(false);
  });
});
