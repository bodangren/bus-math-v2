import { render, screen } from '@testing-library/react';

import { type Lesson, type Phase } from '@/lib/db/schema/validators';
import { StudentLessonOverview } from './StudentLessonOverview';
import { createLesson, createPhase } from '@/test/utils/lessonBuilders';

describe('StudentLessonOverview', () => {
  const lesson: Lesson = createLesson({
    title: 'Ledger Launch Lab',
    orderIndex: 4,
    learningObjectives: ['Automate reconciliation across ledgers.'],
    metadata: { duration: 120, tags: ['automation', 'QA'] }
  });

  const phases: Phase[] = [
    createPhase({ phaseNumber: 1, title: 'Hook • Crisis Briefing', id: 'phase-1' }),
    createPhase({ phaseNumber: 2, title: 'Guided Practice • Spreadsheet Studio', id: 'phase-2', metadata: { phaseType: 'example' } })
  ];

  it('displays lesson stats and key objectives', () => {
    render(
      <StudentLessonOverview
        lesson={lesson}
        unit={{ title: 'Unit 2 • Flow of Transactions', sequence: 2 }}
        phases={phases}
      />
    );

    expect(screen.getByText(/Unit 2 • Lesson 4/)).toBeInTheDocument();
    expect(screen.getByText(/Automate reconciliation/)).toBeInTheDocument();
    expect(screen.getByText(/Ledger Launch Lab/)).toBeInTheDocument();
  });

  it('lists the available lesson phases with navigation links', () => {
    render(
      <StudentLessonOverview
        lesson={lesson}
        unit={{ title: 'Unit 2 • Flow of Transactions', sequence: 2 }}
        phases={phases}
      />
    );

    expect(screen.getAllByRole('link', { name: /Start Phase/i })).toHaveLength(phases.length);
    expect(screen.getByText(/Hook • Crisis Briefing/)).toBeInTheDocument();
  });
});
