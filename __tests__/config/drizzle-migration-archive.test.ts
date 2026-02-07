import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

const RUNTIME_DIRS = ['app', 'components', 'lib', 'types'];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('drizzle migration archive guardrails', () => {
  it('has no runtime imports from drizzle/migrations', () => {
    const sources = RUNTIME_DIRS.flatMap((dir) =>
      walk(path.join(ROOT, dir)).filter((file) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file)),
    );

    const offenders = sources.filter((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return /drizzle\/migrations/.test(content);
    });

    expect(offenders).toEqual([]);
  });

  it('archives drizzle migration files out of drizzle/migrations', () => {
    expect(fs.existsSync(path.join(ROOT, 'drizzle', 'archived-migrations'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'drizzle', 'migrations'))).toBe(false);
  });

  it('removes migration generation output config from drizzle.config.ts', () => {
    const configPath = path.join(ROOT, 'drizzle.config.ts');
    const content = fs.readFileSync(configPath, 'utf8');

    expect(content).not.toContain("out: './drizzle/migrations'");
  });
});
