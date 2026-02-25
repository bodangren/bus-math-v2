import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Convex Installation', () => {
  it('should have convex installed in package.json', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    expect(pkg.dependencies.convex).toBeDefined();
  });
});
