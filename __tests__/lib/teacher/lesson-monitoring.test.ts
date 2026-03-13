import { describe, expect, it } from 'vitest';

import { buildTeacherLessonMonitoringViewModel } from '@/lib/teacher/lesson-monitoring';

describe('buildTeacherLessonMonitoringViewModel', () => {
  const input = {
    unitNumber: 2,
    lesson: {
      id: 'lesson-2',
      unitNumber: 2,
      title: 'Cash Flow Fundamentals',
      slug: 'cash-flow-fundamentals',
      description: 'Work through the published operating cash flow lesson.',
      learningObjectives: ['Explain operating cash flow'],
      orderIndex: 2,
      metadata: {
        duration: 50,
        tags: ['cash-flow', 'analysis'],
      },
    },
    phases: [
      {
        id: 'phase-2',
        phaseNumber: 2,
        title: '',
        estimatedMinutes: 12,
        sections: [
          {
            id: 'section-2',
            sectionType: 'callout',
            content: {
              variant: 'why-this-matters',
              content: 'Cash flow keeps the business operating.',
            },
          },
        ],
      },
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: null,
        estimatedMinutes: 8,
        sections: [
          {
            id: 'section-1',
            sectionType: 'markdown',
            content: { markdown: 'Start with the customer payment scenario.' },
          },
        ],
      },
    ],
    unitLessons: [
      { id: 'lesson-1', title: 'Inputs', orderIndex: 1 },
      { id: 'lesson-2', title: 'Cash Flow Fundamentals', orderIndex: 2 },
      { id: 'lesson-3', title: 'Forecasting', orderIndex: 3 },
    ],
  };

  it('maps published lesson data into teacher lesson plan props', () => {
    const viewModel = buildTeacherLessonMonitoringViewModel(input);

    expect(viewModel.lesson.title).toBe('Cash Flow Fundamentals');
    expect(viewModel.lessonNumber).toBe(2);
    expect(viewModel.availableLessons).toEqual([
      { number: 1, title: 'Inputs' },
      { number: 2, title: 'Cash Flow Fundamentals' },
      { number: 3, title: 'Forecasting' },
    ]);
  });

  it('sorts phases by phase number and applies fallback phase titles', () => {
    const viewModel = buildTeacherLessonMonitoringViewModel(input);

    expect(viewModel.phases.map((phase) => phase.phaseNumber)).toEqual([1, 2]);
    expect(viewModel.phases[0].title).toBe('Hook');
    expect(viewModel.phases[1].title).toBe('Introduction');
  });

  it('maps phase sections into lesson-plan content blocks', () => {
    const viewModel = buildTeacherLessonMonitoringViewModel(input);

    expect(viewModel.phases[0].contentBlocks).toEqual([
      {
        id: 'section-1',
        type: 'markdown',
        content: 'Start with the customer payment scenario.',
      },
    ]);

    expect(viewModel.phases[1].contentBlocks).toEqual([
      {
        id: 'section-2',
        type: 'callout',
        variant: 'why-this-matters',
        content: 'Cash flow keeps the business operating.',
      },
    ]);
  });

  it('computes previous and next lesson hrefs for unit navigation', () => {
    const viewModel = buildTeacherLessonMonitoringViewModel(input);

    expect(viewModel.backHref).toBe('/teacher/units/2');
    expect(viewModel.previousLessonHref).toBe('/teacher/units/2/lessons/lesson-1');
    expect(viewModel.nextLessonHref).toBe('/teacher/units/2/lessons/lesson-3');
  });

  it('returns an empty state when the selected lesson has no published phases', () => {
    const viewModel = buildTeacherLessonMonitoringViewModel({
      ...input,
      phases: [],
    });

    expect(viewModel.empty).toBe(true);
    expect(viewModel.phases).toEqual([]);
    expect(viewModel.nextLessonHref).toBe('/teacher/units/2/lessons/lesson-3');
  });
});
