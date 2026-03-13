import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

const mockUseAuth = vi.fn();
const mockCompletePhaseRequest = vi.fn();

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/lib/phase-completion/client', () => ({
  completePhaseRequest: mockCompletePhaseRequest,
}));

const { usePhaseCompletion } = await import('../../hooks/usePhaseCompletion');

const baseOptions = {
  lessonId: 'lesson-id-1',
  phaseNumber: 2,
  phaseType: 'read' as const,
};

describe('usePhaseCompletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockUseAuth.mockReturnValue({
      user: { id: 'profile-1' },
    });
    mockCompletePhaseRequest.mockResolvedValue({
      success: true,
      nextPhaseUnlocked: true,
    });

    vi.spyOn(crypto, 'randomUUID').mockReturnValue('uuid-1');
    window.history.pushState({}, '', '/student/lesson/unit-1-lesson-1');
  });

  it('completes phase through Convex mutation and calls onSuccess', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => usePhaseCompletion({ ...baseOptions, onSuccess }));

    await act(async () => {
      await result.current.completePhase();
    });

    expect(mockCompletePhaseRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: 'lesson-id-1',
        phaseNumber: 2,
        idempotencyKey: 'uuid-1',
      }),
    );
    expect(onSuccess).toHaveBeenCalledWith({
      success: true,
      nextPhaseUnlocked: true,
    });
    expect(result.current.error).toBeNull();
  });

  it('returns auth error when user is missing', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const onError = vi.fn();
    const { result } = renderHook(() => usePhaseCompletion({ ...baseOptions, onError }));

    await act(async () => {
      await result.current.completePhase();
    });

    expect(mockCompletePhaseRequest).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
    });
    expect(result.current.error?.message).toContain('User not authenticated');
    expect(onError).toHaveBeenCalled();
  });

  it('retries with lesson slug when mutation reports lesson not found', async () => {
    mockCompletePhaseRequest
      .mockRejectedValueOnce(new Error('Lesson not found'))
      .mockResolvedValueOnce({ success: true, nextPhaseUnlocked: false });

    const { result } = renderHook(() => usePhaseCompletion(baseOptions));
    await act(async () => {
      await result.current.completePhase();
    });

    expect(mockCompletePhaseRequest).toHaveBeenCalledTimes(2);
    expect(mockCompletePhaseRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        lessonId: 'unit-1-lesson-1',
      }),
    );
  });

  it('queues failed completions for retry', async () => {
    mockCompletePhaseRequest.mockRejectedValueOnce(new Error('network down'));
    const { result } = renderHook(() => usePhaseCompletion(baseOptions));

    await act(async () => {
      await result.current.completePhase();
    });

    const queue = JSON.parse(localStorage.getItem('completion-queue') ?? '[]');
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      userId: 'profile-1',
      lessonId: 'lesson-id-1',
      phaseNumber: 2,
      idempotencyKey: 'uuid-1',
      retryCount: 0,
    });
  });

  it('processes queued completions on mount for current user', async () => {
    localStorage.setItem('completion-queue-user', 'profile-1');
    localStorage.setItem(
      'completion-queue',
      JSON.stringify([
        {
          userId: 'profile-1',
          lessonId: 'lesson-id-1',
          phaseNumber: 2,
          timeSpent: 10,
          idempotencyKey: 'queued-1',
          completedAt: new Date().toISOString(),
          retryCount: 0,
        },
      ]),
    );

    renderHook(() => usePhaseCompletion(baseOptions));

    await waitFor(() => {
      expect(mockCompletePhaseRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          idempotencyKey: 'queued-1',
        }),
      );
    });

    await waitFor(() => {
      const queue = JSON.parse(localStorage.getItem('completion-queue') ?? '[]');
      expect(queue).toHaveLength(0);
    });
  });

  it('increments retryCount when queued completion replay fails', async () => {
    mockCompletePhaseRequest.mockRejectedValue(new Error('still offline'));
    localStorage.setItem('completion-queue-user', 'profile-1');
    localStorage.setItem(
      'completion-queue',
      JSON.stringify([
        {
          userId: 'profile-1',
          lessonId: 'lesson-id-1',
          phaseNumber: 2,
          timeSpent: 10,
          idempotencyKey: 'queued-1',
          completedAt: new Date().toISOString(),
          retryCount: 0,
        },
      ]),
    );

    renderHook(() => usePhaseCompletion(baseOptions));

    await waitFor(() => {
      const queue = JSON.parse(localStorage.getItem('completion-queue') ?? '[]');
      expect(queue[0].retryCount).toBe(1);
    });
  });

  it('clears queue when stored queue user differs from active user', async () => {
    localStorage.setItem('completion-queue-user', 'old-user');
    localStorage.setItem(
      'completion-queue',
      JSON.stringify([
        {
          userId: 'old-user',
          lessonId: 'lesson-id-old',
          phaseNumber: 1,
          timeSpent: 1,
          idempotencyKey: 'old-1',
          completedAt: new Date().toISOString(),
          retryCount: 0,
        },
      ]),
    );

    renderHook(() => usePhaseCompletion(baseOptions));

    await waitFor(() => {
      expect(localStorage.getItem('completion-queue')).toBeNull();
    });
    expect(localStorage.getItem('completion-queue-user')).toBe('profile-1');
  });

  it('does not emit React act warnings during the completion flow', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => usePhaseCompletion(baseOptions));

    await act(async () => {
      await result.current.completePhase();
    });

    const actWarnings = consoleErrorSpy.mock.calls
      .flatMap((call) => call.map((value) => String(value)))
      .filter((message) => message.includes('not wrapped in act'));

    expect(actWarnings).toHaveLength(0);
  });
});
