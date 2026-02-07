import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function listFiles(dir: string, matcher: RegExp): string[] {
  const result: string[] = [];

  if (!fs.existsSync(dir)) {
    return result;
  }

  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const rel = path.relative(ROOT, fullPath).replace(/\\/g, '/');
        if (matcher.test(rel)) {
          result.push(rel);
        }
      }
    }
  };

  walk(dir);
  return result.sort();
}

describe('test runner discovery configuration', () => {
  it('keeps Vitest discovery focused on __tests__ and security integration tests', () => {
    const vitestConfig = fs.readFileSync(path.join(ROOT, 'vitest.config.ts'), 'utf8');

    expect(vitestConfig).toContain("'__tests__/**/*.test.{ts,tsx}'");
    expect(vitestConfig).toContain("'tests/security/**/*.test.{ts,tsx}'");

    const unitTests = listFiles(path.join(ROOT, '__tests__'), /\.test\.(ts|tsx)$/);
    const securityTests = listFiles(path.join(ROOT, 'tests/security'), /\.test\.(ts|tsx)$/);

    expect(unitTests.length).toBeGreaterThan(0);
    expect(securityTests.length).toBeGreaterThan(0);
  });

  it('pins Playwright discovery to tests/e2e *.spec.ts files', () => {
    const playwrightConfig = fs.readFileSync(path.join(ROOT, 'playwright.config.ts'), 'utf8');

    expect(playwrightConfig).toContain("testDir: './tests/e2e'");
    expect(playwrightConfig).toContain("testMatch: '**/*.spec.ts'");

    const e2eSpecs = listFiles(path.join(ROOT, 'tests/e2e'), /\.spec\.ts$/);
    expect(e2eSpecs.length).toBeGreaterThan(0);
  });
});
