import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const runtimeRoots = ['app', 'lib', 'components'];
const excludedRootPrefixes = ['lib/db/schema/'];
const includeExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.sql']);

function listRuntimeFiles(rootDir: string): string[] {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name);
    const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');

    if (excludedRootPrefixes.some((prefix) => relativePath.startsWith(prefix))) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...listRuntimeFiles(absolutePath));
      continue;
    }

    if (includeExtensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function findLegacyPhaseRuntimeReferences(content: string): string[] {
  const checks: Array<{ label: string; pattern: RegExp }> = [
    { label: ".from('phases')", pattern: /\.from\(\s*['"]phases['"]\s*\)/i },
    { label: '.insert(phases)', pattern: /\.insert\(\s*phases\s*\)/i },
    { label: '.from(phases)', pattern: /\.from\(\s*phases\s*\)/i },
    { label: 'FROM phases SQL', pattern: /\bfrom\s+phases\b/i },
    { label: 'JOIN phases SQL', pattern: /\bjoin\s+phases\b/i },
    { label: "import schema/phases", pattern: /from\s+['"][^'"]*schema\/phases['"]/i },
  ];

  return checks.filter((check) => check.pattern.test(content)).map((check) => check.label);
}

describe('runtime code does not reference legacy phases table', () => {
  it('has no legacy phases references outside schema definitions', () => {
    const files = runtimeRoots.flatMap((root) => listRuntimeFiles(path.join(process.cwd(), root)));

    const offenders = files
      .map((filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        return {
          filePath: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
          matches: findLegacyPhaseRuntimeReferences(content),
        };
      })
      .filter((entry) => entry.matches.length > 0);

    expect(offenders).toEqual([]);
  });
});
