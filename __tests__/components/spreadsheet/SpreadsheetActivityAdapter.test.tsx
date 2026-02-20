import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpreadsheetActivityAdapter } from '../../../components/activities/spreadsheet/SpreadsheetActivityAdapter';
import type { Activity } from '@/lib/db/schema/validators';

// Mirror the SpreadsheetActivity mock so the adapter renders without real spreadsheet deps
vi.mock('../../../components/activities/spreadsheet/SpreadsheetActivity', () => ({
  SpreadsheetActivity: ({
    title,
    description,
    onSubmit,
  }: {
    title?: string;
    description?: string;
    onSubmit?: (data: { spreadsheetData: unknown[][] }) => void;
  }) => (
    <div>
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {onSubmit && (
        <button
          onClick={() => onSubmit({ spreadsheetData: [[{ value: 'test' }]] })}
        >
          Submit Spreadsheet
        </button>
      )}
    </div>
  ),
}));

const buildActivity = (propsOverrides: Record<string, unknown> = {}): Activity => ({
  id: 'activity-spreadsheet-1',
  componentKey: 'spreadsheet',
  displayName: 'Balance Sheet Exercise',
  description: 'Build a mini Balance Sheet.',
  props: {
    title: 'TechStart Balance Sheet',
    description: 'Enter the accounts and verify A = L + E.',
    template: 'balance-sheet',
    allowFormulaEntry: true,
    showColumnLabels: true,
    showRowLabels: true,
    readOnly: false,
    validateFormulas: true,
    ...propsOverrides,
  },
  gradingConfig: null,
  standardId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('SpreadsheetActivityAdapter', () => {
  it('passes title and description from activity.props to SpreadsheetActivity', () => {
    render(<SpreadsheetActivityAdapter activity={buildActivity()} />);

    expect(screen.getByText('TechStart Balance Sheet')).toBeInTheDocument();
    expect(screen.getByText('Enter the accounts and verify A = L + E.')).toBeInTheDocument();
  });

  it('renders without crashing when optional fields are missing', () => {
    render(
      <SpreadsheetActivityAdapter
        activity={buildActivity({ title: undefined, description: undefined })}
      />
    );
    // SpreadsheetActivity itself handles missing title/description gracefully
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('calls onSubmit with isComplete: true and a completedAt Date when spreadsheet is submitted', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<SpreadsheetActivityAdapter activity={buildActivity()} onSubmit={handleSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Submit Spreadsheet' }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: 'activity-spreadsheet-1',
        isComplete: true,
        completedAt: expect.any(Date),
      }),
    );
  });

  it('does not call onSubmit if no handler is provided', async () => {
    const user = userEvent.setup();
    // Should not throw even if onSubmit is not passed
    render(<SpreadsheetActivityAdapter activity={buildActivity()} />);
    await user.click(screen.getByRole('button', { name: 'Submit Spreadsheet' }));
    // No assertion needed — just verifying no uncaught error
  });
});
