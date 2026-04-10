import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LessonChatbot } from '@/components/student/LessonChatbot';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('LessonChatbot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the floating button by default', () => {
    render(<LessonChatbot lessonId="lesson_01_01" phaseNumber={1} />);
    expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
  });

  it('expands the chat interface when button is clicked', () => {
    render(<LessonChatbot lessonId="lesson_01_01" phaseNumber={1} />);
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    expect(screen.getByPlaceholderText(/ask a question about this lesson/i)).toBeInTheDocument();
  });

  it('shows loading state when submitting a question', async () => {
    mockFetch.mockResolvedValueOnce(new Promise(() => {}));
    render(<LessonChatbot lessonId="lesson_01_01" phaseNumber={1} />);
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    fireEvent.change(screen.getByPlaceholderText(/ask a question about this lesson/i), {
      target: { value: 'What is accounting?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows AI response when question is submitted successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'This is a lesson-scoped response.' }),
    });
    render(<LessonChatbot lessonId="lesson_01_01" phaseNumber={1} />);
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    fireEvent.change(screen.getByPlaceholderText(/ask a question about this lesson/i), {
      target: { value: 'What is accounting?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => {
      expect(screen.getByText('This is a lesson-scoped response.')).toBeInTheDocument();
    });
  });

  it('resets the chat interface after response is shown', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'This is a lesson-scoped response.' }),
    });
    render(<LessonChatbot lessonId="lesson_01_01" phaseNumber={1} />);
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    fireEvent.change(screen.getByPlaceholderText(/ask a question about this lesson/i), {
      target: { value: 'What is accounting?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => {
      expect(screen.getByText('This is a lesson-scoped response.')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /ask another question/i }));
    expect(screen.queryByText('This is a lesson-scoped response.')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ask a question about this lesson/i)).toBeInTheDocument();
  });

  it('dismisses the chat interface when close button is clicked', () => {
    render(<LessonChatbot lessonId="lesson_01_01" phaseNumber={1} />);
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByPlaceholderText(/ask a question about this lesson/i)).not.toBeInTheDocument();
  });

  it('shows error message when API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API error'));
    render(<LessonChatbot lessonId="lesson_01_01" phaseNumber={1} />);
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    fireEvent.change(screen.getByPlaceholderText(/ask a question about this lesson/i), {
      target: { value: 'What is accounting?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});
