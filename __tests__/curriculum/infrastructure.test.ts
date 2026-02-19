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

  it('should have a valid manifest for unit 01', () => {
    const manifestPath = path.resolve(process.cwd(), 'docs/curriculum/units/unit_01/manifest.md');
    expect(fs.existsSync(manifestPath)).toBe(true);
    
    const content = fs.readFileSync(manifestPath, 'utf8');
    for (let i = 1; i <= 11; i++) {
      const lessonId = `U01L${i.toString().padStart(2, '0')}`;
      expect(content).toContain(lessonId);
    }
  });

  it('should have implemented U01L01_launch.md', () => {
    const lessonPath = path.resolve(process.cwd(), 'docs/curriculum/units/unit_01/U01L01_launch.md');
    expect(fs.existsSync(lessonPath)).toBe(true);
  });

  it('should have implemented accounting lessons U01L02 to U01L04', () => {
    const lessons = ['U01L02_accounting.md', 'U01L03_accounting.md', 'U01L04_accounting.md'];
    lessons.forEach(lesson => {
      const lessonPath = path.resolve(process.cwd(), `docs/curriculum/units/unit_01/${lesson}`);
      expect(fs.existsSync(lessonPath)).toBe(true);
    });
  });

  it('should have implemented excel lessons U01L05 to U01L07', () => {
    const lessons = ['U01L05_excel.md', 'U01L06_excel.md', 'U01L07_excel.md'];
    lessons.forEach(lesson => {
      const lessonPath = path.resolve(process.cwd(), `docs/curriculum/units/unit_01/${lesson}`);
      expect(fs.existsSync(lessonPath)).toBe(true);
    });
  });

  it('should have the correct 6-phase sequence (Reflection after Checkpoint) in L1-L7', () => {
    const lessons = [
      'U01L01_launch.md',
      'U01L02_accounting.md',
      'U01L03_accounting.md',
      'U01L04_accounting.md',
      'U01L05_excel.md',
      'U01L06_excel.md',
      'U01L07_excel.md'
    ];
    lessons.forEach(lesson => {
      const lessonPath = path.resolve(process.cwd(), `docs/curriculum/units/unit_01/${lesson}`);
      const content = fs.readFileSync(lessonPath, 'utf8');
      
      const checkpointIndex = content.indexOf('Phase 5: Checkpoint');
      const reflectionIndex = content.indexOf('Phase 6: Reflection');
      
      expect(checkpointIndex).toBeGreaterThan(-1);
      expect(reflectionIndex).toBeGreaterThan(-1);
      expect(reflectionIndex).toBeGreaterThan(checkpointIndex);
    });
  });

  it('should audit all 11 Unit 1 files for frontmatter and Sarah Chen narrative', () => {
    const lessons = [
      'U01L01_launch.md', 'U01L02_accounting.md', 'U01L03_accounting.md',
      'U01L04_accounting.md', 'U01L05_excel.md', 'U01L06_excel.md',
      'U01L07_excel.md', 'U01L08_project.md', 'U01L09_project.md',
      'U01L10_project.md', 'U01L11_assessment.md'
    ];
    
    lessons.forEach(lesson => {
      const lessonPath = path.resolve(process.cwd(), `docs/curriculum/units/unit_01/${lesson}`);
      const content = fs.readFileSync(lessonPath, 'utf8');
      
      // Check for YAML frontmatter
      expect(content.startsWith('---')).toBe(true);
      const parts = content.split('---');
      expect(parts.length).toBeGreaterThanOrEqual(3);
      const frontmatter = parts[1];
      
      expect(frontmatter).toContain('lesson_id:');
      expect(frontmatter).toContain('type:');
      expect(frontmatter).toContain('objectives:');
      expect(frontmatter).toContain('narrative_hook:');
      
      // Check for Sarah Chen mention (case insensitive)
      expect(content.toLowerCase()).toContain('sarah');
    });
  });

  it('should follow the file naming convention UXXLXX_{type}.md in unit_01', () => {
    const unit01Path = path.resolve(process.cwd(), 'docs/curriculum/units/unit_01');
    const files = fs.readdirSync(unit01Path).filter(f => f.endsWith('.md') && f !== 'manifest.md');
    
    files.forEach(file => {
      // Pattern: U followed by 2 digits, L followed by 2 digits, underscore, type, .md
      const regex = /^U\d{2}L\d{2}_(launch|accounting|excel|project|assessment)\.md$/;
      expect(file).toMatch(regex);
    });
  });

  it('should have implemented project sprint lessons U01L08 to U01L10', () => {
    const lessons = ['U01L08_project.md', 'U01L09_project.md', 'U01L10_project.md'];
    lessons.forEach(lesson => {
      const lessonPath = path.resolve(process.cwd(), `docs/curriculum/units/unit_01/${lesson}`);
      expect(fs.existsSync(lessonPath)).toBe(true);
    });
  });

  it('should have implemented assessment lesson U01L11_assessment.md', () => {
    const lessonPath = path.resolve(process.cwd(), 'docs/curriculum/units/unit_01/U01L11_assessment.md');
    expect(fs.existsSync(lessonPath)).toBe(true);
  });
});
