import { describe, expect, it } from 'vitest';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';
import { activityRegistry } from '@/lib/activities/registry';
import { activityPropsSchemas } from '@/lib/db/schema/activities-core';

describe('Phase 5: Units 7-8 and Capstone Curriculum Audit', () => {
  const manifest = buildPublishedCurriculumManifest();
  const unit7Lessons = manifest.lessons.filter(l => l.unitNumber === 7);
  const unit8Lessons = manifest.lessons.filter(l => l.unitNumber === 8);
  const capstoneLessons = manifest.lessons.filter(l => l.unitNumber === 9);

  it('Unit 7 has 11 lessons', () => {
    expect(unit7Lessons.length).toBe(11);
  });

  it('Unit 8 has 11 lessons', () => {
    expect(unit8Lessons.length).toBe(11);
  });

  it('Capstone has 1 lesson', () => {
    expect(capstoneLessons.length).toBe(1);
  });

  it('Unit 7 lesson titles contain expected content', () => {
    const expectedContent = [
      ['Launch', 'Financing', 'Decision'],
      ['Compare', 'Debt', 'Equity'],
      ['Model', 'Interest', 'Payment'],
      ['Estimate', 'Return', 'Expectations'],
      ['Analyze', 'Financing', 'Risk'],
      ['Validate', 'Scenario', 'Assumptions'],
      ['Explain', 'Capital', 'Story'],
      ['Project', 'Sprint', 'Scope', 'Funding'],
      ['Project', 'Sprint', 'Build', 'Financing'],
      ['Project', 'Sprint', 'Present', 'Recommendation'],
      ['Summative', 'Financing', 'Mastery'],
    ];

    unit7Lessons.forEach((lesson, index) => {
      const keywords = expectedContent[index];
      keywords.forEach(keyword => {
        expect(lesson.title.toLowerCase(), `Lesson ${index + 1}: missing keyword "${keyword}"`).toContain(keyword.toLowerCase());
      });
    });
  });

  it('Unit 8 lesson titles contain expected content', () => {
    const expectedContent = [
      ['Launch', 'Integrated', 'Sprint'],
      ['Review', 'Full', 'Business', 'Model'],
      ['Stress-Test', 'Assumptions'],
      ['Refine', 'Operating', 'Scenarios'],
      ['Align', 'Statements', 'Cash'],
      ['Validate', 'Full', 'Workbook'],
      ['Explain', 'Recommendation'],
      ['Project', 'Sprint', 'Scope', 'Integrated'],
      ['Project', 'Sprint', 'Build', 'Model'],
      ['Project', 'Sprint', 'Present', 'Executive'],
      ['Summative', 'Integrated', 'Model', 'Mastery'],
    ];

    unit8Lessons.forEach((lesson, index) => {
      const keywords = expectedContent[index];
      keywords.forEach(keyword => {
        expect(lesson.title.toLowerCase(), `Lesson ${index + 1}: missing keyword "${keyword}"`).toContain(keyword.toLowerCase());
      });
    });
  });

  it('Capstone lesson titles contain expected content', () => {
    const expectedContent = [
      ['Capstone', 'Investor-Ready', 'Plan'],
    ];

    capstoneLessons.forEach((lesson, index) => {
      const keywords = expectedContent[index];
      keywords.forEach(keyword => {
        expect(lesson.title.toLowerCase(), `Capstone lesson ${index + 1}: missing keyword "${keyword}"`).toContain(keyword.toLowerCase());
      });
    });
  });

  it('Unit 7 lessons have valid phase structure', () => {
    unit7Lessons.forEach(lesson => {
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

  it('Unit 8 lessons have valid phase structure', () => {
    unit8Lessons.forEach(lesson => {
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

  it('Capstone lessons have valid phase structure', () => {
    capstoneLessons.forEach(lesson => {
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

  it('Unit 7 lessons have no placeholder or TODO text in sections', () => {
    const placeholderPatterns = [
      /TODO/i,
      /FIXME/i,
      /XXX/i,
      /placeholder/i,
      /<describe|<explain>/i,
    ];

    const allSections = unit7Lessons.flatMap(lesson =>
      lesson.phases.flatMap(phase => phase.sections)
    );

    allSections.forEach((section, index) => {
      if (section.sectionType === 'text' && section.content.markdown) {
        placeholderPatterns.forEach(pattern => {
          expect(section.content.markdown, `Unit 7 section ${index}`).not.toMatch(pattern);
        });
      }
    });
  });

  it('Unit 8 lessons have no placeholder or TODO text in sections', () => {
    const placeholderPatterns = [
      /TODO/i,
      /FIXME/i,
      /XXX/i,
      /placeholder/i,
      /<describe|<explain>/i,
    ];

    const allSections = unit8Lessons.flatMap(lesson =>
      lesson.phases.flatMap(phase => phase.sections)
    );

    allSections.forEach((section, index) => {
      if (section.sectionType === 'text' && section.content.markdown) {
        placeholderPatterns.forEach(pattern => {
          expect(section.content.markdown, `Unit 8 section ${index}`).not.toMatch(pattern);
        });
      }
    });
  });

  it('Capstone lessons have no placeholder or TODO text in sections', () => {
    const placeholderPatterns = [
      /TODO/i,
      /FIXME/i,
      /XXX/i,
      /placeholder/i,
      /<describe|<explain>/i,
    ];

    const allSections = capstoneLessons.flatMap(lesson =>
      lesson.phases.flatMap(phase => phase.sections)
    );

    allSections.forEach((section, index) => {
      if (section.sectionType === 'text' && section.content.markdown) {
        placeholderPatterns.forEach(pattern => {
          expect(section.content.markdown, `Capstone section ${index}`).not.toMatch(pattern);
        });
      }
    });
  });

  it('Unit 7 activities are registered and have valid schemas', () => {
    unit7Lessons.forEach(lesson => {
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

  it('Unit 8 activities are registered and have valid schemas', () => {
    unit8Lessons.forEach(lesson => {
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

  it('Capstone activities are registered and have valid schemas', () => {
    capstoneLessons.forEach(lesson => {
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

  it('Unit 7, 8, and Capstone lessons have proper metadata', () => {
    [...unit7Lessons, ...unit8Lessons, ...capstoneLessons].forEach(lesson => {
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