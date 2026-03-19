import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ActivityRenderer } from '../../../components/lesson/ActivityRenderer';
import type { Activity } from '@/lib/db/schema/validators';

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;
const mockCompletePhase = vi.fn();
const mockUsePhaseCompletion = vi.fn();

const { mockGetActivityComponent } = vi.hoisted(() => ({
  mockGetActivityComponent: vi.fn(),
}));

vi.mock('@/lib/activities/registry', () => {
  return {
    getActivityComponent: mockGetActivityComponent,
  };
});

vi.mock('@/hooks/usePhaseCompletion', () => ({
  usePhaseCompletion: (options: unknown) => mockUsePhaseCompletion(options),
}));

const MockActivityComponent = ({
  activity,
  onSubmit,
  onComplete,
}: {
  activity: Activity;
  onSubmit?: (payload: Record<string, unknown>) => void;
  onComplete?: (payload?: Record<string, unknown>) => void;
}) => {
  const props = activity.props as { title?: string; description?: string };

  return (
    <div data-testid="mock-activity">
      <h2>{props.title ?? activity.displayName}</h2>
      {props.description && <p>{props.description}</p>}
      {onSubmit && (
        <button onClick={() => onSubmit({ activityId: activity.id, responses: { q1: '4' } })}>
          Submit answers
        </button>
      )}
      {onComplete && (
        <button onClick={() => onComplete({ completed: true })}>
          Complete activity
        </button>
      )}
    </div>
  );
};

const buildActivity = (overrides?: Partial<Activity>): Activity => ({
  id: 'test-activity-id',
  componentKey: 'comprehension-quiz',
  displayName: 'Test Quiz',
  description: 'A test comprehension quiz',
  props: {
    title: 'Sample Quiz',
    description: 'Test your understanding',
    showExplanations: true,
    allowRetry: true,
    questions: [
      {
        id: 'q1',
        text: 'What is 2+2?',
        type: 'multiple-choice',
        options: ['3', '4', '5'],
        correctAnswer: '4',
        explanation: 'Two plus two equals four',
      },
    ],
  },
  gradingConfig: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
  standardId: overrides?.standardId ?? null,
});

describe('ActivityRenderer', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockCompletePhase.mockReset();
    mockUsePhaseCompletion.mockReset();
    mockUsePhaseCompletion.mockImplementation(() => ({
      completePhase: mockCompletePhase,
      isCompleting: false,
      error: null,
    }));
    mockGetActivityComponent.mockReset();
    mockGetActivityComponent.mockImplementation((componentKey: string) => {
      if (componentKey === 'comprehension-quiz') {
        return MockActivityComponent;
      }
      return null;
    });
  });

  it('should show loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    // Check for the animated spinner icon
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should fetch and render activity with correct props', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => buildActivity(),
    });

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    await waitFor(() => {
      expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/activities/test-activity-id');
    expect(screen.getByTestId('mock-activity')).toBeInTheDocument();
    expect(screen.getByText('Sample Quiz')).toBeInTheDocument();
  });

  it('should render required badge when required prop is true', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        buildActivity({
          displayName: 'Required Quiz',
          props: {
            title: 'Important Quiz',
            description: 'Must complete',
            showExplanations: true,
            allowRetry: false,
            questions: [],
          } as Activity['props'],
        }),
    });

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} required={true} />);

    await waitFor(() => {
      expect(screen.getByText('Required Quiz')).toBeInTheDocument();
    });

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('should show error message when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load activity/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Not Found/i)).toBeInTheDocument();
  });

  it('should show error message when activity is not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load activity/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Activity not found/i)).toBeInTheDocument();
  });

  it('should show error message when component key is invalid', async () => {
    mockGetActivityComponent!.mockImplementation(() => null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        buildActivity({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          componentKey: 'invalid-component' as any,
          displayName: 'Invalid Activity',
        }),
    });

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Activity component not found/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/invalid-component/i)).toBeInTheDocument();
  });

  it('should show error message when network error occurs', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load activity/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });

  it('should render description when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        buildActivity({
          displayName: 'Quiz with Description',
          description: 'This is a detailed description of the activity',
        }),
    });

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    await waitFor(() => {
      expect(screen.getByText('Quiz with Description')).toBeInTheDocument();
    });

    expect(screen.getByText('This is a detailed description of the activity')).toBeInTheDocument();
  });

  it('submits answers to the assessment API and shows server score', async () => {
    const gradedActivity = buildActivity({
      gradingConfig: {
        autoGrade: true,
        passingScore: 80,
        partialCredit: false,
      },
    });

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => gradedActivity,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          score: 3,
          maxScore: 4,
          percentage: 75,
          feedback: 'Great effort!',
        }),
      });

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    await waitFor(() => {
      expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit answers/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Assessment submitted/i)).toBeInTheDocument();
    });

    const submissionCall = mockFetch.mock.calls[1];
    expect(submissionCall?.[0]).toBe('/api/progress/assessment');
    const body = JSON.parse(submissionCall?.[1]?.body as string);
    expect(body).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: gradedActivity.id,
      mode: 'assessment',
      status: 'submitted',
      attemptNumber: 1,
      answers: { q1: '4' },
      parts: [
        {
          partId: 'q1',
          rawAnswer: '4',
          normalizedAnswer: '4',
        },
      ],
    });
    expect(body).not.toHaveProperty('score');

    expect(screen.getByText(/3\/4/)).toBeInTheDocument();
    expect(screen.getByText(/Great effort/)).toBeInTheDocument();
  });

  it('shows an error when assessment submission fails', async () => {
    const gradedActivity = buildActivity({
      gradingConfig: {
        autoGrade: true,
        passingScore: 80,
        partialCredit: false,
      },
    });

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => gradedActivity,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unable to save submission' }),
      });

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    await waitFor(() => {
      expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit answers/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Unable to save submission/i)).toBeInTheDocument();
    });
  });

  it('uses phase completion hook for activity completion', async () => {
    mockUsePhaseCompletion.mockImplementation((options: {
      onSuccess?: (response: { success: boolean; nextPhaseUnlocked: boolean; message?: string }) => void;
    }) => ({
      completePhase: async () => {
        options.onSuccess?.({
          success: true,
          nextPhaseUnlocked: true,
          message: 'Phase completion recorded',
        });
      },
      isCompleting: false,
      error: null,
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => buildActivity(),
    });

    render(
      <ActivityRenderer
        activityId="test-activity-id"
        lessonId="123e4567-e89b-12d3-a456-426614174000"
        phaseNumber={2}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /complete activity/i }));

    await waitFor(() => {
      expect(screen.getByText(/Activity completed!/i)).toBeInTheDocument();
      expect(screen.getByText(/Phase completion recorded/i)).toBeInTheDocument();
    });

    expect(mockUsePhaseCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: '123e4567-e89b-12d3-a456-426614174000',
        phaseNumber: 2,
        phaseType: 'do',
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it('triggers phase completion when onSubmit payload marks the activity complete', async () => {
    const SubmitCompletionComponent = ({
      onSubmit,
    }: {
      onSubmit?: (payload: Record<string, unknown>) => void;
    }) => (
      <button
        onClick={() =>
          onSubmit?.({
            activityId: 'test-activity-id',
            isComplete: true,
            completedAt: new Date(),
          })
        }
      >
        Submit complete payload
      </button>
    );

    mockGetActivityComponent.mockImplementation((componentKey: string) => {
      if (componentKey === 'spreadsheet-evaluator') {
        return SubmitCompletionComponent;
      }
      return null;
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        buildActivity({
          componentKey: 'spreadsheet-evaluator',
        }),
    });

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit complete payload/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /submit complete payload/i }));

    await waitFor(() => {
      expect(mockCompletePhase).toHaveBeenCalledTimes(1);
    });
  });

  it('forwards linkedStandardId to usePhaseCompletion when provided', async () => {
    const standardId = 'd6b57545-65f6-4c39-80d5-aabb00000001';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => buildActivity(),
    });

    render(
      <ActivityRenderer
        activityId="test-activity-id"
        lessonId="test-lesson-id"
        phaseNumber={1}
        linkedStandardId={standardId}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-activity')).toBeInTheDocument();
    });

    expect(mockUsePhaseCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ linkedStandardId: standardId }),
    );
  });

  it('does not trigger phase completion when onSubmit payload is incomplete', async () => {
    const SubmitIncompleteComponent = ({
      onSubmit,
    }: {
      onSubmit?: (payload: Record<string, unknown>) => void;
    }) => (
      <button
        onClick={() =>
          onSubmit?.({
            activityId: 'test-activity-id',
            isComplete: false,
            completedAt: new Date(),
          })
        }
      >
        Submit incomplete payload
      </button>
    );

    mockGetActivityComponent.mockImplementation((componentKey: string) => {
      if (componentKey === 'spreadsheet-evaluator') {
        return SubmitIncompleteComponent;
      }
      return null;
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () =>
        buildActivity({
          componentKey: 'spreadsheet-evaluator',
        }),
    });

    render(<ActivityRenderer activityId="test-activity-id" lessonId="test-lesson-id" phaseNumber={1} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit incomplete payload/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /submit incomplete payload/i }));

    await waitFor(() => {
      expect(mockCompletePhase).not.toHaveBeenCalled();
    });
  });
});
