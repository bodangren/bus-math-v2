import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PhaseCompleteButton } from './PhaseCompleteButton';
import { usePhaseCompletion } from '@/hooks/usePhaseCompletion';

vi.mock('@/hooks/usePhaseCompletion', () => ({
  usePhaseCompletion: vi.fn(),
}));

describe('PhaseCompleteButton', () => {
  const mockCompletePhase = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePhaseCompletion).mockImplementation((options) => ({
      completePhase: async () => {
        await mockCompletePhase();
        options.onSuccess?.({
          success: true,
          nextPhaseUnlocked: true,
        });
      },
      isCompleting: false,
      error: null,
    }));
  });

  it('optimistically marks the phase as complete and calls completion hook', async () => {
    render(
      <PhaseCompleteButton
        lessonId="123e4567-e89b-12d3-a456-426614174000"
        phaseNumber={2}
      />,
    );

    const button = screen.getByRole('button', { name: /mark complete/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent(/completed/i);
    });

    expect(usePhaseCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: '123e4567-e89b-12d3-a456-426614174000',
        phaseNumber: 2,
        phaseType: 'read',
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
    expect(mockCompletePhase).toHaveBeenCalledTimes(1);

    expect(await screen.findByText(/phase completed/i)).toBeInTheDocument();
  });

  it('renders error message and reverts status when completion fails', async () => {
    vi.mocked(usePhaseCompletion).mockImplementation((options) => ({
      completePhase: async () => {
        options.onError?.(new Error('Mock failure'));
      },
      isCompleting: false,
      error: null,
    }));

    render(
      <PhaseCompleteButton
        lessonId="123e4567-e89b-12d3-a456-426614174000"
        phaseNumber={3}
      />,
    );

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
    render(
      <PhaseCompleteButton
        lessonId="123e4567-e89b-12d3-a456-426614174000"
        phaseNumber={4}
        initialStatus="completed"
      />,
    );

    const button = screen.getByRole('button', { name: /completed/i });
    expect(button).toBeDisabled();
    expect(mockCompletePhase).not.toHaveBeenCalled();
  });
});
