/**
 * Shared HTTP retry wrapper for AI provider calls.
 *
 * Provides exponential backoff with jitter for transient failures
 * (429 rate limits, 5xx server errors, network errors).
 * Non-retryable errors (4xx, aborts) are thrown immediately.
 */

export interface RetryOptions {
  /** Maximum number of retry attempts. Default: 2 */
  maxRetries?: number;
  /** Base delay in ms for exponential backoff. Default: 500 */
  baseDelayMs?: number;
  /** Maximum delay cap in ms. Default: 8000 */
  maxDelayMs?: number;
  /** AbortSignal to cancel retries */
  signal?: AbortSignal;
}

/**
 * Check if an HTTP status code is retryable.
 *
 * Retryable: 429 (rate limit) and 5xx (server errors).
 * Not retryable: 2xx, 3xx, 4xx (except 429).
 */
export function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return false;
  }

  if (error instanceof Error) {
    const message = error.message;
    // Match HTTP status codes in error messages like "API error (429): ..."
    const statusMatch = message.match(/\((\d{3})\)/);
    if (statusMatch) {
      return isRetryableStatus(parseInt(statusMatch[1], 10));
    }
    // Also match "error: 429" pattern (providers.ts format)
    const altMatch = message.match(/error:\s*(\d{3})/);
    if (altMatch) {
      return isRetryableStatus(parseInt(altMatch[1], 10));
    }
    // Network errors, timeouts, etc. are retryable
    return true;
  }

  return false;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeout);
      reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Wrap an async function with retry logic and exponential backoff.
 *
 * Retries on transient failures (429, 5xx, network errors).
 * Throws immediately on non-retryable errors (4xx except 429, aborts).
 * Supports AbortSignal for cancellation.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 2,
    baseDelayMs = 500,
    maxDelayMs = 8000,
    signal,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) {
      throw signal.reason ?? new DOMException('Aborted', 'AbortError');
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry non-retryable errors
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry if we've exhausted attempts
      if (attempt >= maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const baseDelay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      const jitter = baseDelay * (0.5 + Math.random() * 0.5);
      await sleep(Math.round(jitter), signal);
    }
  }

  throw lastError;
}
