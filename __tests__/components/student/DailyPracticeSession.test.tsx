import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockProcessPracticeSubmission = vi.fn();
const mockBuildPracticeSubmissionEnvelope = vi.fn();

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
}));

vi.mock('@/lib/convex/server', () => ({
  api: {
    srs: {
      getDueCards: 'api.srs.getDueCards',
      recordSrsReview: 'api.srs.recordSrsReview',
    },
  },
}));

vi.mock('@/lib/practice/engine/family-registry', () => ({
  practiceFamilyRegistry: {
    'test-family': {
      generate: vi.fn(() => ({ value: 42 })),
      solve: vi.fn(() => ({ answer: 42 })),
      grade: vi.fn(() => ({
        parts: [{ partId: 'p1', isCorrect: true }],
      })),
    },
    'registered-family': {
      generate: vi.fn(() => ({ value: 99 })),
      solve: vi.fn(() => ({ answer: 99 })),
      grade: vi.fn(() => ({
        parts: [{ partId: 'p1', isCorrect: true }],
      })),
    },
  },
}));

vi.mock('@/lib/practice/contract', () => ({
  buildPracticeSubmissionEnvelope: mockBuildPracticeSubmissionEnvelope,
}));

vi.mock('@/lib/srs/review-processor', () => ({
  processPracticeSubmission: mockProcessPracticeSubmission,
}));

const MockInputComponent = vi.fn(() => <div data-testid="mock-answer-input">Mock Answer Input</div>);

vi.mock('@/lib/srs/answer-inputs/registry', () => ({
  dailyPracticeInputRegistry: {
    'registered-family': MockInputComponent,
  },
}));

const { DailyPracticeSession } = await import('../../../components/student/DailyPracticeSession');

describe('DailyPracticeSession', () => {
  const mockRecordReview = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue(mockRecordReview);
    mockBuildPracticeSubmissionEnvelope.mockReturnValue({
      activityId: 'test-family',
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      answers: {},
      parts: [{ partId: 'p1', isCorrect: true }],
    });
    mockProcessPracticeSubmission.mockReturnValue({
      card: {
        problemFamilyId: 'test-family',
        studentId: 'student_1',
        card: {},
        due: Date.now() + 86400000,
        lastReview: Date.now(),
        reviewCount: 1,
        createdAt: Date.now(),
      },
      reviewLog: {
        problemFamilyId: 'test-family',
        studentId: 'student_1',
        rating: 'Good',
        scheduledAt: Date.now(),
        reviewedAt: Date.now(),
        elapsedDays: 0,
        scheduledDays: 1,
        reviewDurationMs: 5000,
        timingConfidence: 'high',
      },
      rating: 'Good',
    });
  });

  it('shows loading state while fetching due cards', () => {
    mockUseQuery.mockReturnValue(undefined);

    render(<DailyPracticeSession studentId="student_1" />);

    expect(screen.getByText(/loading your practice queue/i)).toBeInTheDocument();
  });

  it('shows completion state when no cards are due', () => {
    mockUseQuery.mockReturnValue([]);

    render(<DailyPracticeSession studentId="student_1" />);

    expect(screen.getByText(/no problems due/i)).toBeInTheDocument();
    expect(screen.getByText(/great work! you have no practice problems due right now/i)).toBeInTheDocument();
  });

  it('renders a practice problem from the queue', () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'card_1',
        studentId: 'student_1',
        problemFamilyId: 'test-family',
        card: {},
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 0,
        createdAt: Date.now(),
      },
    ]);

    render(<DailyPracticeSession studentId="student_1" />);

    expect(screen.getByRole('heading', { name: /daily practice/i })).toBeInTheDocument();
    expect(screen.getByText(/problem 1 of 1/i)).toBeInTheDocument();
    expect(screen.getByText(/test family/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit answer/i })).toBeInTheDocument();
    expect(screen.queryByText(/your answer/i)).not.toBeInTheDocument();
  });

  it('records a review and shows next problem button after submit', async () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'card_1',
        studentId: 'student_1',
        problemFamilyId: 'test-family',
        card: {},
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 0,
        createdAt: Date.now(),
      },
      {
        _id: 'card_2',
        studentId: 'student_1',
        problemFamilyId: 'test-family',
        card: {},
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 0,
        createdAt: Date.now(),
      },
    ]);

    render(<DailyPracticeSession studentId="student_1" />);

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRecordReview).toHaveBeenCalledTimes(1);
    });

    expect(mockRecordReview).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 'student_1',
        problemFamilyId: 'test-family',
        rating: 'Good',
      }),
    );

    expect(screen.getByTestId('next-problem-button')).toBeInTheDocument();
    expect(screen.getByText(/problem 1 of 2/i)).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('next-problem-button'));
    expect(screen.getByText(/problem 2 of 2/i)).toBeInTheDocument();
  });

  it('shows completion state after clicking next problem on the last card', async () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'card_1',
        studentId: 'student_1',
        problemFamilyId: 'test-family',
        card: {},
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 0,
        createdAt: Date.now(),
      },
    ]);

    render(<DailyPracticeSession studentId="student_1" />);

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRecordReview).toHaveBeenCalledTimes(1);
    });

    await userEvent.click(screen.getByTestId('next-problem-button'));
    expect(screen.getByText(/no problems due/i)).toBeInTheDocument();
  });

  it('shows loading overlay while recording review', async () => {
    let resolveReview: (() => void) | undefined;
    mockRecordReview.mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveReview = resolve;
    }));

    mockUseQuery.mockReturnValue([
      {
        _id: 'card_1',
        studentId: 'student_1',
        problemFamilyId: 'test-family',
        card: {},
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 0,
        createdAt: Date.now(),
      },
    ]);

    render(<DailyPracticeSession studentId="student_1" />);

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    expect(screen.getByText(/saving result/i)).toBeInTheDocument();

    resolveReview!();

    await waitFor(() => {
      expect(screen.queryByText(/saving result/i)).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('next-problem-button')).toBeInTheDocument();
  });

  it('moves focus to the card when advancing to the next problem', async () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'card_1',
        studentId: 'student_1',
        problemFamilyId: 'test-family',
        card: {},
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 0,
        createdAt: Date.now(),
      },
      {
        _id: 'card_2',
        studentId: 'student_1',
        problemFamilyId: 'registered-family',
        card: {},
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 0,
        createdAt: Date.now(),
      },
    ]);

    render(<DailyPracticeSession studentId="student_1" />);

    const submitButton = screen.getByRole('button', { name: /submit answer/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRecordReview).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-problem-button')).toBeInTheDocument();
    });

    const nextButton = screen.getByTestId('next-problem-button');
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/problem 2 of 2/i)).toBeInTheDocument();
    });

    const card = screen.getByTestId('practice-card');
    expect(card).toHaveFocus();
  });

  it('shows unknown family error for unregistered problem family', () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'card_1',
        studentId: 'student_1',
        problemFamilyId: 'unknown-family',
        card: {},
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 0,
        createdAt: Date.now(),
      },
    ]);

    render(<DailyPracticeSession studentId="student_1" />);

    expect(screen.getByText(/unknown practice family: unknown-family/i)).toBeInTheDocument();
  });

  it('calls useQuery with studentId', () => {
    mockUseQuery.mockReturnValue([]);

    render(<DailyPracticeSession studentId="student_1" />);

    expect(mockUseQuery).toHaveBeenCalledWith('api.srs.getDueCards', { studentId: 'student_1' });
  });

  it('renders the registered answer input component when family has one', () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'card_1',
        studentId: 'student_1',
        problemFamilyId: 'registered-family',
        card: {},
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 0,
        createdAt: Date.now(),
      },
    ]);

    render(<DailyPracticeSession studentId="student_1" />);

    expect(screen.getByTestId('mock-answer-input')).toBeInTheDocument();
    expect(MockInputComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        family: expect.any(Object),
        definition: expect.objectContaining({ value: 99 }),
        onSubmit: expect.any(Function),
      }),
      undefined,
    );
  });

  it('falls back to auto-solve renderer when family has no registered input', () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'card_1',
        studentId: 'student_1',
        problemFamilyId: 'test-family',
        card: {},
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 0,
        createdAt: Date.now(),
      },
    ]);

    render(<DailyPracticeSession studentId="student_1" />);

    expect(screen.queryByTestId('mock-answer-input')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit answer/i })).toBeInTheDocument();
  });
});
