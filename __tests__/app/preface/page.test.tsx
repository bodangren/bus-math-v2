import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PrefacePage from '../../../app/preface/page';

vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn().mockResolvedValue([]),
      })),
    })),
  },
}));

vi.mock('@/components/activities/quiz/ComprehensionCheck', () => ({
  ComprehensionCheck: () => <div data-testid="comprehension-check" />,
}));

vi.mock('@/components/activities/quiz/FillInTheBlank', () => ({
  FillInTheBlank: () => <div data-testid="fill-in-the-blank" />,
}));

vi.mock('@/components/activities/quiz/ReflectionJournal', () => ({
  default: () => <div data-testid="reflection-journal" />,
}));

vi.mock('@/components/activities/simulations/CashFlowChallenge', () => ({
  CashFlowChallenge: () => <div data-testid="cash-flow-challenge" />,
}));

describe('PrefacePage', () => {
  it('renders fallback unit summaries when seeded lessons are missing', async () => {
    const result = await PrefacePage();
    render(result);

    expect(screen.queryByText(/curriculum data isn't available yet/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Unit 1: Balance by Design/i)).toBeInTheDocument();
    expect(screen.getByText(/Unit 8: Integrated Model Sprint/i)).toBeInTheDocument();
  });
});
