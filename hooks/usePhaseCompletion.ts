'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Queued completion payload stored in localStorage
 */
interface QueuedCompletion {
  userId: string; // Bind queue item to user
  lessonId: string;
  phaseNumber: number;
  timeSpent: number;
  idempotencyKey: string;
  completedAt: string;
  retryCount: number;
}

/**
 * API request payload for phase completion
 * Note: completedAt removed - server uses its own timestamp
 */
interface CompletePhasePayload {
  lessonId: string;
  phaseNumber: number;
  timeSpent: number;
  idempotencyKey: string;
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
const CURRENT_USER_KEY = 'completion-queue-user';
const MAX_RETRY_COUNT = 3;

/**
 * Generate a unique idempotency key (UUID v4)
 */
function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Get the current user ID from localStorage
 */
function getCurrentUserId(): string | null {
  try {
    return localStorage.getItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Failed to read current user ID:', error);
    return null;
  }
}

/**
 * Set the current user ID in localStorage
 */
function setCurrentUserId(userId: string): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } catch (error) {
    console.error('Failed to save current user ID:', error);
  }
}

/**
 * Clear the completion queue (used when user changes)
 */
function clearCompletionQueue(): void {
  try {
    localStorage.removeItem(COMPLETION_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear completion queue:', error);
  }
}

/**
 * Get the completion queue from localStorage
 * Filters to only return items for the current user
 * Migrates legacy items without userId by clearing them
 */
function getCompletionQueue(userId?: string): QueuedCompletion[] {
  try {
    const stored = localStorage.getItem(COMPLETION_QUEUE_KEY);
    const allQueue: QueuedCompletion[] = stored ? JSON.parse(stored) : [];

    // Detect legacy items without userId and clear the entire queue
    // This is safer than trying to migrate them since we can't determine ownership
    const hasLegacyItems = allQueue.some(item => !item.userId);
    if (hasLegacyItems) {
      console.warn(
        'Detected legacy completion queue items without userId. Clearing queue for safety.'
      );
      clearCompletionQueue();
      return [];
    }

    // If userId provided, filter to only that user's items
    if (userId) {
      return allQueue.filter(item => item.userId === userId);
    }

    return allQueue;
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
 * Determine if an error is transient (should be retried)
 */
function isTransientError(error: unknown, status?: number): boolean {
  // Network errors (no status) should be retried
  if (!status) {
    return true;
  }

  // 5xx errors are transient (server errors)
  if (status >= 500 && status < 600) {
    return true;
  }

  // 408 Request Timeout is transient
  if (status === 408) {
    return true;
  }

  // 429 Too Many Requests is transient
  if (status === 429) {
    return true;
  }

  // All 4xx errors except the above are permanent (validation, auth, conflict, etc.)
  // These include: 400, 401, 403, 404, 409, 422, etc.
  return false;
}

/**
 * Send a phase completion request to the API
 * Throws an error with status code for proper error handling
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
    const error = new Error(errorData.error || `HTTP error! status: ${response.status}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Process queued completions (retry failed requests)
 * Only processes items for the current user
 */
async function processQueuedCompletions(userId: string): Promise<void> {
  const queue = getCompletionQueue(userId);

  if (queue.length === 0) {
    return;
  }

  console.log(`Processing ${queue.length} queued completion(s) for user ${userId}`);

  // Process each queued completion
  for (const completion of queue) {
    // Double-check user ID matches (defense in depth)
    if (completion.userId !== userId) {
      console.warn(
        `Skipping completion ${completion.idempotencyKey} - user mismatch (expected ${userId}, got ${completion.userId})`
      );
      dequeueCompletion(completion.idempotencyKey);
      continue;
    }

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
      });

      // Success - remove from queue
      console.log(`Successfully processed queued completion ${completion.idempotencyKey}`);
      dequeueCompletion(completion.idempotencyKey);
    } catch (error) {
      const errorWithStatus = error as Error & { status?: number };
      console.error(`Failed to process queued completion ${completion.idempotencyKey}:`, error);

      // Only retry transient errors
      if (isTransientError(error, errorWithStatus.status)) {
        console.log(`Error is transient, incrementing retry count`);
        // Increment retry count
        const updatedQueue = getCompletionQueue().map((c) =>
          c.idempotencyKey === completion.idempotencyKey
            ? { ...c, retryCount: c.retryCount + 1 }
            : c
        );
        saveCompletionQueue(updatedQueue);
      } else {
        // Permanent error (4xx) - remove from queue and log
        console.error(
          `Error is permanent (status ${errorWithStatus.status}), removing from queue`
        );
        dequeueCompletion(completion.idempotencyKey);
      }
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
  const [userId, setUserId] = useState<string | null>(null);

  // Track start time (persists across rerenders)
  const startTimeRef = useRef<number>(Date.now());

  // Track if we've already generated an idempotency key for this session
  const idempotencyKeyRef = useRef<string | null>(null);

  // Initialize user ID and manage queue on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.warn('No authenticated user found');
          return;
        }

        const currentUserId = user.id;
        setUserId(currentUserId);

        // Check if user changed since last session
        const lastUserId = getCurrentUserId();
        if (lastUserId && lastUserId !== currentUserId) {
          console.log(`User changed from ${lastUserId} to ${currentUserId}, clearing queue`);
          clearCompletionQueue();
        }

        // Update stored user ID
        setCurrentUserId(currentUserId);

        // Process queued completions for this user
        await processQueuedCompletions(currentUserId);
      } catch (err) {
        console.error('Failed to initialize user:', err);
      }
    };

    initializeUser();
  }, []);

  /**
   * Complete the current phase
   */
  const completePhase = useCallback(async () => {
    if (isCompleting) {
      console.warn('Completion already in progress');
      return;
    }

    if (!userId) {
      const errorObj = new Error('User not authenticated');
      setError(errorObj);
      if (onError) {
        onError(errorObj);
      }
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
      };

      try {
        const response = await sendCompletionRequest(payload);

        // Success - clear the in-memory idempotency key so next completion gets new key
        idempotencyKeyRef.current = null;

        // Success callback
        if (onSuccess) {
          onSuccess(response);
        }
      } catch (requestError) {
        const errorWithStatus = requestError as Error & { status?: number };
        console.error('Failed to complete phase:', requestError);

        // Only queue transient errors for retry
        if (isTransientError(requestError, errorWithStatus.status)) {
          console.log('Error is transient, queueing for retry');

          const queuedCompletion: QueuedCompletion = {
            userId,
            lessonId,
            phaseNumber,
            timeSpent,
            idempotencyKey,
            completedAt: new Date().toISOString(),
            retryCount: 0,
          };

          enqueueCompletion(queuedCompletion);
        } else {
          // Permanent error - clear idempotency key and surface error
          console.error(`Error is permanent (status ${errorWithStatus.status}), not queueing`);
          idempotencyKeyRef.current = null;
        }

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
  }, [lessonId, phaseNumber, userId, onSuccess, onError, isCompleting]);

  return {
    completePhase,
    isCompleting,
    error,
  };
}
