import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GradebookGrid } from '@/components/teacher/GradebookGrid';
import type { GradebookRow } from '@/lib/teacher/gradebook';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const makeLesson = (orderIndex: number) => ({
  lessonId: `lesson-${orderIndex}`,
  lessonTitle: orderIndex === 11 ? 'Unit Test' : `Lesson ${orderIndex}`,
  orderIndex,
  isUnitTest: orderIndex === 11,
});

const makeCell = (
  orderIndex: number,
  color: 'green' | 'yellow' | 'red' | 'gray' = 'gray',
  masteryLevel: number | null = null,
  completionStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started',
) => ({
  lesson: makeLesson(orderIndex),
  completionStatus,
  masteryLevel,
  color,
});

const makeRow = (
  studentId: string,
  displayName: string,
  username: string,
  cells: ReturnType<typeof makeCell>[] = [],
): GradebookRow => ({ studentId, displayName, username, cells });

const lessons = Array.from({ length: 11 }, (_, i) => makeLesson(i + 1));

const twoStudents: GradebookRow[] = [
  makeRow('s1', 'Alice Brown', 'abrown', [
    makeCell(1, 'green', 90, 'completed'),
    makeCell(2, 'yellow', 60, 'in_progress'),
    ...Array.from({ length: 9 }, (_, i) => makeCell(i + 3)),
  ]),
  makeRow('s2', 'Zara Ahmed', 'zahmed', [
    makeCell(1, 'red', 30, 'not_started'),
    ...Array.from({ length: 10 }, (_, i) => makeCell(i + 2)),
  ]),
];

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('GradebookGrid rendering', () => {
  it('renders student names', () => {
    render(<GradebookGrid rows={twoStudents} lessons={lessons} />);
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    expect(screen.getByText('Zara Ahmed')).toBeInTheDocument();
  });

  it('renders a column header for each lesson', () => {
    render(<GradebookGrid rows={twoStudents} lessons={lessons} />);
    // L1–L10
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(`L${i}`)).toBeInTheDocument();
    }
  });

  it('renders the unit test column header distinctly', () => {
    render(<GradebookGrid rows={twoStudents} lessons={lessons} />);
    expect(screen.getByText('Unit Test')).toBeInTheDocument();
  });

  it('shows mastery percentage in a cell when available', () => {
    render(<GradebookGrid rows={twoStudents} lessons={lessons} />);
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('shows an em-dash when no mastery data', () => {
    render(<GradebookGrid rows={twoStudents} lessons={lessons} />);
    // Several cells have null mastery; there should be multiple em-dashes
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('shows empty state when no rows are provided', () => {
    render(<GradebookGrid rows={[]} lessons={lessons} />);
    expect(screen.getByText(/no students/i)).toBeInTheDocument();
  });

  it('shows empty state when lessons array is empty', () => {
    render(<GradebookGrid rows={twoStudents} lessons={[]} />);
    expect(screen.getByText(/no lessons/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Color contract
// ---------------------------------------------------------------------------

describe('GradebookGrid color contract', () => {
  it('applies green class for a completed cell', () => {
    const rows = [
      makeRow('s1', 'Alice', 'alice', [makeCell(1, 'green', 90, 'completed')]),
    ];
    render(<GradebookGrid rows={rows} lessons={[makeLesson(1)]} />);
    const cell = screen.getByRole('cell', { name: /lesson 1.*completed/i });
    expect(cell).toHaveClass('bg-green-100');
  });

  it('applies yellow class for an in-progress cell', () => {
    const rows = [
      makeRow('s1', 'Alice', 'alice', [makeCell(1, 'yellow', 60, 'in_progress')]),
    ];
    render(<GradebookGrid rows={rows} lessons={[makeLesson(1)]} />);
    const cell = screen.getByRole('cell', { name: /lesson 1.*in progress/i });
    expect(cell).toHaveClass('bg-yellow-100');
  });

  it('applies red class for a cell that needs attention', () => {
    const rows = [
      makeRow('s1', 'Alice', 'alice', [makeCell(1, 'red', 30, 'not_started')]),
    ];
    render(<GradebookGrid rows={rows} lessons={[makeLesson(1)]} />);
    const cell = screen.getByRole('cell', { name: /lesson 1.*needs attention/i });
    expect(cell).toHaveClass('bg-red-100');
  });

  it('applies muted class for a gray (no data) cell', () => {
    const rows = [
      makeRow('s1', 'Alice', 'alice', [makeCell(1, 'gray', null, 'not_started')]),
    ];
    render(<GradebookGrid rows={rows} lessons={[makeLesson(1)]} />);
    const cell = screen.getByRole('cell', { name: /lesson 1.*not started/i });
    expect(cell).toHaveClass('bg-muted/30');
  });
});

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

describe('GradebookGrid sorting', () => {
  // Need at least one lesson so the table (not the empty-state) renders
  const oneLesson = [makeLesson(1)];

  const unsortedRows: GradebookRow[] = [
    makeRow('s3', 'Zara Ahmed', 'zahmed'),
    makeRow('s1', 'Alice Brown', 'abrown'),
    makeRow('s2', 'Mike Chen', 'mchen'),
  ];

  it('renders students sorted by display name by default', () => {
    render(<GradebookGrid rows={unsortedRows} lessons={oneLesson} />);
    const names = screen.getAllByRole('rowheader').map(th => th.textContent?.trim());
    expect(names[0]).toContain('Alice Brown');
    expect(names[1]).toContain('Mike Chen');
    expect(names[2]).toContain('Zara Ahmed');
  });

  it('toggles sort direction when name header is clicked', async () => {
    const user = userEvent.setup();
    render(<GradebookGrid rows={unsortedRows} lessons={oneLesson} />);

    const sortBtn = screen.getByRole('button', { name: /sort by student name/i });
    await user.click(sortBtn);

    const names = screen.getAllByRole('rowheader').map(th => th.textContent?.trim());
    expect(names[0]).toContain('Zara Ahmed');
    expect(names[2]).toContain('Alice Brown');
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('GradebookGrid accessibility', () => {
  it('has an accessible table label', () => {
    render(<GradebookGrid rows={twoStudents} lessons={lessons} />);
    expect(screen.getByRole('table', { name: /gradebook/i })).toBeInTheDocument();
  });

  it('uses th scope="row" for student name cells', () => {
    render(<GradebookGrid rows={twoStudents} lessons={lessons} />);
    const rowHeaders = screen.getAllByRole('rowheader');
    expect(rowHeaders.length).toBe(twoStudents.length);
  });

  it('uses th scope="col" for lesson column headers', () => {
    render(<GradebookGrid rows={twoStudents} lessons={lessons} />);
    const colHeaders = screen.getAllByRole('columnheader');
    // Student name header + 11 lesson headers
    expect(colHeaders.length).toBe(12);
  });

  it('each data cell has an aria-label describing student and lesson', () => {
    render(<GradebookGrid rows={[twoStudents[0]]} lessons={[makeLesson(1)]} />);
    const cell = screen.getByRole('cell', { name: /alice brown.*lesson 1/i });
    expect(cell).toBeInTheDocument();
  });
});
