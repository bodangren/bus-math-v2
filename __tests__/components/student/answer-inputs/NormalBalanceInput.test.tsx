import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NormalBalanceInput } from '@/components/student/answer-inputs/NormalBalanceInput';
import { normalBalanceFamily } from '@/lib/practice/engine/families/normal-balance';

describe('NormalBalanceInput', () => {
  const mockOnSubmit = vi.fn();
  const definition = normalBalanceFamily.generate(1, { accountCount: 3, includeContraAccounts: false, companyScope: 'service' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the problem prompt and account labels', () => {
    render(
      <NormalBalanceInput
        family={normalBalanceFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText(/problem/i)).toBeInTheDocument();
    expect(screen.getByText(/choose debit or credit for each account/i)).toBeInTheDocument();
    definition.parts.forEach((part) => {
      expect(screen.getByText(part.label)).toBeInTheDocument();
    });
  });

  it('submits a correct answer and calls onSubmit with a practice envelope', async () => {
    render(
      <NormalBalanceInput
        family={normalBalanceFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    for (const part of definition.parts) {
      const button = screen.getByTestId(`${part.id}-${part.targetId}`);
      await userEvent.click(button);
    }

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    const envelope = mockOnSubmit.mock.calls[0][0];
    expect(envelope.contractVersion).toBe('practice.v1');
    expect(envelope.activityId).toBe(definition.activityId);
    expect(envelope.mode).toBe('assessment');
    expect(envelope.parts.every((p: { isCorrect: boolean }) => p.isCorrect)).toBe(true);
  });

  it('submits an incorrect answer and shows per-account results', async () => {
    render(
      <NormalBalanceInput
        family={normalBalanceFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    // Select the opposite of correct for every account
    for (const part of definition.parts) {
      const wrongSide = part.targetId === 'debit' ? 'credit' : 'debit';
      const button = screen.getByTestId(`${part.id}-${wrongSide}`);
      await userEvent.click(button);
    }

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    const envelope = mockOnSubmit.mock.calls[0][0];
    expect(envelope.parts.every((p: { isCorrect: boolean }) => p.isCorrect)).toBe(false);
    expect(screen.getByText(/incorrect —/i)).toBeInTheDocument();
    definition.parts.forEach((part) => {
      expect(screen.getByText(new RegExp(`${part.label}: Incorrect`))).toBeInTheDocument();
    });
  });

  it('disables submit until all accounts have a selection', async () => {
    render(
      <NormalBalanceInput
        family={normalBalanceFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    expect(submitButton).toBeDisabled();

    // Select only the first account
    const firstPart = definition.parts[0];
    await userEvent.click(screen.getByTestId(`${firstPart.id}-${firstPart.targetId}`));
    expect(submitButton).toBeDisabled();

    // Select the rest
    for (const part of definition.parts.slice(1)) {
      await userEvent.click(screen.getByTestId(`${part.id}-${part.targetId}`));
    }

    expect(submitButton).toBeEnabled();
  });

  it('hides the submit button after grading and shows the result', async () => {
    render(
      <NormalBalanceInput
        family={normalBalanceFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    for (const part of definition.parts) {
      await userEvent.click(screen.getByTestId(`${part.id}-${part.targetId}`));
    }

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    expect(screen.queryByRole('button', { name: /submit answer/i })).not.toBeInTheDocument();
    expect(screen.getByText(/correct!/i)).toBeInTheDocument();
  });
});
