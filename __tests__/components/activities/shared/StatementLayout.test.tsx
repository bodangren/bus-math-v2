import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StatementLayout } from '@/components/activities/shared/StatementLayout';

describe('StatementLayout', () => {
  it('tracks editable rows and computes subtotals', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <StatementLayout
        title="Income Statement"
        sections={[
          {
            id: 'income',
            label: 'Income Statement',
            rows: [
              { id: 'revenue', label: 'Revenue', kind: 'editable', placeholder: '0' },
              { id: 'net-income', label: 'Net Income', kind: 'subtotal', sumOf: ['revenue'] },
            ],
          },
        ]}
        onValueChange={onValueChange}
      />,
    );

    await user.type(screen.getAllByLabelText('Revenue')[0], '1000');

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        revenue: '1000',
      }),
    );
    expect(screen.getAllByText('1,000')[0]).toBeInTheDocument();
  });

  it('renders statement amounts with accounting negatives and a double underline on the final total', () => {
    render(
      <StatementLayout
        title="Balance Sheet"
        sections={[
          {
            id: 'ppe',
            label: 'Property, Plant & Equipment',
            rows: [
              { id: 'equipment', label: 'Equipment', kind: 'prefilled', value: 4800 },
              { id: 'accumulated-depreciation', label: 'Less: Accumulated Depreciation', kind: 'prefilled', value: -480 },
              { id: 'net-book-value', label: 'Net Book Value', kind: 'subtotal', sumOf: ['equipment', 'accumulated-depreciation'] },
            ],
          },
        ]}
      />,
    );

    expect(screen.getAllByText('(480)')[0]).toBeInTheDocument();

    const totalRow = screen.getAllByText('Net Book Value')[0].closest('[data-row-id="net-book-value"]');
    expect(totalRow).not.toBeNull();
    expect(totalRow).toHaveAttribute('data-row-rule', 'double');
  });

  it('renders statement metadata, review summary, and inline teacher feedback', () => {
    const { container } = render(
      <StatementLayout
        title="Balance Sheet"
        description="Complete the statement totals."
        sections={[
          {
            id: 'assets',
            label: 'Assets',
            rows: [
              { id: 'cash', label: 'Cash', kind: 'prefilled', value: 1200 },
              { id: 'total-assets', label: 'Total Assets', kind: 'editable', placeholder: '0' },
            ],
          },
        ]}
        scenarioPanel={
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Scenario</div>
            <div>Panel note: complete the missing amount after reading the section totals.</div>
          </div>
        }
        scaffoldText="Use the section totals to complete the missing amount."
        reviewSummary={[
          { label: 'Attempt', value: '1' },
          { label: 'Score', value: '0/1' },
          { label: 'Needs review', value: '1' },
        ]}
        teacherView
        readOnly
        rowFeedback={{
          'total-assets': { status: 'incorrect', message: 'Total assets should equal the section total.' },
        }}
      />,
    );

    expect(container.querySelector('[data-layout="statement-sheet"]')).toBeInTheDocument();
    expect(screen.getByText('Panel note: complete the missing amount after reading the section totals.')).toBeInTheDocument();
    expect(screen.getByText('Attempt')).toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();
    expect(screen.getAllByText('Total assets should equal the section total.')[0]).toBeInTheDocument();
  });

  it('supports editable line-item labels for statement construction rows', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <StatementLayout
        title="Balance Sheet"
        sections={[
          {
            id: 'assets',
            label: 'Assets',
            rows: [
              {
                id: 'cash-row',
                label: 'Asset account',
                kind: 'editable',
                editableField: 'label',
                placeholder: 'Cash',
                value: 1200,
                note: 'Type the account name that belongs on this line.',
              },
            ],
          },
        ]}
        onValueChange={onValueChange}
      />,
    );

    await user.type(screen.getAllByLabelText('Asset account')[0], 'Cash');

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        'cash-row': 'Cash',
      }),
    );
    expect(screen.getAllByText('1,200').length).toBeGreaterThan(0);
  });

  it('shows teaching-mode narration and a next-step control', () => {
    render(
      <StatementLayout
        title="Income Statement"
        mode="teaching"
        sections={[
          {
            id: 'income',
            label: 'Income Statement',
            rows: [
              { id: 'revenue', label: 'Revenue', kind: 'prefilled', value: 1200 },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText(/teaching mode/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
    expect(screen.getByText(/read the section heading/i)).toBeInTheDocument();
  });
});
