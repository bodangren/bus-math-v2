'use client';

import { useEffect, useState, useCallback } from 'react';

export type PhaseStatus = 'completed' | 'current' | 'available' | 'locked';

export interface PhaseProgress {
  phaseNumber: number;
  phaseId: string;
  status: PhaseStatus;
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSeconds: number | null;
}

export interface ProgressData {
  phases: PhaseProgress[];
}

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

      const response = await fetch(`/api/lessons/${lessonId}/progress`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const progressData: ProgressData = await response.json();

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
