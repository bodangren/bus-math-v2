import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ActivityRenderer } from './ActivityRenderer';
import type { Activity } from '@/lib/db/schema/validators';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the activity registry
vi.mock('@/lib/activities/registry', () => ({
  getActivityComponent: vi.fn((componentKey: string) => {
    // Return a mock component for valid keys, null for invalid ones
    if (componentKey === 'comprehension-quiz') {
      const MockActivity = ({ title, description }: { title: string; description: string }) => (
        <div data-testid="mock-activity">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      );
      MockActivity.displayName = 'MockActivity';
      return MockActivity;
    }
    return null;
  }),
}));

describe('ActivityRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ActivityRenderer activityId="test-activity-id" />);

    // Check for the animated spinner icon
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should fetch and render activity with correct props', async () => {
    const mockActivity: Activity = {
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
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockActivity,
    });

    render(<ActivityRenderer activityId="test-activity-id" />);

    await waitFor(() => {
      expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/activities/test-activity-id');
    expect(screen.getByTestId('mock-activity')).toBeInTheDocument();
    expect(screen.getByText('Sample Quiz')).toBeInTheDocument();
  });

  it('should render required badge when required prop is true', async () => {
    const mockActivity: Activity = {
      id: 'test-activity-id',
      componentKey: 'comprehension-quiz',
      displayName: 'Required Quiz',
      description: 'A required quiz',
      props: {
        title: 'Important Quiz',
        description: 'Must complete',
        showExplanations: true,
        allowRetry: false,
        questions: [],
      },
      gradingConfig: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockActivity,
    });

    render(<ActivityRenderer activityId="test-activity-id" required={true} />);

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

    render(<ActivityRenderer activityId="test-activity-id" />);

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

    render(<ActivityRenderer activityId="test-activity-id" />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load activity/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Activity not found/i)).toBeInTheDocument();
  });

  it('should show error message when component key is invalid', async () => {
    const mockActivity: Activity = {
      id: 'test-activity-id',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      componentKey: 'invalid-component' as any,
      displayName: 'Invalid Activity',
      description: 'This component does not exist',
      props: {},
      gradingConfig: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockActivity,
    });

    render(<ActivityRenderer activityId="test-activity-id" />);

    await waitFor(() => {
      expect(screen.getByText(/Activity component not found/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/invalid-component/i)).toBeInTheDocument();
  });

  it('should show error message when network error occurs', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ActivityRenderer activityId="test-activity-id" />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load activity/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });

  it('should render description when provided', async () => {
    const mockActivity: Activity = {
      id: 'test-activity-id',
      componentKey: 'comprehension-quiz',
      displayName: 'Quiz with Description',
      description: 'This is a detailed description of the activity',
      props: {
        title: 'Sample Quiz',
        description: 'Test description',
        showExplanations: true,
        allowRetry: true,
        questions: [],
      },
      gradingConfig: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockActivity,
    });

    render(<ActivityRenderer activityId="test-activity-id" />);

    await waitFor(() => {
      expect(screen.getByText('Quiz with Description')).toBeInTheDocument();
    });

    expect(screen.getByText('This is a detailed description of the activity')).toBeInTheDocument();
  });
});
