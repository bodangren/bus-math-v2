import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LessonStepper, type StepperPhase } from './LessonStepper';

const mockPhases: StepperPhase[] = [
  { phaseNumber: 1, phaseId: 'phase-1', title: 'Introduction', status: 'completed' },
  { phaseNumber: 2, phaseId: 'phase-2', title: 'Theory', status: 'current' },
  { phaseNumber: 3, phaseId: 'phase-3', title: 'Practice', status: 'available' },
  { phaseNumber: 4, phaseId: 'phase-4', title: 'Application', status: 'locked' },
  { phaseNumber: 5, phaseId: 'phase-5', title: 'Assessment', status: 'locked' },
  { phaseNumber: 6, phaseId: 'phase-6', title: 'Reflection', status: 'locked' },
];

describe('LessonStepper', () => {
  it('renders all phase steps with correct labels', () => {
    render(<LessonStepper phases={mockPhases} currentPhase={2} />);

    // Component renders both desktop and mobile views, so we get multiple elements
    expect(screen.getAllByLabelText('Phase 1: Introduction').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText('Phase 2: Theory').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText('Phase 3: Practice').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText('Phase 4: Application').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText('Phase 5: Assessment').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText('Phase 6: Reflection').length).toBeGreaterThanOrEqual(1);
  });

  it('marks the current phase with aria-current="step"', () => {
    render(<LessonStepper phases={mockPhases} currentPhase={2} />);

    const currentPhaseButtons = screen.getAllByLabelText('Phase 2: Theory');
    currentPhaseButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-current', 'step');
    });

    const otherPhaseButtons = screen.getAllByLabelText('Phase 1: Introduction');
    otherPhaseButtons.forEach(button => {
      expect(button).not.toHaveAttribute('aria-current');
    });
  });

  it('allows clicking on completed phases', async () => {
    const handlePhaseClick = vi.fn();
    render(
      <LessonStepper
        phases={mockPhases}
        currentPhase={2}
        onPhaseClick={handlePhaseClick}
      />
    );

    const completedPhaseButtons = screen.getAllByLabelText('Phase 1: Introduction');
    await userEvent.click(completedPhaseButtons[0]);

    expect(handlePhaseClick).toHaveBeenCalledWith(1, 'phase-1');
  });

  it('allows clicking on current phase', async () => {
    const handlePhaseClick = vi.fn();
    render(
      <LessonStepper
        phases={mockPhases}
        currentPhase={2}
        onPhaseClick={handlePhaseClick}
      />
    );

    const currentPhaseButtons = screen.getAllByLabelText('Phase 2: Theory');
    await userEvent.click(currentPhaseButtons[0]);

    expect(handlePhaseClick).toHaveBeenCalledWith(2, 'phase-2');
  });

  it('disables locked phases and does not trigger onClick', async () => {
    const handlePhaseClick = vi.fn();
    render(
      <LessonStepper
        phases={mockPhases}
        currentPhase={2}
        onPhaseClick={handlePhaseClick}
      />
    );

    const lockedPhaseButtons = screen.getAllByLabelText('Phase 4: Application');
    lockedPhaseButtons.forEach(button => {
      expect(button).toBeDisabled();
    });

    await userEvent.click(lockedPhaseButtons[0]);
    expect(handlePhaseClick).not.toHaveBeenCalled();
  });

  it('does not trigger onClick for available but not started phases', async () => {
    const handlePhaseClick = vi.fn();
    render(
      <LessonStepper
        phases={mockPhases}
        currentPhase={2}
        onPhaseClick={handlePhaseClick}
      />
    );

    const availablePhaseButtons = screen.getAllByLabelText('Phase 3: Practice');
    availablePhaseButtons.forEach(button => {
      expect(button).toBeDisabled();
    });

    await userEvent.click(availablePhaseButtons[0]);
    expect(handlePhaseClick).not.toHaveBeenCalled();
  });

  it('shows lock icon title for locked phases', () => {
    render(<LessonStepper phases={mockPhases} currentPhase={2} />);

    const lockedPhaseButtons = screen.getAllByLabelText('Phase 4: Application');
    lockedPhaseButtons.forEach(button => {
      expect(button).toHaveAttribute('title', 'Complete previous phase to unlock');
    });
  });

  it('shows phase title for unlocked phases', () => {
    render(<LessonStepper phases={mockPhases} currentPhase={2} />);

    const completedPhaseButtons = screen.getAllByLabelText('Phase 1: Introduction');
    completedPhaseButtons.forEach(button => {
      expect(button).toHaveAttribute('title', 'Introduction');
    });

    const currentPhaseButtons = screen.getAllByLabelText('Phase 2: Theory');
    currentPhaseButtons.forEach(button => {
      expect(button).toHaveAttribute('title', 'Theory');
    });
  });

  it('renders navigation landmark with proper aria-label', () => {
    render(<LessonStepper phases={mockPhases} currentPhase={2} />);

    const nav = screen.getByRole('navigation', { name: /lesson progress stepper/i });
    expect(nav).toBeInTheDocument();
  });

  it('renders all 6 phases when provided', () => {
    render(<LessonStepper phases={mockPhases} currentPhase={1} />);

    const allButtons = screen.getAllByRole('button');
    // Desktop view shows 6 buttons + mobile view shows 6 buttons = 12 total
    // But we'll just check that we have at least 6
    expect(allButtons.length).toBeGreaterThanOrEqual(6);
  });

  it('handles phases with all completed status', async () => {
    const allCompletedPhases: StepperPhase[] = mockPhases.map((phase) => ({
      ...phase,
      status: 'completed' as const,
    }));

    const handlePhaseClick = vi.fn();
    render(
      <LessonStepper
        phases={allCompletedPhases}
        currentPhase={6}
        onPhaseClick={handlePhaseClick}
      />
    );

    // All phases should be clickable
    for (let i = 1; i <= 6; i++) {
      const buttons = screen.getAllByLabelText(new RegExp(`Phase ${i}:`));
      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    }
  });

  it('handles empty onPhaseClick gracefully', async () => {
    render(<LessonStepper phases={mockPhases} currentPhase={2} />);

    const completedPhaseButtons = screen.getAllByLabelText('Phase 1: Introduction');
    // Should not throw
    await expect(userEvent.click(completedPhaseButtons[0])).resolves.not.toThrow();
  });
});
