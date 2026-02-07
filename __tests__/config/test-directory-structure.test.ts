import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const vitestConfigPath = path.resolve(process.cwd(), 'vitest.config.ts');
const playwrightConfigPath = path.resolve(process.cwd(), 'playwright.config.ts');

describe('test directory structure configuration', () => {
  it('targets __tests__ as the canonical Vitest directory', () => {
    const config = fs.readFileSync(vitestConfigPath, 'utf8');

    expect(config).toContain("'__tests__/**/*.test.{ts,tsx}'");
    expect(config).not.toContain("'**/*.test.{ts,tsx}'");
  });

  it('targets tests/e2e as the Playwright directory', () => {
    const config = fs.readFileSync(playwrightConfigPath, 'utf8');

    expect(config).toContain("testDir: './tests/e2e'");
  });
});
