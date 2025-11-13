'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

type ToastVariant = 'success' | 'error';

interface ToastState {
  message: string;
  description?: string;
  variant: ToastVariant;
}

interface PhaseCompleteButtonProps {
  phaseId: string;
  /**
   * Optional initial status from the server so the UI can render completed phases as disabled.
   */
  initialStatus?: ProgressStatus;
  /**
   * Optional time on task metric (in seconds) to forward to the progress API.
   */
  timeSpentSeconds?: number;
  disabled?: boolean;
  className?: string;
  idleLabel?: string;
  completedLabel?: string;
  onStatusChange?: (status: ProgressStatus) => void;
}

const DEFAULT_IDLE_LABEL = 'Mark Complete';
const DEFAULT_COMPLETED_LABEL = 'Completed';

export function PhaseCompleteButton({
  phaseId,
  initialStatus = 'not_started',
  timeSpentSeconds,
  disabled = false,
  className,
  idleLabel = DEFAULT_IDLE_LABEL,
  completedLabel = DEFAULT_COMPLETED_LABEL,
  onStatusChange,
}: PhaseCompleteButtonProps) {
  const [status, setStatus] = useState<ProgressStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCompleted = status === 'completed';
  const isButtonDisabled = disabled || isSubmitting || isCompleted;

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const buttonLabel = isCompleted ? completedLabel : idleLabel;

  const handleStatusChange = useCallback(
    (nextStatus: ProgressStatus) => {
      setStatus(nextStatus);
      onStatusChange?.(nextStatus);
    },
    [onStatusChange],
  );

  const showToast = useCallback((payload: ToastState) => {
    setToast(payload);
  }, []);

  const parseApiResponse = useCallback((payload: unknown): ProgressStatus | null => {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const response = payload as { progress?: { status?: ProgressStatus } };
    return response.progress?.status ?? null;
  }, []);

  const extractErrorMessage = useCallback((payload: unknown, fallback: string) => {
    if (payload && typeof payload === 'object' && 'error' in payload) {
      const { error } = payload as { error?: unknown };
      if (typeof error === 'string') {
        return error;
      }
    }

    return fallback;
  }, []);

  const markPhaseComplete = useCallback(async () => {
    if (isButtonDisabled) {
      return;
    }

    const previousStatus = status;
    setIsSubmitting(true);
    setErrorMessage(null);

    // Optimistic update: immediately reflect completion
    handleStatusChange('completed');

    try {
      const response = await fetch('/api/progress/phase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phaseId,
          status: 'completed',
          completed: true,
          timeSpentSeconds,
        }),
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const reason = extractErrorMessage(payload, response.statusText || 'Unable to save progress');
        throw new Error(reason || 'Unable to save progress');
      }

      const resolvedStatus = parseApiResponse(payload) ?? 'completed';
      handleStatusChange(resolvedStatus);
      showToast({
        message: 'Phase completed',
        description: 'Your progress is synced.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to save phase progress:', error);
      handleStatusChange(previousStatus);
      const friendlyMessage =
        error instanceof Error ? error.message : 'Unable to save progress. Please try again.';
      setErrorMessage(friendlyMessage);
      showToast({
        message: 'Unable to save progress',
        description: friendlyMessage,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [extractErrorMessage, handleStatusChange, isButtonDisabled, parseApiResponse, phaseId, showToast, status, timeSpentSeconds]);

  const statusHelper = useMemo(() => {
    if (isSubmitting) {
      return 'Syncing progress…';
    }
    if (isCompleted) {
      return 'Marked complete';
    }
    return null;
  }, [isCompleted, isSubmitting]);

  return (
    <>
      <div className={cn('w-full max-w-sm space-y-2', className)}>
        <Button
          type="button"
          variant={isCompleted ? 'outline' : 'default'}
          aria-pressed={isCompleted}
          aria-live="polite"
          disabled={isButtonDisabled}
          onClick={markPhaseComplete}
          className={cn(
            'w-full justify-center font-semibold',
            isCompleted ? 'border-green-300 text-green-700 dark:text-green-300' : '',
          )}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {!isSubmitting && isCompleted && <CheckCircle2 className="h-4 w-4" aria-hidden />}
          <span>{buttonLabel}</span>
        </Button>

        {statusHelper ? (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {statusHelper}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>

      {toast ? <Toast {...toast} onDismiss={() => setToast(null)} /> : null}
    </>
  );
}

interface ToastProps extends ToastState {
  onDismiss: () => void;
}

function Toast({ message, description, variant, onDismiss }: ToastProps) {
  if (typeof document === 'undefined') {
    return null;
  }

  const Icon = variant === 'success' ? CheckCircle2 : AlertCircle;
  const variantClass =
    variant === 'success'
      ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-100'
      : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100';

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm animate-in fade-in slide-in-from-bottom-2">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm',
          variantClass,
        )}
      >
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden />
        <div className="flex-1 text-sm">
          <p className="font-semibold">{message}</p>
          {description ? <p className="text-xs opacity-80">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium text-current/70 transition hover:text-current"
          aria-label="Dismiss notification"
        >
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}
