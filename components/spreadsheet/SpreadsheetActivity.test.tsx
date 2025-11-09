import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpreadsheetActivity } from './SpreadsheetActivity';
import type { SpreadsheetActivityProps } from '@/lib/db/schema/activities';

// Mock react-spreadsheet
vi.mock('react-spreadsheet', () => ({
  default: ({ 
    data, 
    onChange 
  }: {
    data: unknown[][];
    onChange?: (data: unknown[][]) => void;
  }) => (
    <div data-testid="spreadsheet" className="spreadsheet-wrapper">
      <div data-testid="cell-count">{data.flat().length}</div>
      {onChange && (
        <button
          data-testid="change-trigger"
          onClick={() => onChange([
            [{ value: '=INVALID(' }], // This should trigger a formula error
            [{ value: 'changed' }],
          ])}
        >
          Change Data
        </button>
      )}
    </div>
  ),
}));

// Mock SpreadsheetTemplates
vi.mock('./SpreadsheetTemplates', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./SpreadsheetTemplates')>();
  return {
    ...actual,
    getTemplateByKey: vi.fn((key: string) => {
      if (key === 't-account') {
        return {
          name: 'T-Account Template',
          description: 'Test template',
          data: [
            [{ value: 'Debits', readOnly: true }, { value: 'Credits', readOnly: true }],
            [{ value: 100 }, { value: '' }],
          ]
        };
      }
      return null;
    }),
  };
});

describe('SpreadsheetActivity', () => {
  const defaultProps: SpreadsheetActivityProps = {
    title: 'Test Spreadsheet',
    description: 'Test description',
    template: 't-account',
    allowFormulaEntry: true,
    showColumnLabels: true,
    showRowLabels: true,
    readOnly: false,
    validateFormulas: true,
  };

  it('renders with title and description', () => {
    render(<SpreadsheetActivity {...defaultProps} />);
    
    expect(screen.getByText('Test Spreadsheet')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders spreadsheet component', () => {
    render(<SpreadsheetActivity {...defaultProps} />);
    
    expect(screen.getByTestId('spreadsheet')).toBeInTheDocument();
  });

  it('loads template data when no initial data provided', () => {
    render(<SpreadsheetActivity {...defaultProps} />);
    
    expect(screen.getByTestId('cell-count')).toHaveTextContent('4');
  });

  it('uses initial data when provided', () => {
    const initialData = [
      [{ value: 'Custom' }, { value: 'Data' }],
      [{ value: 'Here' }, { value: 'There' }],
    ];
    
    render(
      <SpreadsheetActivity 
        {...defaultProps} 
        initialData={initialData}
      />
    );
    
    expect(screen.getByTestId('cell-count')).toHaveTextContent('4');
  });

  it('shows submit button when onSubmit provided', () => {
    const handleSubmit = vi.fn();
    
    render(
      <SpreadsheetActivity 
        {...defaultProps} 
        onSubmit={handleSubmit}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Submit Spreadsheet' })).toBeInTheDocument();
  });

  it('does not show submit button when onSubmit not provided', () => {
    render(<SpreadsheetActivity {...defaultProps} />);
    
    expect(screen.queryByRole('button', { name: 'Submit Spreadsheet' })).not.toBeInTheDocument();
  });

  it('calls onSubmit when submit button clicked', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(
      <SpreadsheetActivity 
        {...defaultProps} 
        onSubmit={handleSubmit}
      />
    );
    
    await user.click(screen.getByRole('button', { name: 'Submit Spreadsheet' }));
    
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({
      spreadsheetData: [
        [
          { value: 'Debits', readOnly: true }, 
          { value: 'Credits', readOnly: true }
        ],
        [
          { value: 100 }, 
          { value: '' }
        ]
      ]
    });
  });

  it('disables submit button when there are formula errors', async () => {
    const user = userEvent.setup();
    
    render(
      <SpreadsheetActivity 
        {...defaultProps} 
        onSubmit={vi.fn()}
        validateFormulas={true}
      />
    );
    
    // Simulate formula error by changing data
    await user.click(screen.getByTestId('change-trigger'));
    
    const submitButton = screen.getByRole('button', { name: 'Submit Spreadsheet' });
    expect(submitButton).toBeDisabled();
  });

  it('shows formula errors when validation enabled', async () => {
    const user = userEvent.setup();
    
    render(
      <SpreadsheetActivity 
        {...defaultProps} 
        validateFormulas={true}
      />
    );
    
    // Simulate formula error
    await user.click(screen.getByTestId('change-trigger'));
    
    expect(screen.getByText('Formula Errors:')).toBeInTheDocument();
  });

  it('does not show formula errors when validation disabled', async () => {
    const user = userEvent.setup();
    
    render(
      <SpreadsheetActivity 
        {...defaultProps} 
        validateFormulas={false}
      />
    );
    
    // Simulate formula error
    await user.click(screen.getByTestId('change-trigger'));
    
    expect(screen.queryByText('Formula Errors:')).not.toBeInTheDocument();
  });

  it('handles custom template', () => {
    const customTemplate = {
      name: 'Custom Template',
      description: 'Custom description',
      data: [
        [{ value: 'Custom' }, { value: 'Template' }],
      ]
    };
    
    render(
      <SpreadsheetActivity 
        {...defaultProps} 
        template="custom"
        customTemplate={customTemplate}
      />
    );
    
    expect(screen.getByTestId('cell-count')).toHaveTextContent('2');
  });

  it('handles readOnly mode', () => {
    render(
      <SpreadsheetActivity 
        {...defaultProps} 
        readOnly={true}
        onSubmit={vi.fn()}
      />
    );
    
    // In readOnly mode, the change trigger should not be present
    expect(screen.queryByTestId('change-trigger')).not.toBeInTheDocument();
    
    // Submit button should NOT be shown when readOnly is true
    expect(screen.queryByRole('button', { name: 'Submit Spreadsheet' })).not.toBeInTheDocument();
  });

  it('handles missing title gracefully', () => {
    const propsWithoutTitle = { ...defaultProps };
    delete (propsWithoutTitle as SpreadsheetActivityProps).title;
    
    render(<SpreadsheetActivity {...propsWithoutTitle} />);
    
    // Should not crash and should still render spreadsheet
    expect(screen.getByTestId('spreadsheet')).toBeInTheDocument();
  });

  it('handles missing description gracefully', () => {
    const propsWithoutDescription = { ...defaultProps };
    delete (propsWithoutDescription as SpreadsheetActivityProps).description;
    
    render(<SpreadsheetActivity {...propsWithoutDescription} />);
    
    // Should not crash and should still render spreadsheet
    expect(screen.getByTestId('spreadsheet')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<SpreadsheetActivity {...defaultProps} />);
    
    // The main container should have space-y-4 class
    const mainContainer = screen.getByTestId('spreadsheet').closest('.space-y-4');
    expect(mainContainer).toBeInTheDocument();
    
    // The spreadsheet wrapper should have the spreadsheet-wrapper class
    const spreadsheetWrapper = screen.getByTestId('spreadsheet');
    expect(spreadsheetWrapper).toHaveClass('spreadsheet-wrapper');
  });

  it('syncs with initialData changes', () => {
    const { rerender } = render(
      <SpreadsheetActivity 
        {...defaultProps} 
        initialData={[
          [{ value: 'Initial' }],
        ]}
      />
    );
    
    expect(screen.getByTestId('cell-count')).toHaveTextContent('1');
    
    rerender(
      <SpreadsheetActivity 
        {...defaultProps} 
        initialData={[
          [{ value: 'Updated' }, { value: 'Data' }],
          [{ value: 'More' }, { value: 'Here' }],
        ]}
      />
    );
    
    expect(screen.getByTestId('cell-count')).toHaveTextContent('4');
  });
});