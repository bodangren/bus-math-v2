import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SubmissionDetailModal, type SelectedCell } from '@/components/teacher/SubmissionDetailModal';
import type { SubmissionDetail } from '@/lib/teacher/submission-detail';

// ---------------------------------------------------------------------------
// Mock Convex server module
// ---------------------------------------------------------------------------

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn(async (_ref: unknown, args: Record<string, unknown>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(args)) {
      params.set(key, String(value));
    }
    const response = await global.fetch(`/api/submission-detail?${params.toString()}`);
    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.error ?? 'Request failed');
    }
    const detail = await response.json();
    return { detail };
  }),
  internal: {
    teacher: {
      getTeacherLessonMonitoringData: 'getTeacherLessonMonitoringData',
    },
  },
}));

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------

const SELECTED: SelectedCell = {
  studentId: '00000000-0000-0000-0000-000000000002',
  studentName: 'Alice Brown',
  lessonId:   '00000000-0000-0000-0000-000000000003',
  lessonTitle: 'Accounting Equation',
};

const MOCK_DETAIL: SubmissionDetail = {
  studentName: 'Alice Brown',
  lessonTitle: 'Accounting Equation',
  phases: [
    { phaseNumber: 1, phaseId: 'p1', title: 'Hook',                 status: 'completed',  completedAt: '2024-01-10T12:00:00.000Z', spreadsheetData: null },
    { phaseNumber: 2, phaseId: 'p2', title: 'Introduction',         status: 'completed',  completedAt: '2024-01-11T12:00:00.000Z', spreadsheetData: null },
    { phaseNumber: 3, phaseId: 'p3', title: 'Guided Practice',      status: 'in_progress',completedAt: null,                       spreadsheetData: null },
    { phaseNumber: 4, phaseId: 'p4', title: 'Independent Practice', status: 'not_started',completedAt: null,                       spreadsheetData: null },
    { phaseNumber: 5, phaseId: 'p5', title: 'Assessment',           status: 'not_started',completedAt: null,                       spreadsheetData: null },
    { phaseNumber: 6, phaseId: 'p6', title: 'Closing',              status: 'not_started',completedAt: null,                       spreadsheetData: null },
  ],
};

const PRACTICE_DETAIL: SubmissionDetail = {
  ...MOCK_DETAIL,
  phases: [
    {
      ...MOCK_DETAIL.phases[0],
      evidence: [
        {
          kind: 'practice',
          activityId: 'practice-1',
          activityTitle: 'Journal Entry Check',
          componentKey: 'journal-entry-building',
          submittedAt: '2026-03-19T12:30:00.000Z',
          attemptNumber: 2,
          score: 6,
          maxScore: 8,
          feedback: 'Strong structure, but credit/debit order still needs work.',
          submissionData: {
            contractVersion: 'practice.v1',
            activityId: 'practice-1',
            mode: 'guided_practice',
            status: 'submitted',
            attemptNumber: 2,
            submittedAt: '2026-03-19T12:30:00.000Z',
            answers: {
              q1: 'Cash',
              q2: 'Revenue',
            },
            parts: [
              {
                partId: 'q1',
                rawAnswer: 'Cash',
                normalizedAnswer: 'cash',
                isCorrect: true,
                score: 1,
                maxScore: 1,
                misconceptionTags: [],
                hintsUsed: 1,
                revealStepsSeen: 0,
                changedCount: 2,
              },
              {
                partId: 'q2',
                rawAnswer: 'Revenue',
                normalizedAnswer: 'revenue',
                isCorrect: false,
                score: 0,
                maxScore: 1,
                misconceptionTags: ['normal-balance'],
                hintsUsed: 0,
                revealStepsSeen: 1,
                changedCount: 1,
              },
            ],
            artifact: {
              kind: 'journal_entry',
              title: 'Two-line journal',
            },
            interactionHistory: [],
            analytics: {
              source: 'student-runtime',
            },
            studentFeedback: 'I mixed up one line.',
            teacherSummary: 'Review the credit line order.',
          },
        },
      ],
    },
    ...MOCK_DETAIL.phases.slice(1),
  ],
};

function mockFetchSuccess(detail: SubmissionDetail = MOCK_DETAIL) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(detail),
  } as Response);
}

function mockFetchError(message = 'Lesson not found or has no published phases') {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve({ error: message }),
  } as Response);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SubmissionDetailModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the student name and lesson title in the header', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => expect(screen.getByTestId('phase-list')).toBeInTheDocument());
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    expect(screen.getByText('Accounting Equation')).toBeInTheDocument();

    const actWarnings = consoleErrorSpy.mock.calls
      .flatMap((call) => call.map((value) => String(value)))
      .filter((message) => message.includes('not wrapped in act'));

    expect(actWarnings).toHaveLength(0);
  });

  it('shows a loading indicator before data arrives', () => {
    // Pending promise — never resolves during this test
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    expect(screen.getByText(/loading practice evidence/i)).toBeInTheDocument();
  });

  it('renders all 6 phase rows after successful fetch', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => expect(screen.getByTestId('phase-list')).toBeInTheDocument());

    expect(screen.getByText(/Phase 1: Hook/)).toBeInTheDocument();
    expect(screen.getByText(/Phase 2: Introduction/)).toBeInTheDocument();
    expect(screen.getByText(/Phase 3: Guided Practice/)).toBeInTheDocument();
    expect(screen.getByText(/Phase 4: Independent Practice/)).toBeInTheDocument();
    expect(screen.getByText(/Phase 5: Assessment/)).toBeInTheDocument();
    expect(screen.getByText(/Phase 6: Closing/)).toBeInTheDocument();
  });

  it('shows correct status badges for each phase', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => screen.getByTestId('phase-list'));

    const completedBadges = screen.getAllByText('Completed');
    expect(completedBadges).toHaveLength(2); // phases 1 & 2

    expect(screen.getByText('In Progress')).toBeInTheDocument(); // phase 3
    const notStartedBadges = screen.getAllByText('Not Started');
    expect(notStartedBadges).toHaveLength(3); // phases 4, 5, 6
  });

  it('renders practice evidence with answers and raw envelope controls', async () => {
    mockFetchSuccess(PRACTICE_DETAIL);
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await screen.findByText('Journal Entry Check');

    expect(screen.getByText('Submission Snapshot')).toBeInTheDocument();
    expect(screen.getByText('Journal Entry Check')).toBeInTheDocument();
    expect(screen.getByText('Part-by-Part Answers')).toBeInTheDocument();
    expect(screen.getAllByText('Attempt 2').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /view raw response/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /view raw response/i }));
    expect(screen.getByText(/"contractVersion": "practice\.v1"/i)).toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', async () => {
    mockFetchError('Lesson not found or has no published phases');
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() =>
      expect(
        screen.getByText(/lesson not found or has no published phases/i),
      ).toBeInTheDocument(),
    );
  });

  it('calls onClose when the close button is clicked', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => expect(screen.getByTestId('phase-list')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /close submission detail/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    const actWarnings = consoleErrorSpy.mock.calls
      .flatMap((call) => call.map((value) => String(value)))
      .filter((message) => message.includes('not wrapped in act'));

    expect(actWarnings).toHaveLength(0);
  });

  it('calls onClose when Escape key is pressed', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => expect(screen.getByTestId('phase-list')).toBeInTheDocument());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has role="dialog" and aria-modal="true" for accessibility', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => expect(screen.getByTestId('phase-list')).toBeInTheDocument());
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('displays the read-only callout in the footer', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => expect(screen.getByTestId('phase-list')).toBeInTheDocument());
    expect(
      screen.getByText(/read-only evidence review/i),
    ).toBeInTheDocument();
  });

  // ── Mutation-guard tests ───────────────────────────────────────────────────

  it('contains no submit, save, or edit buttons — teacher cannot mutate student work', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => screen.getByTestId('phase-list'));

    const buttons = screen.getAllByRole('button');
    const mutationLabels = /submit|save|edit|update|delete|mark complete|reset/i;

    for (const btn of buttons) {
      expect(btn.textContent).not.toMatch(mutationLabels);
      expect(btn.getAttribute('aria-label') ?? '').not.toMatch(mutationLabels);
    }
  });

  it('contains no input, textarea, or select elements — view is read-only', async () => {
    mockFetchSuccess();
    const { container } = render(
      <SubmissionDetailModal selected={SELECTED} onClose={onClose} />,
    );

    await waitFor(() => screen.getByTestId('phase-list'));

    // Forms and editable widgets should be absent
    expect(container.querySelectorAll('input:not([readonly])')).toHaveLength(0);
    expect(container.querySelectorAll('textarea:not([readonly])')).toHaveLength(0);
    expect(container.querySelectorAll('select')).toHaveLength(0);
  });

  it('fetches with correct studentId and lessonId from selected prop', async () => {
    const { fetchInternalQuery } = await import('@/lib/convex/server');
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => {
      expect(fetchInternalQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: SELECTED.studentId,
          lessonId: SELECTED.lessonId,
        }),
      );
    });
  });

  it('does not emit React act warnings while fetched detail data settles', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchSuccess();

    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => expect(screen.getByTestId('phase-list')).toBeInTheDocument());

    const actWarnings = consoleErrorSpy.mock.calls
      .flatMap((call) => call.map((value) => String(value)))
      .filter((message) => message.includes('not wrapped in act'));

    expect(actWarnings).toHaveLength(0);
  });
});
