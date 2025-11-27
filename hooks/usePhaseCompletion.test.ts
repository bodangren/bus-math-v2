/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { usePhaseCompletion } from './usePhaseCompletion';

// Mock Supabase client
const mockUser = { id: 'test-user-123' };
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mockUser }, error: null })),
    },
  })),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock crypto.randomUUID
const originalCrypto = global.crypto;
vi.stubGlobal('crypto', {
  ...originalCrypto,
  randomUUID: vi.fn(() => 'test-uuid-1234'),
});

// Mock localStorage
const localStorageMock: { [key: string]: string } = {};

global.localStorage = {
  getItem: vi.fn((key: string) => localStorageMock[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock[key];
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageMock).forEach((key) => delete localStorageMock[key]);
  }),
  length: 0,
  key: vi.fn(),
} as any;

describe('usePhaseCompletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(localStorageMock).forEach((key) => delete localStorageMock[key]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockOptions = {
    lessonId: '123e4567-e89b-12d3-a456-426614174000',
    phaseNumber: 1,
    phaseType: 'read' as const,
  };

  describe('completePhase', () => {
    it('sends completion request with correct payload', async () => {
      const mockResponse = {
        success: true,
        nextPhaseUnlocked: true,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => usePhaseCompletion(mockOptions));

      // Wait for authentication to complete and user ID to be set
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      // Small delay to ensure userId state is set
      await new Promise(resolve => setTimeout(resolve, 100));

      await result.current.completePhase();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/phases/complete',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            keepalive: true,
            body: expect.stringContaining('"lessonId":"123e4567-e89b-12d3-a456-426614174000"'),
          })
        );
      });

      // Verify the payload (completedAt removed - server generates timestamp)
      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toMatchObject({
        lessonId: mockOptions.lessonId,
        phaseNumber: mockOptions.phaseNumber,
        timeSpent: expect.any(Number),
        idempotencyKey: 'test-uuid-1234',
      });

      // Verify completedAt is NOT in payload (server-side timestamp)
      expect(body.completedAt).toBeUndefined();

      expect(result.current.isCompleting).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('calls onSuccess callback when request succeeds', async () => {
      const mockResponse = {
        success: true,
        nextPhaseUnlocked: true,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        usePhaseCompletion({ ...mockOptions, onSuccess })
      );

      // Wait for authentication to complete and user ID to be set
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      // Small delay to ensure userId state is set
      await new Promise(resolve => setTimeout(resolve, 100));

      await result.current.completePhase();

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      });
    });

    it('queues completion when request fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePhaseCompletion(mockOptions));

      // Wait for authentication to complete and user ID to be set
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      // Small delay to ensure userId state is set
      await new Promise(resolve => setTimeout(resolve, 100));

      await result.current.completePhase();

      await waitFor(() => {
        expect(global.localStorage.setItem).toHaveBeenCalledWith(
          'completion-queue',
          expect.stringContaining(mockOptions.lessonId)
        );
      });

      // Verify queue contains the failed completion
      const queue = JSON.parse(localStorageMock['completion-queue']);
      expect(queue).toHaveLength(1);
      expect(queue[0]).toMatchObject({
        lessonId: mockOptions.lessonId,
        phaseNumber: mockOptions.phaseNumber,
        timeSpent: expect.any(Number),
        idempotencyKey: 'test-uuid-1234',
        retryCount: 0,
      });
    });

    it('calls onError callback when request fails', async () => {
      const error = new Error('Network error');
      (global.fetch as any).mockRejectedValueOnce(error);

      const onError = vi.fn();
      const { result } = renderHook(() =>
        usePhaseCompletion({ ...mockOptions, onError })
      );

      // Wait for authentication to complete and user ID to be set
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      // Small delay to ensure userId state is set
      await new Promise(resolve => setTimeout(resolve, 100));

      await result.current.completePhase();

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });

    it('sets isCompleting flag during request', async () => {
      let resolvePromise: any;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as any).mockReturnValue(fetchPromise);

      const { result } = renderHook(() => usePhaseCompletion(mockOptions));

      // Wait for authentication to complete and user ID to be set
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      // Small delay to ensure userId state is set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Start completion
      const completePromise = result.current.completePhase();

      // Check that isCompleting is true
      await waitFor(() => {
        expect(result.current.isCompleting).toBe(true);
      });

      // Resolve the fetch
      resolvePromise({
        ok: true,
        json: async () => ({ success: true, nextPhaseUnlocked: false }),
      });

      await completePromise;

      // Check that isCompleting is false after completion
      await waitFor(() => {
        expect(result.current.isCompleting).toBe(false);
      });
    });

    it('calculates time spent correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, nextPhaseUnlocked: false }),
      });

      const { result } = renderHook(() => usePhaseCompletion(mockOptions));

      // Wait for authentication to complete and user ID to be set
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      // Small delay to ensure userId state is set
      await new Promise(resolve => setTimeout(resolve, 100));

      await result.current.completePhase();

      await waitFor(() => {
        const callArgs = (global.fetch as any).mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.timeSpent).toBeGreaterThanOrEqual(0);
      });
    });

    it('uses keepalive flag for reliability', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, nextPhaseUnlocked: false }),
      });

      const { result } = renderHook(() => usePhaseCompletion(mockOptions));

      // Wait for authentication to complete and user ID to be set
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      // Small delay to ensure userId state is set
      await new Promise(resolve => setTimeout(resolve, 100));

      await result.current.completePhase();

      await waitFor(() => {
        const callArgs = (global.fetch as any).mock.calls[0];
        expect(callArgs[1].keepalive).toBe(true);
      });
    });
  });

  describe('offline queue processing', () => {
    it('processes queued completions on mount', async () => {
      // Pre-populate queue with a completion (includes userId)
      const queuedCompletion = {
        userId: mockUser.id,
        lessonId: mockOptions.lessonId,
        phaseNumber: mockOptions.phaseNumber,
        timeSpent: 100,
        idempotencyKey: 'queued-uuid',
        completedAt: new Date().toISOString(),
        retryCount: 0,
      };

      localStorageMock['completion-queue'] = JSON.stringify([queuedCompletion]);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, nextPhaseUnlocked: false }),
      });

      renderHook(() => usePhaseCompletion(mockOptions));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/phases/complete',
          expect.objectContaining({
            body: expect.stringContaining('queued-uuid'),
          })
        );
      });

      // Queue should be cleared after successful processing
      await waitFor(() => {
        const queue = localStorageMock['completion-queue']
          ? JSON.parse(localStorageMock['completion-queue'])
          : [];
        expect(queue).toHaveLength(0);
      });
    });

    it('increments retry count when queued completion fails', async () => {
      const queuedCompletion = {
        userId: mockUser.id,
        lessonId: mockOptions.lessonId,
        phaseNumber: mockOptions.phaseNumber,
        timeSpent: 100,
        idempotencyKey: 'queued-uuid',
        completedAt: new Date().toISOString(),
        retryCount: 0,
      };

      localStorageMock['completion-queue'] = JSON.stringify([queuedCompletion]);

      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      renderHook(() => usePhaseCompletion(mockOptions));

      await waitFor(() => {
        const queue = JSON.parse(localStorageMock['completion-queue']);
        expect(queue[0].retryCount).toBe(1);
      });
    });

    it('removes completion from queue after max retries', async () => {
      const queuedCompletion = {
        userId: mockUser.id,
        lessonId: mockOptions.lessonId,
        phaseNumber: mockOptions.phaseNumber,
        timeSpent: 100,
        idempotencyKey: 'queued-uuid',
        completedAt: new Date().toISOString(),
        retryCount: 3, // Max retries
      };

      localStorageMock['completion-queue'] = JSON.stringify([queuedCompletion]);

      renderHook(() => usePhaseCompletion(mockOptions));

      await waitFor(() => {
        const queue = localStorageMock['completion-queue']
          ? JSON.parse(localStorageMock['completion-queue'])
          : [];
        expect(queue).toHaveLength(0);
      });

      // Should not make API call for max-retry completions
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('clears queue when legacy items without userId are detected', async () => {
      // Pre-populate queue with legacy completion (no userId)
      const legacyCompletion = {
        lessonId: mockOptions.lessonId,
        phaseNumber: mockOptions.phaseNumber,
        timeSpent: 100,
        idempotencyKey: 'legacy-uuid',
        completedAt: new Date().toISOString(),
        retryCount: 0,
        // No userId field (legacy format)
      };

      localStorageMock['completion-queue'] = JSON.stringify([legacyCompletion]);

      renderHook(() => usePhaseCompletion(mockOptions));

      await waitFor(() => {
        // Queue should be cleared
        const queue = localStorageMock['completion-queue']
          ? JSON.parse(localStorageMock['completion-queue'])
          : [];
        expect(queue).toHaveLength(0);
      });

      // Should not make API call for legacy items
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('idempotency', () => {
    it('reuses the same idempotency key for multiple calls in same session', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, nextPhaseUnlocked: false }),
      });

      const { result } = renderHook(() => usePhaseCompletion(mockOptions));

      // Wait for authentication to complete and user ID to be set
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      // Small delay to ensure userId state is set
      await new Promise(resolve => setTimeout(resolve, 100));

      await result.current.completePhase();
      await result.current.completePhase();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);

        const call1 = JSON.parse((global.fetch as any).mock.calls[0][1].body);
        const call2 = JSON.parse((global.fetch as any).mock.calls[1][1].body);

        expect(call1.idempotencyKey).toBe(call2.idempotencyKey);
      });
    });
  });

  describe('error handling', () => {
    it('handles non-ok HTTP responses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Forbidden' }),
      });

      const onError = vi.fn();
      const { result } = renderHook(() =>
        usePhaseCompletion({ ...mockOptions, onError })
      );

      // Wait for authentication to complete and user ID to be set
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      // Small delay to ensure userId state is set
      await new Promise(resolve => setTimeout(resolve, 100));

      await result.current.completePhase();

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(result.current.error?.message).toContain('Forbidden');
      });
    });

    it('handles JSON parse errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const onError = vi.fn();
      const { result } = renderHook(() =>
        usePhaseCompletion({ ...mockOptions, onError })
      );

      // Wait for authentication to complete and user ID to be set
      await waitFor(
        () => {
          expect(result.current.error).toBeNull();
        },
        { timeout: 2000 }
      );

      // Small delay to ensure userId state is set
      await new Promise(resolve => setTimeout(resolve, 100));

      await result.current.completePhase();

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });
});
