import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Curriculum Infrastructure', () => {
  it('should have the templates directory', () => {
    const templatesPath = path.resolve(process.cwd(), 'docs/curriculum/templates');
    expect(fs.existsSync(templatesPath)).toBe(true);
  });

  it('should have the unit 01 directory', () => {
    const unit01Path = path.resolve(process.cwd(), 'docs/curriculum/units/unit_01');
    expect(fs.existsSync(unit01Path)).toBe(true);
  });

  it('should have the launch template', () => {
    const launchPath = path.resolve(process.cwd(), 'docs/curriculum/templates/launch.md');
    expect(fs.existsSync(launchPath)).toBe(true);
  });
});
