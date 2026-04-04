import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LessonErrorSummary } from '@/components/teacher/LessonErrorSummary';

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------

const MOCK_SUMMARY = {
  type: 'deterministic',
  lessonId: 'lesson-123',
  generatedAt: Date.now(),
  partSummaries: [
    {
      partId: 'journal-entry-1',
      totalAttempts: 10,
      correctCount: 7,
      incorrectCount: 3,
      accuracyRate: 0.7,
    },
    {
      partId: 'classification-1',
      totalAttempts: 10,
      correctCount: 9,
      incorrectCount: 1,
      accuracyRate: 0.9,
    },
  ],
  topMisconceptions: [
    {
      tag: 'debit-credit-reversal',
      count: 5,
      affectedParts: ['journal-entry-1'],
      affectedStudents: ['student-1', 'student-2', 'student-3'],
    },
    {
      tag: 'classification-error',
      count: 2,
      affectedParts: ['classification-1'],
      affectedStudents: ['student-4'],
    },
  ],
  studentCount: 10,
  averageAccuracy: 0.8,
};

const EMPTY_SUMMARY = {
  type: 'deterministic',
  lessonId: 'lesson-456',
  generatedAt: Date.now(),
  partSummaries: [],
  topMisconceptions: [],
  studentCount: 0,
  averageAccuracy: 0,
};

function mockFetchSuccess() {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () => Promise.resolve(MOCK_SUMMARY),
  } as Response);
}

function mockFetchNotFound() {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: 'No practice submissions found' }),
  } as Response);
}

function mockFetchEmpty() {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: () => Promise.resolve(EMPTY_SUMMARY),
  } as Response);
}

function mockFetchError() {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: () => Promise.resolve({ error: 'Internal server error' }),
  } as Response);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LessonErrorSummary', () => {
  it('renders loading state initially', () => {
    mockFetchSuccess();
    render(<LessonErrorSummary lessonId="lesson-123" />);
    expect(screen.getByText(/loading error summary/i)).toBeInTheDocument();
  });

  it('renders class-wide stats after fetch', async () => {
    mockFetchSuccess();
    render(<LessonErrorSummary lessonId="lesson-123" />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getAllByText('Debit/Credit Reversal').length).toBeGreaterThanOrEqual(1);
  });

  it('renders misconception overview with tags', async () => {
    mockFetchSuccess();
    render(<LessonErrorSummary lessonId="lesson-123" />);

    await waitFor(() => {
      expect(screen.getByText('Misconception Overview')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Debit/Credit Reversal').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Classification Error')).toBeInTheDocument();
    expect(screen.getByText('mechanics')).toBeInTheDocument();
    expect(screen.getByText('classification')).toBeInTheDocument();
  });

  it('shows affected student counts per misconception', async () => {
    mockFetchSuccess();
    render(<LessonErrorSummary lessonId="lesson-123" />);

    await waitFor(() => {
      expect(screen.getByText('3 students')).toBeInTheDocument();
    });
    expect(screen.getByText('1 student')).toBeInTheDocument();
  });

  it('renders per-part accuracy rates', async () => {
    mockFetchSuccess();
    render(<LessonErrorSummary lessonId="lesson-123" />);

    await waitFor(() => {
      expect(screen.getByText('Per-Part Accuracy')).toBeInTheDocument();
    });

    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('7/10 correct')).toBeInTheDocument();
    expect(screen.getByText('9/10 correct')).toBeInTheDocument();
  });

  it('shows empty state when no submissions exist (404)', async () => {
    mockFetchNotFound();
    render(<LessonErrorSummary lessonId="lesson-456" />);

    await waitFor(() => {
      expect(screen.getByText(/no practice submissions recorded/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when summary has no data', async () => {
    mockFetchEmpty();
    render(<LessonErrorSummary lessonId="lesson-456" />);

    await waitFor(() => {
      expect(screen.getByText('None detected')).toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    mockFetchError();
    render(<LessonErrorSummary lessonId="lesson-123" />);

    await waitFor(() => {
      expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
    });
  });

  it('shows AI insights placeholder', async () => {
    mockFetchSuccess();
    render(<LessonErrorSummary lessonId="lesson-123" />);

    await waitFor(() => {
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
    });

    expect(screen.getByText(/per-student through the submission detail view/i)).toBeInTheDocument();
  });
});
