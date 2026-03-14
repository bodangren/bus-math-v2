import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseOverviewGrid } from '@/components/teacher/CourseOverviewGrid';
import type { CourseOverviewRow, UnitColumn } from '@/lib/teacher/course-overview';

const units: UnitColumn[] = [
  { unitNumber: 1 },
  { unitNumber: 2 },
  { unitNumber: 3 },
];

const rows: CourseOverviewRow[] = [
  {
    studentId: 's1', displayName: 'Alice Brown', username: 'abrown',
    cells: [
      { unitNumber: 1, avgMastery: 90, color: 'green' },
      { unitNumber: 2, avgMastery: 60, color: 'yellow' },
      { unitNumber: 3, avgMastery: null, color: 'gray' },
    ],
  },
  {
    studentId: 's2', displayName: 'Zara Ahmed', username: 'zahmed',
    cells: [
      { unitNumber: 1, avgMastery: 40, color: 'red' },
      { unitNumber: 2, avgMastery: null, color: 'gray' },
      { unitNumber: 3, avgMastery: null, color: 'gray' },
    ],
  },
];

describe('CourseOverviewGrid rendering', () => {
  it('renders student names', () => {
    render(<CourseOverviewGrid rows={rows} units={units} />);
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    expect(screen.getByText('Zara Ahmed')).toBeInTheDocument();
  });

  it('renders a column header for each unit', () => {
    render(<CourseOverviewGrid rows={rows} units={units} />);
    expect(screen.getByText('Unit 1')).toBeInTheDocument();
    expect(screen.getByText('Unit 2')).toBeInTheDocument();
    expect(screen.getByText('Unit 3')).toBeInTheDocument();
  });

  it('unit column headers are links to the unit gradebook', () => {
    render(<CourseOverviewGrid rows={rows} units={units} />);
    // Use exact name to target only the column header link (cell links have
    // aria-labels like "Alice Brown Unit 1 — completed" which also match /unit 1/i)
    const link = screen.getByRole('link', { name: 'Unit 1' });
    expect(link).toHaveAttribute('href', '/teacher/units/1');
  });

  it('shows mastery % in cells that have data', () => {
    render(<CourseOverviewGrid rows={rows} units={units} />);
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('shows em-dash when no mastery data', () => {
    render(<CourseOverviewGrid rows={rows} units={units} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('shows empty state when no rows', () => {
    render(<CourseOverviewGrid rows={[]} units={units} />);
    expect(screen.getByText(/no students/i)).toBeInTheDocument();
  });

  it('shows empty state when no units', () => {
    render(<CourseOverviewGrid rows={rows} units={[]} />);
    expect(screen.getByText(/no units/i)).toBeInTheDocument();
  });

  it('labels the capstone column distinctly instead of Unit 9', () => {
    render(
      <CourseOverviewGrid
        rows={[
          {
            studentId: 's1',
            displayName: 'Alice Brown',
            username: 'abrown',
            cells: [{ unitNumber: 9, avgMastery: 88, color: 'green' }],
          },
        ]}
        units={[{ unitNumber: 9 }]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Capstone' })).toHaveAttribute(
      'href',
      '/teacher/units/9',
    );
    expect(screen.queryByRole('link', { name: 'Unit 9' })).not.toBeInTheDocument();
  });
});

describe('CourseOverviewGrid color contract', () => {
  it('applies green class for green cell', () => {
    render(<CourseOverviewGrid rows={[rows[0]]} units={[units[0]]} />);
    const cell = screen.getByRole('cell', { name: /alice brown.*unit 1.*completed/i });
    expect(cell).toHaveClass('bg-green-100');
  });

  it('applies yellow class for yellow cell', () => {
    render(<CourseOverviewGrid rows={[rows[0]]} units={[units[1]]} />);
    const cell = screen.getByRole('cell', { name: /alice brown.*unit 2.*in progress/i });
    expect(cell).toHaveClass('bg-yellow-100');
  });

  it('applies red class for red cell', () => {
    render(<CourseOverviewGrid rows={[rows[1]]} units={[units[0]]} />);
    const cell = screen.getByRole('cell', { name: /zara ahmed.*unit 1.*needs attention/i });
    expect(cell).toHaveClass('bg-red-100');
  });
});

describe('CourseOverviewGrid sorting', () => {
  const unsorted: CourseOverviewRow[] = [
    { studentId: 's3', displayName: 'Zara',  username: 'z', cells: [{ unitNumber: 1, avgMastery: null, color: 'gray' }] },
    { studentId: 's1', displayName: 'Alice', username: 'a', cells: [{ unitNumber: 1, avgMastery: null, color: 'gray' }] },
    { studentId: 's2', displayName: 'Mike',  username: 'm', cells: [{ unitNumber: 1, avgMastery: null, color: 'gray' }] },
  ];

  it('sorts students A→Z by default', () => {
    render(<CourseOverviewGrid rows={unsorted} units={[{ unitNumber: 1 }]} />);
    const headers = screen.getAllByRole('rowheader').map(th => th.textContent?.trim());
    expect(headers[0]).toContain('Alice');
    expect(headers[2]).toContain('Zara');
  });

  it('toggles to Z→A when sort button clicked', async () => {
    const user = userEvent.setup();
    render(<CourseOverviewGrid rows={unsorted} units={[{ unitNumber: 1 }]} />);
    await user.click(screen.getByRole('button', { name: /sort by student name/i }));
    const headers = screen.getAllByRole('rowheader').map(th => th.textContent?.trim());
    expect(headers[0]).toContain('Zara');
  });
});

describe('CourseOverviewGrid accessibility', () => {
  it('has an accessible table label', () => {
    render(<CourseOverviewGrid rows={rows} units={units} />);
    expect(screen.getByRole('table', { name: /course overview/i })).toBeInTheDocument();
  });

  it('data cells have aria-labels describing student and unit', () => {
    render(<CourseOverviewGrid rows={[rows[0]]} units={[units[0]]} />);
    expect(screen.getByRole('cell', { name: /alice brown.*unit 1/i })).toBeInTheDocument();
  });
});
