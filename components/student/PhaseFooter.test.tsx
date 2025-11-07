import { render, screen } from '@testing-library/react';

import { type Lesson, type Phase } from '@/lib/db/schema/validators';
import { PhaseFooter } from './PhaseFooter';
import { createLesson, createPhase } from '@/test/utils/lessonBuilders';

const buildPhases = (): Phase[] => [
  createPhase({ phaseNumber: 1, title: 'Hook', id: 'phase-1' }),
  createPhase({ phaseNumber: 2, title: 'Guided Practice', id: 'phase-2' }),
  createPhase({ phaseNumber: 3, title: 'Independent Practice', id: 'phase-3' })
];

describe('PhaseFooter', () => {
  const lesson: Lesson = createLesson({
    title: 'Ledger Launch Lab',
    slug: 'unit03/lesson02',
    unitNumber: 3,
    orderIndex: 2
  });

  it('shows previous and next links when available', () => {
    const phases = buildPhases();

    render(
      <PhaseFooter
        lesson={lesson}
        phase={phases[1]}
        phases={phases}
        navigationOverrides={{
          phaseHrefBuilder: (phase) => `/custom/${phase.phaseNumber}`
        }}
      />
    );

    expect(screen.getByRole('link', { name: /Previous: Hook/i })).toHaveAttribute('href', '/custom/1');
    expect(screen.getByRole('link', { name: /Next: Independent Practice/i })).toHaveAttribute('href', '/custom/3');
    expect(screen.getByRole('link', { name: /Lesson Overview/i })).toBeInTheDocument();
  });

  it('shows complete lesson cta when on final phase', () => {
    const phases = buildPhases();

    render(<PhaseFooter lesson={lesson} phase={phases[2]} phases={phases} />);

    expect(screen.getByRole('link', { name: /Complete Lesson/i })).toHaveAttribute('href', expect.stringContaining('lesson02'));
  });
});
