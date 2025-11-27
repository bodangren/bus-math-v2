'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Queued completion payload stored in localStorage
 */
interface QueuedCompletion {
  lessonId: string;
  phaseNumber: number;
  timeSpent: number;
  idempotencyKey: string;
  completedAt: string;
  retryCount: number;
}

/**
 * API request payload for phase completion
 */
interface CompletePhasePayload {
  lessonId: string;
  phaseNumber: number;
  timeSpent: number;
  idempotencyKey: string;
  completedAt: string;
}

/**
 * API response from /api/phases/complete
 */
interface CompletePhaseResponse {
  success: boolean;
  nextPhaseUnlocked: boolean;
  message?: string;
  error?: string;
}

/**
 * Hook options
 */
interface UsePhaseCompletionOptions {
  lessonId: string;
  phaseNumber: number;
  phaseType: 'read' | 'do';
  onSuccess?: (response: CompletePhaseResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook return value
 */
interface UsePhaseCompletionResult {
  completePhase: () => Promise<void>;
  isCompleting: boolean;
  error: Error | null;
}

const COMPLETION_QUEUE_KEY = 'completion-queue';
const MAX_RETRY_COUNT = 3;

/**
 * Generate a unique idempotency key (UUID v4)
 */
function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Get the completion queue from localStorage
 */
function getCompletionQueue(): QueuedCompletion[] {
  try {
    const stored = localStorage.getItem(COMPLETION_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to read completion queue:', error);
    return [];
  }
}

/**
 * Save the completion queue to localStorage
 */
function saveCompletionQueue(queue: QueuedCompletion[]): void {
  try {
    localStorage.setItem(COMPLETION_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save completion queue:', error);
  }
}

/**
 * Add a completion to the queue
 */
function enqueueCompletion(completion: QueuedCompletion): void {
  const queue = getCompletionQueue();
  queue.push(completion);
  saveCompletionQueue(queue);
}

/**
 * Remove a completion from the queue by idempotency key
 */
function dequeueCompletion(idempotencyKey: string): void {
  const queue = getCompletionQueue();
  const filtered = queue.filter((c) => c.idempotencyKey !== idempotencyKey);
  saveCompletionQueue(filtered);
}

/**
 * Send a phase completion request to the API
 */
async function sendCompletionRequest(payload: CompletePhasePayload): Promise<CompletePhaseResponse> {
  const response = await fetch('/api/phases/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    // Enable keepalive to ensure request completes even if page unloads
    keepalive: true,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Process queued completions (retry failed requests)
 */
async function processQueuedCompletions(): Promise<void> {
  const queue = getCompletionQueue();

  if (queue.length === 0) {
    return;
  }

  console.log(`Processing ${queue.length} queued completion(s)`);

  // Process each queued completion
  for (const completion of queue) {
    // Skip if max retries exceeded
    if (completion.retryCount >= MAX_RETRY_COUNT) {
      console.warn(
        `Max retries exceeded for completion ${completion.idempotencyKey}, removing from queue`
      );
      dequeueCompletion(completion.idempotencyKey);
      continue;
    }

    try {
      await sendCompletionRequest({
        lessonId: completion.lessonId,
        phaseNumber: completion.phaseNumber,
        timeSpent: completion.timeSpent,
        idempotencyKey: completion.idempotencyKey,
        completedAt: completion.completedAt,
      });

      // Success - remove from queue
      console.log(`Successfully processed queued completion ${completion.idempotencyKey}`);
      dequeueCompletion(completion.idempotencyKey);
    } catch (error) {
      console.error(`Failed to process queued completion ${completion.idempotencyKey}:`, error);

      // Increment retry count
      const updatedQueue = getCompletionQueue().map((c) =>
        c.idempotencyKey === completion.idempotencyKey
          ? { ...c, retryCount: c.retryCount + 1 }
          : c
      );
      saveCompletionQueue(updatedQueue);
    }
  }
}

/**
 * Hook for tracking and completing phase progress
 *
 * Features:
 * - Automatic time tracking from mount to completion
 * - Idempotent completion requests
 * - Offline queue with automatic retry
 * - Reliable request delivery via keepalive
 *
 * @example
 * ```tsx
 * const { completePhase, isCompleting } = usePhaseCompletion({
 *   lessonId: '123e4567-e89b-12d3-a456-426614174000',
 *   phaseNumber: 1,
 *   phaseType: 'read',
 *   onSuccess: (response) => {
 *     if (response.nextPhaseUnlocked) {
 *       router.push('/next-phase');
 *     }
 *   },
 * });
 *
 * // Call when user completes the phase
 * await completePhase();
 * ```
 */
export function usePhaseCompletion({
  lessonId,
  phaseNumber,
  phaseType: _phaseType, // eslint-disable-line @typescript-eslint/no-unused-vars
  onSuccess,
  onError,
}: UsePhaseCompletionOptions): UsePhaseCompletionResult {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track start time (persists across rerenders)
  const startTimeRef = useRef<number>(Date.now());

  // Track if we've already generated an idempotency key for this session
  const idempotencyKeyRef = useRef<string | null>(null);

  // Process queued completions on mount
  useEffect(() => {
    processQueuedCompletions().catch((error) => {
      console.error('Failed to process queued completions:', error);
    });
  }, []);

  /**
   * Complete the current phase
   */
  const completePhase = useCallback(async () => {
    if (isCompleting) {
      console.warn('Completion already in progress');
      return;
    }

    setIsCompleting(true);
    setError(null);

    try {
      // Calculate time spent (in seconds)
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Generate or reuse idempotency key
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = generateIdempotencyKey();
      }
      const idempotencyKey = idempotencyKeyRef.current;

      const payload: CompletePhasePayload = {
        lessonId,
        phaseNumber,
        timeSpent,
        idempotencyKey,
        completedAt: new Date().toISOString(),
      };

      try {
        const response = await sendCompletionRequest(payload);

        // Success callback
        if (onSuccess) {
          onSuccess(response);
        }
      } catch (requestError) {
        // Request failed - queue for retry
        console.error('Failed to complete phase, queueing for retry:', requestError);

        const queuedCompletion: QueuedCompletion = {
          lessonId,
          phaseNumber,
          timeSpent,
          idempotencyKey,
          completedAt: payload.completedAt,
          retryCount: 0,
        };

        enqueueCompletion(queuedCompletion);

        // Re-throw error to trigger error callback
        throw requestError;
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to complete phase');
      setError(errorObj);

      if (onError) {
        onError(errorObj);
      }
    } finally {
      setIsCompleting(false);
    }
  }, [lessonId, phaseNumber, onSuccess, onError, isCompleting]);

  return {
    completePhase,
    isCompleting,
    error,
  };
}
