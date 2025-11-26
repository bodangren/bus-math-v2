import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';

import {
  SpreadsheetEvaluator,
  type SpreadsheetEvaluatorActivity,
} from '@/components/activities/SpreadsheetEvaluator';
import type { SpreadsheetEvaluatorConfig } from '@/components/activities/SpreadsheetEvaluator';

// Mock fetch globally
global.fetch = vi.fn() as Mock;

const buildActivity = (
  overrides: Partial<SpreadsheetEvaluatorConfig> = {}
): SpreadsheetEvaluatorActivity => ({
  id: 'test-activity-123',
  componentKey: 'spreadsheet-evaluator',
  displayName: 'Budget Exercise',
  description: 'Complete the budget spreadsheet',
  props: {
    templateId: 'simple-budget',
    instructions: 'Fill in the cells with the correct values',
    targetCells: [
      { cell: 'A1', expectedValue: 100 },
      { cell: 'B1', expectedValue: 'Revenue' },
    ],
    initialData: [
      [{ value: '' }, { value: '' }],
      [{ value: '' }, { value: '' }],
    ],
    ...overrides,
  },
  gradingConfig: null,
  standardId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('SpreadsheetEvaluator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful fetch responses
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        isComplete: false,
        feedback: [],
      }),
    });
  });

  it('renders the component with activity details', () => {
    const activity = buildActivity();
    render(<SpreadsheetEvaluator activity={activity} />);

    expect(screen.getByText('Budget Exercise')).toBeInTheDocument();
    expect(screen.getByText('Complete the budget spreadsheet')).toBeInTheDocument();
    expect(
      screen.getByText('Fill in the cells with the correct values')
    ).toBeInTheDocument();
  });

  it('displays Check Answer button when not submitted', () => {
    const activity = buildActivity();
    render(<SpreadsheetEvaluator activity={activity} />);

    expect(screen.getByRole('button', { name: /Check Answer/i })).toBeInTheDocument();
  });

  it('calls API endpoint on submission', async () => {
    const user = userEvent.setup();
    const activity = buildActivity();

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        isComplete: true,
        feedback: [
          { cell: 'A1', isCorrect: true },
          { cell: 'B1', isCorrect: true },
        ],
      }),
    });

    render(<SpreadsheetEvaluator activity={activity} />);

    const submitButton = screen.getByRole('button', { name: /Check Answer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/activities/spreadsheet/${activity.id}/submit`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('displays success message when all cells are correct', async () => {
    const user = userEvent.setup();
    const activity = buildActivity();

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        isComplete: true,
        feedback: [
          { cell: 'A1', isCorrect: true, message: 'Correct!' },
          { cell: 'B1', isCorrect: true, message: 'Correct!' },
        ],
      }),
    });

    render(<SpreadsheetEvaluator activity={activity} />);

    const submitButton = screen.getByRole('button', { name: /Check Answer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Excellent work! All cells are correct./i)
      ).toBeInTheDocument();
    });
  });

  it('displays error feedback when cells are incorrect', async () => {
    const user = userEvent.setup();
    const activity = buildActivity();

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        isComplete: false,
        feedback: [
          { cell: 'A1', isCorrect: false, message: 'Expected "100", got ""' },
          { cell: 'B1', isCorrect: true, message: 'Correct!' },
        ],
      }),
    });

    render(<SpreadsheetEvaluator activity={activity} />);

    const submitButton = screen.getByRole('button', { name: /Check Answer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/1\/2 correct/i)).toBeInTheDocument();
      expect(screen.getByText(/Expected "100", got ""/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    const activity = buildActivity();

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Submission failed' }),
    });

    render(<SpreadsheetEvaluator activity={activity} />);

    const submitButton = screen.getByRole('button', { name: /Check Answer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Submission failed/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit callback when provided', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const activity = buildActivity();

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        isComplete: true,
        feedback: [
          { cell: 'A1', isCorrect: true },
          { cell: 'B1', isCorrect: true },
        ],
      }),
    });

    render(<SpreadsheetEvaluator activity={activity} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /Check Answer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: activity.id,
          isComplete: true,
        })
      );
    });
  });

  it('displays save draft button', () => {
    const activity = buildActivity();
    render(<SpreadsheetEvaluator activity={activity} />);

    expect(screen.getByRole('button', { name: /Save Draft/i })).toBeInTheDocument();
  });

  it('loads draft data on mount', async () => {
    const activity = buildActivity();

    const draftData = [
      [{ value: 50 }, { value: 'Test' }],
      [{ value: 100 }, { value: 'Data' }],
    ];

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        draftData,
        updatedAt: new Date().toISOString(),
      }),
    });

    render(<SpreadsheetEvaluator activity={activity} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/activities/spreadsheet/${activity.id}/draft`
      );
    });
  });
});

describe('Formula Sanitization', () => {
  // These tests would be for the server-side validation
  // We'll create a separate test file for API routes

  it('should be tested in API route tests', () => {
    // Placeholder to remind that formula sanitization is tested separately
    expect(true).toBe(true);
  });
});
