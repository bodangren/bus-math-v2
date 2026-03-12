import { describe, expect, it } from 'vitest';

import {
  validatePublishedCurriculumLesson,
  type PublishedCurriculumLesson,
} from '@/lib/curriculum/published-manifest';

function makeLesson(overrides: Partial<PublishedCurriculumLesson> = {}): PublishedCurriculumLesson {
  return {
    unitNumber: 2,
    unitTitle: 'Flow of Transactions',
    orderIndex: 1,
    lessonNumber: 1,
    title: 'Launch the Transaction Trail',
    slug: 'unit-2-lesson-1',
    description: 'Trace how transactions move through the accounting cycle.',
    learningObjectives: ['Explain the transaction flow.'],
    lessonType: 'core_instruction',
    source: 'generated',
    standards: [{ code: 'ACC-2.1', isPrimary: true }],
    version: {
      version: 1,
      title: 'Launch the Transaction Trail',
      description: 'Trace how transactions move through the accounting cycle.',
      status: 'published',
    },
    metadata: {
      duration: 50,
      durationLabel: '1 class period',
      difficulty: 'intermediate',
      tags: ['curriculum'],
    },
    activities: [],
    phases: [
      {
        phaseNumber: 1,
        phaseKey: 'hook',
        title: 'Hook',
        estimatedMinutes: 8,
        sections: [{ sectionType: 'text', content: { markdown: 'Hook content' } }],
      },
      {
        phaseNumber: 2,
        phaseKey: 'instruction',
        title: 'Instruction',
        estimatedMinutes: 12,
        sections: [{ sectionType: 'text', content: { markdown: 'Instruction content' } }],
      },
      {
        phaseNumber: 3,
        phaseKey: 'guided_practice',
        title: 'Guided Practice',
        estimatedMinutes: 12,
        sections: [{ sectionType: 'text', content: { markdown: 'Guided content' } }],
      },
      {
        phaseNumber: 4,
        phaseKey: 'independent_practice',
        title: 'Independent Practice',
        estimatedMinutes: 10,
        sections: [{ sectionType: 'text', content: { markdown: 'Independent content' } }],
      },
      {
        phaseNumber: 5,
        phaseKey: 'assessment',
        title: 'Assessment',
        estimatedMinutes: 5,
        sections: [{ sectionType: 'text', content: { markdown: 'Assessment content' } }],
      },
      {
        phaseNumber: 6,
        phaseKey: 'reflection',
        title: 'Reflection',
        estimatedMinutes: 3,
        sections: [{ sectionType: 'text', content: { markdown: 'Reflection content' } }],
      },
    ],
    ...overrides,
  };
}

describe('published curriculum validation', () => {
  it('rejects unsupported activity component keys', () => {
    const lesson = makeLesson({
      activities: [
        {
          key: 'activity-1',
          componentKey: 'totally-unsupported',
          displayName: 'Broken activity',
          description: 'Should fail validation',
          props: {},
        },
      ],
    });

    expect(() => validatePublishedCurriculumLesson(lesson)).toThrow(/unknown activity component/i);
  });

  it('rejects phase sequences that do not match the declared lesson archetype', () => {
    const lesson = makeLesson({
      phases: makeLesson().phases.slice(0, 3),
    });

    expect(() => validatePublishedCurriculumLesson(lesson)).toThrow(/phase sequence/i);
  });
});
