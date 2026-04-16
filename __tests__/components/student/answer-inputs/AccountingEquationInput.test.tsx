import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountingEquationInput } from '@/components/student/answer-inputs/AccountingEquationInput';
import { accountingEquationFamily } from '@/lib/practice/engine/families/accounting-equation';

describe('AccountingEquationInput', () => {
  const mockOnSubmit = vi.fn();
  const definition = accountingEquationFamily.generate(1, { hiddenTermId: 'equity', tolerance: 0 });
  const expectedEquity = definition.equation.equity;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the problem prompt and visible facts', () => {
    render(
      <AccountingEquationInput
        family={accountingEquationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText(/problem/i)).toBeInTheDocument();
    expect(screen.getByText(/assets:/i)).toBeInTheDocument();
    expect(screen.getByText(/liabilities:/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('submits a correct answer and calls onSubmit with a practice envelope', async () => {
    render(
      <AccountingEquationInput
        family={accountingEquationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await userEvent.type(input, String(expectedEquity));

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    const envelope = mockOnSubmit.mock.calls[0][0];
    expect(envelope.contractVersion).toBe('practice.v1');
    expect(envelope.activityId).toBe(definition.activityId);
    expect(envelope.mode).toBe('assessment');
    expect(envelope.answers).toEqual({ equity: expectedEquity });
    expect(envelope.parts[0].isCorrect).toBe(true);
  });

  it('submits an incorrect answer and shows the expected value', async () => {
    render(
      <AccountingEquationInput
        family={accountingEquationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await userEvent.type(input, String(expectedEquity + 999));

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    const envelope = mockOnSubmit.mock.calls[0][0];
    expect(envelope.parts[0].isCorrect).toBe(false);
    expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Expected: ${expectedEquity.toLocaleString('en-US')}`))).toBeInTheDocument();
  });

  it('hides the submit button after grading and shows the result', async () => {
    render(
      <AccountingEquationInput
        family={accountingEquationFamily}
        definition={definition}
        onSubmit={mockOnSubmit}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '123');

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    expect(screen.queryByRole('button', { name: /submit answer/i })).not.toBeInTheDocument();
    expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
  });
});
