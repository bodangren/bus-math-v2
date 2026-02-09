'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  completePhaseRequest,
  PhaseCompletionError,
} from '@/lib/phase-completion/client';
import type { CompletePhaseRequest, CompletePhaseResponse } from '@/types/api';

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

function getLessonSlugFromPathname(): string | null {
  if (typeof window === 'undefined') return null;

  const match = window.location.pathname.match(/^\/student\/lesson\/([^/]+)\/?$/);
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function isLessonNotFoundError(error: unknown): error is PhaseCompletionError {
  return (
    error instanceof PhaseCompletionError &&
    error.status === 404 &&
    /lesson not found/i.test(error.message)
  );
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
      await completePhaseRequest({
        lessonId: completion.lessonId,
        phaseNumber: completion.phaseNumber,
        timeSpent: completion.timeSpent,
        idempotencyKey: completion.idempotencyKey,
      });

      // Success - remove from queue
      console.log(`Successfully processed queued completion ${completion.idempotencyKey}`);
      dequeueCompletion(completion.idempotencyKey);
    } catch (error) {
      const isStaleLessonQueueEntry =
        error instanceof PhaseCompletionError &&
        error.status === 404 &&
        /lesson not found/i.test(error.message);

      if (isStaleLessonQueueEntry) {
        console.warn(
          `Dropping stale queued completion ${completion.idempotencyKey}: lesson no longer available`
        );
        dequeueCompletion(completion.idempotencyKey);
        continue;
      }

      console.error(`Failed to process queued completion ${completion.idempotencyKey}:`, error);

      // Only retry transient errors
      if (
        (error instanceof PhaseCompletionError && error.transient) ||
        !(error instanceof PhaseCompletionError)
      ) {
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
        const status = error instanceof PhaseCompletionError ? error.status : 'unknown';
        console.error(
          `Error is permanent (status ${status}), removing from queue`
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

      const payload: CompletePhaseRequest = {
        lessonId,
        phaseNumber,
        timeSpent,
        idempotencyKey,
      };

      try {
        let effectivePayload = payload;
        let response: CompletePhaseResponse;

        try {
          response = await completePhaseRequest(effectivePayload);
        } catch (requestError) {
          if (isLessonNotFoundError(requestError)) {
            const lessonSlug = getLessonSlugFromPathname();
            if (lessonSlug && lessonSlug !== effectivePayload.lessonId) {
              effectivePayload = {
                ...effectivePayload,
                lessonId: lessonSlug,
              };
              response = await completePhaseRequest(effectivePayload);
            } else {
              throw requestError;
            }
          } else {
            throw requestError;
          }
        }

        // Success - clear the in-memory idempotency key so next completion gets new key
        idempotencyKeyRef.current = null;

        // Success callback
        if (onSuccess) {
          onSuccess(response);
        }
      } catch (requestError) {
        console.error('Failed to complete phase:', requestError);

        const fallbackLessonSlug = getLessonSlugFromPathname();
        const queuedLessonId =
          isLessonNotFoundError(requestError) && fallbackLessonSlug
            ? fallbackLessonSlug
            : lessonId;

        // Only queue transient errors for retry
        if (
          (requestError instanceof PhaseCompletionError && requestError.transient) ||
          !(requestError instanceof PhaseCompletionError)
        ) {
          console.log('Error is transient, queueing for retry');

          const queuedCompletion: QueuedCompletion = {
            userId,
            lessonId: queuedLessonId,
            phaseNumber,
            timeSpent,
            idempotencyKey,
            completedAt: new Date().toISOString(),
            retryCount: 0,
          };

          enqueueCompletion(queuedCompletion);
        } else {
          // Permanent error - clear idempotency key and surface error
          console.error(
            `Error is permanent (status ${
              requestError instanceof PhaseCompletionError ? requestError.status : 'unknown'
            }), not queueing`
          );
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
