'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { CompletePhaseResponse } from '@/types/api';
import { completePhaseRequest } from '@/lib/phase-completion/client';

interface QueuedCompletion {
  userId: string;
  lessonId: string;
  phaseNumber: number;
  timeSpent: number;
  idempotencyKey: string;
  completedAt: string;
  retryCount: number;
}

interface UsePhaseCompletionOptions {
  lessonId: string;
  phaseNumber: number;
  phaseType: 'read' | 'do';
  onSuccess?: (response: CompletePhaseResponse) => void;
  onError?: (error: Error) => void;
  linkedStandardId?: string;
}

interface UsePhaseCompletionResult {
  completePhase: () => Promise<void>;
  isCompleting: boolean;
  error: Error | null;
}

const COMPLETION_QUEUE_KEY = 'completion-queue';
const CURRENT_USER_KEY = 'completion-queue-user';
const MAX_RETRY_COUNT = 3;

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

function getCurrentUserId(): string | null {
  try {
    return localStorage.getItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Failed to read current user ID:', error);
    return null;
  }
}

function setCurrentUserId(userId: string): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } catch (error) {
    console.error('Failed to save current user ID:', error);
  }
}

function clearCompletionQueue(): void {
  try {
    localStorage.removeItem(COMPLETION_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear completion queue:', error);
  }
}

function getCompletionQueue(userId?: string): QueuedCompletion[] {
  try {
    const stored = localStorage.getItem(COMPLETION_QUEUE_KEY);
    const allQueue: QueuedCompletion[] = stored ? JSON.parse(stored) : [];

    const hasLegacyItems = allQueue.some(item => !item.userId);
    if (hasLegacyItems) {
      console.warn(
        'Detected legacy completion queue items without userId. Clearing queue for safety.'
      );
      clearCompletionQueue();
      return [];
    }

    if (userId) {
      return allQueue.filter(item => item.userId === userId);
    }

    return allQueue;
  } catch (error) {
    console.error('Failed to read completion queue:', error);
    return [];
  }
}

function saveCompletionQueue(queue: QueuedCompletion[]): void {
  try {
    localStorage.setItem(COMPLETION_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save completion queue:', error);
  }
}

function enqueueCompletion(completion: QueuedCompletion): void {
  const queue = getCompletionQueue();
  queue.push(completion);
  saveCompletionQueue(queue);
}

function dequeueCompletion(idempotencyKey: string): void {
  const queue = getCompletionQueue();
  const filtered = queue.filter((c) => c.idempotencyKey !== idempotencyKey);
  saveCompletionQueue(filtered);
}

export function usePhaseCompletion({
  lessonId,
  phaseNumber,
  phaseType: _phaseType, // eslint-disable-line @typescript-eslint/no-unused-vars
  onSuccess,
  onError,
  linkedStandardId,
}: UsePhaseCompletionOptions): UsePhaseCompletionResult {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const startTimeRef = useRef<number>(Date.now());
  const idempotencyKeyRef = useRef<string | null>(null);
  const processedQueueRef = useRef(false);

  useEffect(() => {
    if (!userId || processedQueueRef.current) return;

    const processQueuedCompletions = async () => {
      processedQueueRef.current = true;
      
      const lastUserId = getCurrentUserId();
      if (lastUserId && lastUserId !== userId) {
        console.log(`User changed from ${lastUserId} to ${userId}, clearing queue`);
        clearCompletionQueue();
      }

      setCurrentUserId(userId);

      const queue = getCompletionQueue(userId);
      if (queue.length === 0) return;

      console.log(`Processing ${queue.length} queued completion(s) for user ${userId}`);

      for (const completion of queue) {
        if (completion.userId !== userId) {
          dequeueCompletion(completion.idempotencyKey);
          continue;
        }

        if (completion.retryCount >= MAX_RETRY_COUNT) {
          console.warn(`Max retries exceeded for completion ${completion.idempotencyKey}`);
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
          
          console.log(`Successfully processed queued completion ${completion.idempotencyKey}`);
          dequeueCompletion(completion.idempotencyKey);
        } catch (err) {
          console.error(`Failed to process queued completion ${completion.idempotencyKey}:`, err);
          
          const updatedQueue = getCompletionQueue().map((c) =>
            c.idempotencyKey === completion.idempotencyKey
              ? { ...c, retryCount: c.retryCount + 1 }
              : c
          );
          saveCompletionQueue(updatedQueue);
        }
      }
    };

    processQueuedCompletions();
  }, [userId]);

  const completePhase = useCallback(async () => {
    if (isCompleting) {
      console.warn('Completion already in progress');
      return;
    }

    if (!userId) {
      const errorObj = new Error('User not authenticated');
      setError(errorObj);
      onError?.(errorObj);
      return;
    }

    setIsCompleting(true);
    setError(null);

    try {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = generateIdempotencyKey();
      }
      const idempotencyKey = idempotencyKeyRef.current;

      let effectiveLessonId = lessonId;

      try {
        const result = await completePhaseRequest({
          lessonId: effectiveLessonId,
          phaseNumber,
          timeSpent,
          idempotencyKey,
          linkedStandardId,
        });

        idempotencyKeyRef.current = null;

        const response: CompletePhaseResponse = {
          success: result.success,
          nextPhaseUnlocked: result.nextPhaseUnlocked ?? true,
        };

        onSuccess?.(response);
      } catch (mutationError: unknown) {
        console.error('Failed to complete phase:', mutationError);

        const errorMessage = mutationError instanceof Error ? mutationError.message : '';
        const isLessonNotFound = errorMessage.includes('Lesson not found');

        if (isLessonNotFound) {
          const fallbackSlug = getLessonSlugFromPathname();
          if (fallbackSlug && fallbackSlug !== effectiveLessonId) {
            effectiveLessonId = fallbackSlug;
            try {
              const result = await completePhaseRequest({
                lessonId: effectiveLessonId,
                phaseNumber,
                timeSpent,
                idempotencyKey,
                linkedStandardId,
              });

              idempotencyKeyRef.current = null;

              const response: CompletePhaseResponse = {
                success: result.success,
                nextPhaseUnlocked: result.nextPhaseUnlocked ?? true,
              };

              onSuccess?.(response);
              return;
            } catch (retryError) {
              console.error('Retry with slug also failed:', retryError);
            }
          }
        }

        const queuedCompletion: QueuedCompletion = {
          userId,
          lessonId: effectiveLessonId,
          phaseNumber,
          timeSpent,
          idempotencyKey,
          completedAt: new Date().toISOString(),
          retryCount: 0,
        };

        enqueueCompletion(queuedCompletion);
        throw mutationError;
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to complete phase');
      setError(errorObj);
      onError?.(errorObj);
    } finally {
      setIsCompleting(false);
    }
  }, [lessonId, phaseNumber, userId, onSuccess, onError, isCompleting, linkedStandardId]);

  return {
    completePhase,
    isCompleting,
    error,
  };
}
