import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PhaseCompleteButton } from './PhaseCompleteButton';

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('PhaseCompleteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('optimistically marks the phase as complete and calls the API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        progress: { status: 'completed' },
      }),
    });

    render(<PhaseCompleteButton phaseId="phase-123" />);

    const button = screen.getByRole('button', { name: /mark complete/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent(/completed/i);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/progress/phase',
      expect.objectContaining({
        method: 'POST',
      }),
    );

    const payload = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(payload).toEqual({
      phaseId: 'phase-123',
      status: 'completed',
      completed: true,
    });

    expect(await screen.findByText(/phase completed/i)).toBeInTheDocument();
  });

  it('renders error message and reverts status when API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Server Error',
      json: async () => ({ error: 'Mock failure' }),
    });

    render(<PhaseCompleteButton phaseId="phase-456" />);

    const button = screen.getByRole('button', { name: /mark complete/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent(/mark complete/i);
    });

    const errorCopies = await screen.findAllByText(/mock failure/i);
    expect(errorCopies.length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText(/unable to save progress/i)).toBeInTheDocument();
  });

  it('disables the button when the phase is already completed', () => {
    render(<PhaseCompleteButton phaseId="phase-789" initialStatus="completed" />);

    const button = screen.getByRole('button', { name: /completed/i });
    expect(button).toBeDisabled();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
