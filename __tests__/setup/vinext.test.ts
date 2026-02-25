import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vinext Installation', () => {
  it('should have vinext and vite installed in package.json', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    expect(pkg.devDependencies.vinext).toBeDefined();
    expect(pkg.devDependencies.vite).toBeDefined();
  });
});
