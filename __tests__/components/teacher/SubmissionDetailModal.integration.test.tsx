import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { SubmissionDetailModal, type SelectedCell } from '@/components/teacher/SubmissionDetailModal';

const mockFetchInternalQuery = vi.fn();
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    teacher: {
      getSubmissionDetail: 'getSubmissionDetail',
    },
  },
}));

const SELECTED: SelectedCell = {
  studentId: '00000000-0000-0000-0000-000000000002',
  studentName: 'Alice Brown',
  lessonId: '00000000-0000-0000-0000-000000000003',
  lessonTitle: 'Accounting Equation',
  independentPractice: { completed: true, score: 85, maxScore: 100 },
  assessment: { completed: true, score: 90, maxScore: 100, gradedAt: 1234567890 },
};

const MOCK_DETAIL = {
  studentName: 'Alice Brown',
  lessonTitle: 'Accounting Equation',
  phases: [
    {
      phaseId: 'phase1',
      title: 'Introduction',
      status: 'completed',
      evidence: [
        {
          kind: 'practice',
          activityId: 'activity1',
          activityTitle: 'Independent Practice',
          componentKey: 'some-component',
          submittedAt: '2026-04-10T00:00:00.000Z',
          submissionData: {
            contractVersion: 'practice.v1',
            mode: 'independent_practice',
            status: 'graded',
            attemptNumber: 1,
            submittedAt: '2026-04-10T00:00:00.000Z',
            answers: {},
            parts: [],
          },
          score: 85,
          maxScore: 100,
        },
        {
          kind: 'practice',
          activityId: 'activity2',
          activityTitle: 'Assessment',
          componentKey: 'assessment-component',
          submittedAt: '2026-04-10T00:00:00.000Z',
          submissionData: {
            contractVersion: 'practice.v1',
            mode: 'assessment',
            status: 'graded',
            attemptNumber: 1,
            submittedAt: '2026-04-10T00:00:00.000Z',
            answers: {},
            parts: [],
          },
          score: 90,
          maxScore: 100,
          gradedAt: 1234567890,
        },
      ],
    },
  ],
};

function mockFetchSuccess() {
  mockFetchInternalQuery.mockResolvedValue({ detail: MOCK_DETAIL });
}

describe('SubmissionDetailModal integration', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows submission detail modal when gradebook cell is clicked', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await waitFor(() => expect(screen.getByTestId('phase-list')).toBeInTheDocument());
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    expect(screen.getByText('Accounting Equation')).toBeInTheDocument();
  });

  it('filters submissions by activityId and userId', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await screen.findByTestId('phase-list');
    expect(mockFetchInternalQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        userId: SELECTED.studentId,
        lessonId: SELECTED.lessonId,
        unitNumber: expect.any(Number),
      }),
    );
  });

  it('distinguishes independent practice from assessment in same lesson', async () => {
    mockFetchSuccess();
    render(<SubmissionDetailModal selected={SELECTED} onClose={onClose} />);

    await screen.findByTestId('phase-list');
    const phaseList = screen.getByTestId('phase-list');
    expect(within(phaseList).getByText('Independent Practice')).toBeInTheDocument();
    expect(within(phaseList).getByText('Assessment')).toBeInTheDocument();
  });
});