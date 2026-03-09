import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Dev Stack Script', () => {
  it('defines a combined app and Convex dev command', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    expect(pkg.scripts['dev:stack']).toBe('node scripts/dev-stack.mjs');
  });
});
