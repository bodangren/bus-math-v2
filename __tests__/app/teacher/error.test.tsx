import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TeacherError from '../../../app/teacher/error';

describe('TeacherError', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  it('renders error fallback with reset button', () => {
    const reset = vi.fn();
    const error = new Error('Teacher route failed');

    render(<TeacherError error={error} reset={reset} />);

    expect(screen.getByText('Unable to load page')).toBeInTheDocument();
    expect(screen.getByText('We ran into a problem loading this page. Please try again.')).toBeInTheDocument();
    expect(screen.getByTestId('error-reset-button')).toBeInTheDocument();
  });

  it('calls reset when try again button is clicked', () => {
    const reset = vi.fn();
    const error = new Error('Teacher route failed');

    render(<TeacherError error={error} reset={reset} />);

    fireEvent.click(screen.getByTestId('error-reset-button'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('logs error to console', () => {
    consoleErrorSpy.mockClear();
    const error = new Error('Teacher route failed');

    render(<TeacherError error={error} reset={vi.fn()} />);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Teacher route error:', error);
  });
});