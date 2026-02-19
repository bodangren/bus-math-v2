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

  it('should have the accounting template', () => {
    const accountingPath = path.resolve(process.cwd(), 'docs/curriculum/templates/accounting.md');
    expect(fs.existsSync(accountingPath)).toBe(true);
  });

  it('should have the excel template', () => {
    const excelPath = path.resolve(process.cwd(), 'docs/curriculum/templates/excel.md');
    expect(fs.existsSync(excelPath)).toBe(true);
  });

  it('should have the project template', () => {
    const projectPath = path.resolve(process.cwd(), 'docs/curriculum/templates/project.md');
    expect(fs.existsSync(projectPath)).toBe(true);
  });

  it('should have the assessment template', () => {
    const assessmentPath = path.resolve(process.cwd(), 'docs/curriculum/templates/assessment.md');
    expect(fs.existsSync(assessmentPath)).toBe(true);
  });
});
