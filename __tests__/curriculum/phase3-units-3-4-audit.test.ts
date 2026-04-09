import { describe, expect, it } from 'vitest';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';
import { activityRegistry } from '@/lib/activities/registry';
import { activityPropsSchemas } from '@/lib/db/schema/activities-core';

describe('Phase 3: Units 3-4 Curriculum Audit', () => {
  const manifest = buildPublishedCurriculumManifest();
  const unit3Lessons = manifest.lessons.filter(l => l.unitNumber === 3);
  const unit4Lessons = manifest.lessons.filter(l => l.unitNumber === 4);

  it('Unit 3 has 11 lessons', () => {
    expect(unit3Lessons.length).toBe(11);
  });

  it('Unit 4 has 11 lessons', () => {
    expect(unit4Lessons.length).toBe(11);
  });

  it('Unit 3 lesson titles contain expected content', () => {
    const expectedContent = [
      ['Launch', 'Reporting', 'Story'],
      ['Build', 'Income', 'Statement'],
      ['Connect', 'Net', 'Income', 'Equity'],
      ['Build', 'Cash', 'Flow', 'View'],
      ['Cross', 'Check', 'Statement', 'Links'],
      ['Repair', 'Statement', 'Drift'],
      ['Present', 'Financial', 'Story'],
      ['Project', 'Sprint', 'Frame', 'Package'],
      ['Project', 'Sprint', 'Statement', 'Deck'],
      ['Project', 'Sprint', 'Present'],
      ['Summative', 'Financial', 'Statements', 'Mastery'],
    ];

    unit3Lessons.forEach((lesson, index) => {
      const keywords = expectedContent[index];
      keywords.forEach(keyword => {
        expect(lesson.title.toLowerCase(), `Lesson ${index + 1}: missing keyword "${keyword}"`).toContain(keyword.toLowerCase());
      });
    });
  });

  it('Unit 4 lesson titles contain expected content', () => {
    const expectedContent = [
      ['Launch', 'Payroll', 'Workflow'],
      ['Calculate', 'Gross', 'Pay'],
      ['Model', 'Mandatory', 'Deductions'],
      ['Calculate', 'Net', 'Pay'],
      ['Track', 'Employer', 'Payroll', 'Costs'],
      ['Validate', 'Payroll', 'Accuracy'],
      ['Explain', 'Payroll', 'Story'],
      ['Project', 'Sprint', 'Scope', 'Payroll'],
      ['Project', 'Sprint', 'Payroll', 'Workbook'],
      ['Project', 'Sprint', 'Present'],
      ['Summative', 'Payroll', 'Operations', 'Mastery'],
    ];

    unit4Lessons.forEach((lesson, index) => {
      const keywords = expectedContent[index];
      keywords.forEach(keyword => {
        expect(lesson.title.toLowerCase(), `Lesson ${index + 1}: missing keyword "${keyword}"`).toContain(keyword.toLowerCase());
      });
    });
  });

  it('Unit 3 lessons have valid phase structure', () => {
    unit3Lessons.forEach(lesson => {
      expect(lesson.phases.length).toBeGreaterThan(0);
      lesson.phases.forEach(phase => {
        expect(phase.phaseNumber).toBeGreaterThan(0);
        expect(phase.phaseKey).toBeDefined();
        expect(phase.title).toBeDefined();
        expect(phase.estimatedMinutes).toBeGreaterThan(0);
        expect(phase.sections).toBeDefined();
        expect(phase.sections.length).toBeGreaterThan(0);
      });
    });
  });

  it('Unit 4 lessons have valid phase structure', () => {
    unit4Lessons.forEach(lesson => {
      expect(lesson.phases.length).toBeGreaterThan(0);
      lesson.phases.forEach(phase => {
        expect(phase.phaseNumber).toBeGreaterThan(0);
        expect(phase.phaseKey).toBeDefined();
        expect(phase.title).toBeDefined();
        expect(phase.estimatedMinutes).toBeGreaterThan(0);
        expect(phase.sections).toBeDefined();
        expect(phase.sections.length).toBeGreaterThan(0);
      });
    });
  });

  it('Unit 3 lessons have no placeholder or TODO text in sections', () => {
    const placeholderPatterns = [
      /TODO/i,
      /FIXME/i,
      /XXX/i,
      /placeholder/i,
      /<describe\|<explain>/i,
    ];

    const allSections = unit3Lessons.flatMap(lesson =>
      lesson.phases.flatMap(phase => phase.sections)
    );

    allSections.forEach((section, index) => {
      if (section.sectionType === 'text' && section.content.markdown) {
        placeholderPatterns.forEach(pattern => {
          expect(section.content.markdown, `Section ${index}`).not.toMatch(pattern);
        });
      }
    });
  });

  it('Unit 4 lessons have no placeholder or TODO text in sections', () => {
    const placeholderPatterns = [
      /TODO/i,
      /FIXME/i,
      /XXX/i,
      /placeholder/i,
      /<describe\|<explain>/i,
    ];

    const allSections = unit4Lessons.flatMap(lesson =>
      lesson.phases.flatMap(phase => phase.sections)
    );

    allSections.forEach((section, index) => {
      if (section.sectionType === 'text' && section.content.markdown) {
        placeholderPatterns.forEach(pattern => {
          expect(section.content.markdown, `Section ${index}`).not.toMatch(pattern);
        });
      }
    });
  });

  it('Unit 3 activities are registered and have valid schemas', () => {
    unit3Lessons.forEach(lesson => {
      lesson.activities.forEach(activity => {
        expect(
          activityRegistry[activity.componentKey as keyof typeof activityRegistry],
          `Activity ${activity.componentKey} in lesson ${lesson.slug}`
        ).toBeDefined();

        const schema = activityPropsSchemas[activity.componentKey as keyof typeof activityPropsSchemas];
        expect(
          schema,
          `Schema ${activity.componentKey} in lesson ${lesson.slug}`
        ).toBeDefined();

        const result = schema.safeParse(activity.props);
        expect(
          result.success,
          `Activity props invalid for ${activity.componentKey} in lesson ${lesson.slug}: ${JSON.stringify(result.error?.issues)}`
        ).toBe(true);
      });
    });
  });

  it('Unit 4 activities are registered and have valid schemas', () => {
    unit4Lessons.forEach(lesson => {
      lesson.activities.forEach(activity => {
        expect(
          activityRegistry[activity.componentKey as keyof typeof activityRegistry],
          `Activity ${activity.componentKey} in lesson ${lesson.slug}`
        ).toBeDefined();

        const schema = activityPropsSchemas[activity.componentKey as keyof typeof activityPropsSchemas];
        expect(
          schema,
          `Schema ${activity.componentKey} in lesson ${lesson.slug}`
        ).toBeDefined();

        const result = schema.safeParse(activity.props);
        expect(
          result.success,
          `Activity props invalid for ${activity.componentKey} in lesson ${lesson.slug}: ${JSON.stringify(result.error?.issues)}`
        ).toBe(true);
      });
    });
  });

  it('Unit 3 and 4 lessons have proper metadata', () => {
    [...unit3Lessons, ...unit4Lessons].forEach(lesson => {
      expect(lesson.unitNumber).toBeGreaterThan(0);
      expect(lesson.orderIndex).toBeGreaterThan(0);
      expect(lesson.lessonNumber).toBeGreaterThan(0);
      expect(lesson.slug).toBeDefined();
      expect(lesson.description).toBeDefined();
      expect(lesson.learningObjectives).toBeDefined();
      expect(lesson.learningObjectives.length).toBeGreaterThan(0);
      expect(lesson.lessonType).toBeDefined();
      expect(lesson.standards).toBeDefined();
      expect(lesson.standards.length).toBeGreaterThan(0);
      expect(lesson.version).toBeDefined();
      expect(lesson.version.version).toBeGreaterThan(0);
      expect(lesson.version.status).toBe('published');
      expect(lesson.metadata).toBeDefined();
    });
  });
});
