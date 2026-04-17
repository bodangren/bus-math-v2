import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LessonError from '@/app/student/lesson/error';

describe('LessonError', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  it('renders error fallback with reset button', () => {
    const reset = vi.fn();
    const error = new Error('Lesson route failed');

    render(<LessonError error={error} reset={reset} />);

    expect(screen.getByText('Unable to load lesson')).toBeInTheDocument();
    expect(screen.getByText('We ran into a problem loading this lesson. Please try again.')).toBeInTheDocument();
    expect(screen.getByTestId('error-reset-button')).toBeInTheDocument();
  });

  it('calls reset when try again button is clicked', () => {
    const reset = vi.fn();
    const error = new Error('Lesson route failed');

    render(<LessonError error={error} reset={reset} />);

    fireEvent.click(screen.getByTestId('error-reset-button'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('shows back-to-dashboard link', () => {
    const error = new Error('Lesson route failed');

    render(<LessonError error={error} reset={vi.fn()} />);

    const link = screen.getByTestId('back-to-dashboard-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/student/dashboard');
  });

  it('logs error to console', () => {
    consoleErrorSpy.mockClear();
    const error = new Error('Lesson route failed');

    render(<LessonError error={error} reset={vi.fn()} />);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Lesson route error:', error);
  });
});
