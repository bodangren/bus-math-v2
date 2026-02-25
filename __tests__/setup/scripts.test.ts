import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vinext Scripts Replacement', () => {
  it('should have replaced next dev and next build scripts', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    // Check that standard scripts are now using vinext
    expect(pkg.scripts.dev).toContain('vinext dev');
    expect(pkg.scripts.build).toContain('vinext build');
    expect(pkg.scripts.start).toContain('vinext start');
  });
});
