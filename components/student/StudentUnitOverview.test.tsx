import { render, screen } from '@testing-library/react';

import { type Lesson } from '@/lib/db/schema/validators';
import { StudentUnitOverview } from './StudentUnitOverview';
import { createLesson } from '@/test/utils/lessonBuilders';

describe('StudentUnitOverview', () => {
  const lessons: Lesson[] = [
    createLesson({
      title: 'Audit-Ready Ledgers',
      orderIndex: 1,
      metadata: { duration: 60, tags: ['ledger QA', 'controls'] },
      learningObjectives: ['Create a ledger that passes investor audits.']
    }),
    createLesson({
      id: 'lesson-002',
      title: 'Investor Storytelling',
      orderIndex: 2,
      metadata: { duration: 90, tags: ['storytelling', 'dashboards'] },
      learningObjectives: ['Build narrative dashboards for Sarah.']
    })
  ];

  it('renders unit summary details and derived lesson stats', () => {
    render(
      <StudentUnitOverview
        unit={{
          id: 'unit-1',
          title: 'Unit 1 • Balance by Design',
          description: 'Stabilize Sarah’s books and rebuild investor trust.',
          rationale: 'Sarah needs transparent ledgers and dashboards to scale ShopStart.',
          sequence: 1
        }}
        lessons={lessons}
      />
    );

    expect(screen.getByText(/Balance by Design/)).toBeInTheDocument();
    expect(screen.getByText(/Unit 1 • 2.5 Hours/)).toBeInTheDocument();
    expect(screen.getByText(/Build narrative dashboards/)).toBeInTheDocument();
    expect(screen.getByText(/Practice Test & Investor Rehearsal/)).toBeInTheDocument();
  });
});
