import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpreadsheetWrapper, type SpreadsheetData } from './SpreadsheetWrapper';

// Mock react-spreadsheet to avoid complex rendering in tests
vi.mock('react-spreadsheet', () => ({
  default: ({ 
    data, 
    onChange, 
    columnLabels, 
    rowLabels 
  }: {
    data: SpreadsheetData;
    onChange?: (data: SpreadsheetData) => void;
    columnLabels?: string[];
    rowLabels?: string[];
  }) => (
    <div data-testid="spreadsheet">
      <div data-testid="column-labels">{columnLabels?.join(',')}</div>
      <div data-testid="row-labels">{rowLabels?.join(',')}</div>
      <div data-testid="cell-count">
        {data.flat().length}
      </div>
      {onChange && (
        <button
          data-testid="change-trigger"
          onClick={() => onChange([
            [{ value: 'changed' }, { value: '' }, { value: '' }],
            [{ value: '' }, { value: '' }, { value: '' }],
            [{ value: '' }, { value: '' }, { value: '' }],
          ])}
        >
          Change Data
        </button>
      )}
    </div>
  ),
}));

describe('SpreadsheetWrapper', () => {
  const defaultData: SpreadsheetData = [
    [{ value: "A1" }, { value: "B1" }, { value: "C1" }],
    [{ value: "A2" }, { value: "B2" }, { value: "C2" }],
    [{ value: "A3" }, { value: "B3" }, { value: "C3" }],
  ];

  it('renders spreadsheet with default data', () => {
    render(<SpreadsheetWrapper />);
    
    expect(screen.getByTestId('spreadsheet')).toBeInTheDocument();
    expect(screen.getByTestId('cell-count')).toHaveTextContent('9');
  });

  it('renders with provided initial data', () => {
    render(<SpreadsheetWrapper initialData={defaultData} />);
    
    expect(screen.getByTestId('cell-count')).toHaveTextContent('9');
  });

  it('renders with custom column and row labels', () => {
    const columnLabels = ['X', 'Y', 'Z'];
    const rowLabels = ['1', '2', '3'];
    
    render(
      <SpreadsheetWrapper 
        initialData={defaultData}
        columnLabels={columnLabels}
        rowLabels={rowLabels}
      />
    );
    
    expect(screen.getByTestId('column-labels')).toHaveTextContent('X,Y,Z');
    expect(screen.getByTestId('row-labels')).toHaveTextContent('1,2,3');
  });

  it('generates default labels when not provided', () => {
    render(<SpreadsheetWrapper initialData={defaultData} />);
    
    expect(screen.getByTestId('column-labels')).toHaveTextContent('A,B,C');
    expect(screen.getByTestId('row-labels')).toHaveTextContent('1,2,3');
  });

  it('calls onChange when data changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <SpreadsheetWrapper 
        initialData={defaultData}
        onChange={handleChange}
      />
    );
    
    await user.click(screen.getByTestId('change-trigger'));
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith([
      [{ value: 'changed' }, { value: '' }, { value: '' }],
      [{ value: '' }, { value: '' }, { value: '' }],
      [{ value: '' }, { value: '' }, { value: '' }],
    ]);
  });

  it('does not call onChange when readOnly', async () => {
    const handleChange = vi.fn();
    
    render(
      <SpreadsheetWrapper 
        initialData={defaultData}
        onChange={handleChange}
        readOnly={true}
      />
    );
    
    // Change trigger should not be present when readOnly
    expect(screen.queryByTestId('change-trigger')).not.toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<SpreadsheetWrapper className="custom-class" />);
    
    const wrapper = screen.getByTestId('spreadsheet').parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('handles empty data gracefully', () => {
    render(<SpreadsheetWrapper initialData={[]} />);
    
    expect(screen.getByTestId('spreadsheet')).toBeInTheDocument();
    expect(screen.getByTestId('cell-count')).toHaveTextContent('0');
  });

  it('handles irregular data shapes', () => {
    const irregularData: SpreadsheetData = [
      [{ value: "A1" }],
      [{ value: "A2" }, { value: "B2" }, { value: "C2" }, { value: "D2" }],
      [{ value: "A3" }, { value: "B3" }],
    ];
    
    render(<SpreadsheetWrapper initialData={irregularData} />);
    
    expect(screen.getByTestId('cell-count')).toHaveTextContent('7');
    expect(screen.getByTestId('column-labels')).toHaveTextContent('A,B,C,D');
    expect(screen.getByTestId('row-labels')).toHaveTextContent('1,2,3');
  });
});