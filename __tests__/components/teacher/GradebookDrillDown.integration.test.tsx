import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockFetchInternalQuery = vi.fn();
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    teacher: {
      getTeacherLessonMonitoringData: 'getTeacherLessonMonitoringData',
    },
  },
}));

describe('Gradebook Drill-Down Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens submission detail modal when gradebook cell is clicked', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      detail: {
        studentName: 'Alice Brown',
        lessonTitle: 'Accounting Equation',
        phases: [],
      },
    });

    const { GradebookGrid } = await import('@/components/teacher/GradebookGrid');
    const mockGradebookData = {
      rows: [
        {
          studentId: 'student1',
          displayName: 'Alice Brown',
          username: 'abrown',
          cells: [
            {
              lesson: {
                lessonId: 'lesson1',
                lessonTitle: 'Accounting Equation',
                orderIndex: 1,
                isUnitTest: false,
              },
              completionStatus: 'completed',
              masteryLevel: 85,
              color: 'green',
              independentPractice: {
                mode: 'independent_practice',
                completed: true,
                score: 85,
                maxScore: 100,
              },
              assessment: null,
            },
          ],
        },
      ],
      lessons: [
        {
          lessonId: 'lesson1',
          lessonTitle: 'Accounting Equation',
          orderIndex: 1,
          isUnitTest: false,
        },
      ],
    };

    render(<GradebookGrid rows={mockGradebookData.rows} lessons={mockGradebookData.lessons} unitNumber={1} />);

    const gradebookCell = screen.getByRole('cell');
    expect(gradebookCell).toBeInTheDocument();

    fireEvent.click(gradebookCell);

    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  it('shows independent practice indicator when IP is completed', async () => {
    const { GradebookGrid } = await import('@/components/teacher/GradebookGrid');
    const mockGradebookData = {
      rows: [
        {
          studentId: 'student1',
          displayName: 'Alice Brown',
          username: 'abrown',
          cells: [
            {
              lesson: {
                lessonId: 'lesson1',
                lessonTitle: 'Accounting Equation',
                orderIndex: 1,
                isUnitTest: false,
              },
              completionStatus: 'in_progress',
              masteryLevel: 70,
              color: 'yellow',
              independentPractice: {
                mode: 'independent_practice',
                completed: true,
                score: 75,
                maxScore: 100,
              },
              assessment: null,
            },
          ],
        },
      ],
      lessons: [
        {
          lessonId: 'lesson1',
          lessonTitle: 'Accounting Equation',
          orderIndex: 1,
          isUnitTest: false,
        },
      ],
    };

    render(<GradebookGrid rows={mockGradebookData.rows} lessons={mockGradebookData.lessons} unitNumber={1} />);

    const gradebookCell = screen.getByRole('cell');
    expect(gradebookCell).toBeInTheDocument();

    const ipIndicator = screen.getByText(/IP/);
    expect(ipIndicator).toBeInTheDocument();
  });

  it('shows assessment indicator when assessment is completed', async () => {
    const { GradebookGrid } = await import('@/components/teacher/GradebookGrid');
    const mockGradebookData = {
      rows: [
        {
          studentId: 'student1',
          displayName: 'Alice Brown',
          username: 'abrown',
          cells: [
            {
              lesson: {
                lessonId: 'lesson1',
                lessonTitle: 'Accounting Equation',
                orderIndex: 1,
                isUnitTest: false,
              },
              completionStatus: 'in_progress',
              masteryLevel: null,
              color: 'yellow',
              independentPractice: null,
              assessment: {
                mode: 'assessment',
                completed: true,
                score: 90,
                maxScore: 100,
                gradedAt: 1234567890,
              },
            },
          ],
        },
      ],
      lessons: [
        {
          lessonId: 'lesson1',
          lessonTitle: 'Accounting Equation',
          orderIndex: 1,
          isUnitTest: false,
        },
      ],
    };

    render(<GradebookGrid rows={mockGradebookData.rows} lessons={mockGradebookData.lessons} unitNumber={1} />);

    const gradebookCell = screen.getByRole('cell');
    expect(gradebookCell).toBeInTheDocument();

    const assessmentIndicator = screen.getByText(/A: 90\/100/);
    expect(assessmentIndicator).toBeInTheDocument();
  });

  it('shows both IP and assessment indicators when both are completed', async () => {
    const { GradebookGrid } = await import('@/components/teacher/GradebookGrid');
    const mockGradebookData = {
      rows: [
        {
          studentId: 'student1',
          displayName: 'Alice Brown',
          username: 'abrown',
          cells: [
            {
              lesson: {
                lessonId: 'lesson1',
                lessonTitle: 'Accounting Equation',
                orderIndex: 1,
                isUnitTest: false,
              },
              completionStatus: 'in_progress',
              masteryLevel: null,
              color: 'yellow',
              independentPractice: {
                mode: 'independent_practice',
                completed: true,
                score: 85,
                maxScore: 100,
              },
              assessment: {
                mode: 'assessment',
                completed: true,
                score: 90,
                maxScore: 100,
                gradedAt: 1234567890,
              },
            },
          ],
        },
      ],
      lessons: [
        {
          lessonId: 'lesson1',
          lessonTitle: 'Accounting Equation',
          orderIndex: 1,
          isUnitTest: false,
        },
      ],
    };

    render(<GradebookGrid rows={mockGradebookData.rows} lessons={mockGradebookData.lessons} unitNumber={1} />);

    const gradebookCell = screen.getByRole('cell');
    expect(gradebookCell).toBeInTheDocument();

    const ipIndicator = screen.getByText(/IP/);
    const assessmentIndicator = screen.getByText(/A: 90\/100/);
    
    expect(ipIndicator).toBeInTheDocument();
    expect(assessmentIndicator).toBeInTheDocument();
  });

  it('passes independent practice and assessment status to modal when clicked', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      detail: {
        studentName: 'Alice Brown',
        lessonTitle: 'Accounting Equation',
        phases: [],
      },
    });

    const { GradebookGrid } = await import('@/components/teacher/GradebookGrid');
    const mockGradebookData = {
      rows: [
        {
          studentId: 'student1',
          displayName: 'Alice Brown',
          username: 'abrown',
          cells: [
            {
              lesson: {
                lessonId: 'lesson1',
                lessonTitle: 'Accounting Equation',
                orderIndex: 1,
                isUnitTest: false,
              },
              completionStatus: 'in_progress',
              masteryLevel: 70,
              color: 'yellow',
              independentPractice: {
                mode: 'independent_practice',
                completed: true,
                score: 85,
                maxScore: 100,
              },
              assessment: {
                mode: 'assessment',
                completed: true,
                score: 90,
                maxScore: 100,
                gradedAt: 1234567890,
              },
            },
          ],
        },
      ],
      lessons: [
        {
          lessonId: 'lesson1',
          lessonTitle: 'Accounting Equation',
          orderIndex: 1,
          isUnitTest: false,
        },
      ],
    };

    render(<GradebookGrid rows={mockGradebookData.rows} lessons={mockGradebookData.lessons} unitNumber={1} />);

    const gradebookCell = screen.getByRole('cell');
    expect(gradebookCell).toBeInTheDocument();

    fireEvent.click(gradebookCell);

    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      
      expect(screen.getByText(/Alice Brown/)).toBeInTheDocument();
      expect(screen.getByText(/Accounting Equation/)).toBeInTheDocument();
    });
  });
});