import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIRS = ['app', 'components', 'hooks', 'lib', '__tests__'];

function walk(dir: string): string[] {
  const files: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('test directory migration guardrails', () => {
  it('keeps lesson test builders under __tests__/utils', () => {
    const builderPath = path.join(ROOT, '__tests__/utils/lessonBuilders.ts');
    expect(fs.existsSync(builderPath)).toBe(true);
  });

  it('does not import from legacy @/test paths in source and test files', () => {
    const allFiles = SOURCE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));
    const legacyImportPattern = new RegExp("from\\\\s+['\\\"]@/test/");

    const offenders = allFiles.filter((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      return legacyImportPattern.test(content);
    });

    expect(offenders).toEqual([]);
  });
});
