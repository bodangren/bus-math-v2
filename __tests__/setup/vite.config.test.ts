import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vite Config Initialization', () => {
  it('should have vite.config.ts using vinext plugin', () => {
    const configPath = path.resolve(process.cwd(), 'vite.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    expect(configContent).toContain('import vinext from "vinext";');
    expect(configContent).toContain('plugins: [vinext()]');
  });

  it('should keep spreadsheet parser dependencies bundled for SSR', () => {
    const configPath = path.resolve(process.cwd(), 'vite.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');

    expect(configContent).toContain('ssr:');
    expect(configContent).toContain('noExternal');
    expect(configContent).toContain('react-spreadsheet');
    expect(configContent).toContain('fast-formula-parser');
  });
});
