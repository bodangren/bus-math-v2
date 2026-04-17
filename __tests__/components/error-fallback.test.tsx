import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorFallback } from '@/components/error-fallback';

describe('ErrorFallback', () => {
  it('renders default title and description', () => {
    render(<ErrorFallback />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('An unexpected error occurred. Please try again or refresh the page.'),
    ).toBeInTheDocument();
  });

  it('renders custom title and description', () => {
    render(
      <ErrorFallback title="Custom title" description="Custom description" />,
    );

    expect(screen.getByText('Custom title')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
  });

  it('shows try again button when reset is provided', () => {
    const reset = vi.fn();
    render(<ErrorFallback reset={reset} />);

    const button = screen.getByTestId('error-reset-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Try again');
  });

  it('calls reset when try again button is clicked', () => {
    const reset = vi.fn();
    render(<ErrorFallback reset={reset} />);

    fireEvent.click(screen.getByTestId('error-reset-button'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('shows refresh button when no reset and showRefreshFallback is true', () => {
    render(<ErrorFallback showRefreshFallback={true} />);

    expect(screen.getByTestId('error-refresh-button')).toBeInTheDocument();
    expect(screen.queryByTestId('error-reset-button')).not.toBeInTheDocument();
  });

  it('hides refresh button when showRefreshFallback is false and no reset', () => {
    const { container } = render(<ErrorFallback showRefreshFallback={false} />);

    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const error = new Error('Test error message');
    render(<ErrorFallback error={error} />);

    expect(screen.getByText('Error details')).toBeInTheDocument();
    expect(screen.getByText(/Test error message/)).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it('hides error details in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const error = new Error('Test error message');
    render(<ErrorFallback error={error} />);

    expect(screen.queryByText('Error details')).not.toBeInTheDocument();
    expect(screen.queryByText(/Test error message/)).not.toBeInTheDocument();

    vi.unstubAllEnvs();
  });
});
