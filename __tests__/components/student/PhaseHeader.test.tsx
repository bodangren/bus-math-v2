import { render, screen } from '@testing-library/react';

import { type Lesson, type Phase } from '@/lib/db/schema/validators';
import { PhaseHeader } from '../../../components/student/PhaseHeader';
import { createLesson, createPhase } from '@/__tests__/utils/lessonBuilders';

const buildPhases = (): Phase[] => [
  createPhase({ phaseNumber: 1, title: 'Hook', id: 'phase-1' }),
  createPhase({ phaseNumber: 2, title: 'Guided Practice', id: 'phase-2', metadata: { phaseType: 'example' } }),
  createPhase({ phaseNumber: 3, title: 'Independent Practice', id: 'phase-3', metadata: { phaseType: 'practice' } })
];

describe('PhaseHeader', () => {
  const lesson: Lesson = createLesson({
    title: 'Ledger Launch Lab',
    unitNumber: 3,
    orderIndex: 2,
    metadata: {
      duration: 120,
      tags: ['ledger', 'workflow', 'quality review']
    }
  });

  it('renders breadcrumb labels and lesson metadata', () => {
    const phases = buildPhases();

    render(<PhaseHeader lesson={lesson} phase={phases[1]} phases={phases} />);

    expect(screen.getByRole('link', { name: /^Student$/ })).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => node?.textContent === 'Unit 3 • Lesson 02'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Lesson 2/ })).toBeInTheDocument();
    expect(screen.getByText(/Ledger Launch Lab/)).toBeInTheDocument();
  });

  it('uses the capstone label for unit 9 lessons', () => {
    const phases = buildPhases();
    const capstoneLesson: Lesson = createLesson({
      title: 'Capstone: Investor-Ready Plan',
      unitNumber: 9,
      orderIndex: 1,
    });

    render(<PhaseHeader lesson={capstoneLesson} phase={phases[0]} phases={phases} />);

    expect(screen.getByText(/Capstone • Lesson 01/)).toBeInTheDocument();
    expect(screen.queryByText(/Unit 9 • Lesson 01/)).not.toBeInTheDocument();
  });

  it('indicates progress for the current phase', () => {
    const phases = buildPhases();

    render(<PhaseHeader lesson={lesson} phase={phases[1]} phases={phases} />);

    expect(screen.getByText(/Phase 2 of 3/)).toBeInTheDocument();
    expect(screen.getAllByText(/Guided Practice/i).length).toBeGreaterThan(0);
  });
});
