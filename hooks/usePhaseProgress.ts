'use client';

import { useEffect, useState, useCallback } from 'react';
import type {
  LessonProgressResponse as ProgressData,
  PhaseProgressResponse as PhaseProgress,
  PhaseStatus,
} from '@/types/api';

export type { PhaseStatus, PhaseProgress, ProgressData };

interface UsePhaseProgressResult {
  data: ProgressData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const STALE_TIME = 60 * 1000; // 60 seconds

// Simple in-memory cache
const cache = new Map<string, { data: ProgressData; timestamp: number }>();

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

type ProgressFetchResult = {
  ok: boolean;
  status: number;
  payload: ProgressData | Record<string, unknown>;
};

async function fetchProgressByIdentifier(lessonIdentifier: string): Promise<ProgressFetchResult> {
  const response = await fetch(`/api/lessons/${encodeURIComponent(lessonIdentifier)}/progress`);
  const payload = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    payload: payload as ProgressData | Record<string, unknown>,
  };
}

export function usePhaseProgress(lessonId: string | undefined): UsePhaseProgressResult {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!lessonId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      // Check cache first
      const cached = cache.get(lessonId);
      if (cached && Date.now() - cached.timestamp < STALE_TIME) {
        setData(cached.data);
        setIsLoading(false);
        return;
      }

      let fetchResult = await fetchProgressByIdentifier(lessonId);

      const errorPayload =
        (fetchResult.payload && typeof fetchResult.payload === 'object'
          ? (fetchResult.payload as Record<string, unknown>)
          : {}) ?? {};

      // Backward-compatible retry: recover when a non-canonical lesson identifier is passed.
      if (
        !fetchResult.ok &&
        fetchResult.status === 404 &&
        errorPayload.error === 'Lesson not found'
      ) {
        const lessonSlug = getLessonSlugFromPathname();
        if (lessonSlug && lessonSlug !== lessonId) {
          fetchResult = await fetchProgressByIdentifier(lessonSlug);
        }
      }

      if (!fetchResult.ok) {
        const failedPayload =
          (fetchResult.payload && typeof fetchResult.payload === 'object'
            ? (fetchResult.payload as Record<string, unknown>)
            : {}) ?? {};
        throw new Error(
          (typeof failedPayload.error === 'string' && failedPayload.error) ||
            `HTTP error! status: ${fetchResult.status}`,
        );
      }

      const progressData: ProgressData = fetchResult.payload as ProgressData;

      // Update cache
      cache.set(lessonId, { data: progressData, timestamp: Date.now() });

      setData(progressData);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch progress');
      setError(errorObj);
      setIsError(true);
      console.error('Error fetching phase progress:', errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchProgress();

    // Refetch on window focus
    const handleFocus = () => {
      fetchProgress();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchProgress]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchProgress,
  };
}
