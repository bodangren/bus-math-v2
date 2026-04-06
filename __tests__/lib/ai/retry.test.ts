import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, isRetryableStatus } from '@/lib/ai/retry';

describe('isRetryableStatus', () => {
  it('returns true for 429', () => {
    expect(isRetryableStatus(429)).toBe(true);
  });

  it('returns true for 5xx errors', () => {
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(502)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(504)).toBe(true);
  });

  it('returns false for 4xx errors (except 429)', () => {
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(401)).toBe(false);
    expect(isRetryableStatus(403)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
  });

  it('returns false for 2xx', () => {
    expect(isRetryableStatus(200)).toBe(false);
    expect(isRetryableStatus(201)).toBe(false);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on transient failure and eventually succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, { maxRetries: 2, baseDelayMs: 100 });

    // Advance through the backoff delay
    await vi.advanceTimersByTimeAsync(150);

    const result = await promise;
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on 429 error', async () => {
    const error429 = new Error('OpenAI API error (429): Rate limit exceeded');
    const fn = vi.fn()
      .mockRejectedValueOnce(error429)
      .mockResolvedValue('ok');

    const promise = withRetry(fn, { maxRetries: 1, baseDelayMs: 50 });
    await vi.advanceTimersByTimeAsync(100);

    const result = await promise;
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 400 error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('OpenAI API error (400): Bad request'));

    await expect(withRetry(fn, { maxRetries: 2 })).rejects.toThrow('400');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not retry on 401 error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('OpenAI API error (401): Unauthorized'));

    await expect(withRetry(fn, { maxRetries: 2 })).rejects.toThrow('401');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting all retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('503 Service Unavailable'));

    const promise = withRetry(fn, { maxRetries: 2, baseDelayMs: 10 });
    // Attach handler before advancing timers to prevent unhandled rejection
    const assertPromise = expect(promise).rejects.toThrow('503');

    // Advance through all retry delays
    await vi.advanceTimersByTimeAsync(500);

    await assertPromise;
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('calls function on each retry attempt', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('500 Internal Server Error'))
      .mockRejectedValueOnce(new Error('502 Bad Gateway'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, { maxRetries: 2, baseDelayMs: 10 });
    await vi.advanceTimersByTimeAsync(500);

    const result = await promise;
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects AbortSignal to cancel retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('503'));
    const controller = new AbortController();

    const promise = withRetry(fn, {
      maxRetries: 3,
      baseDelayMs: 10,
      signal: controller.signal,
    });

    // Cancel immediately
    controller.abort();

    await expect(promise).rejects.toThrow('abort');
  });

  it('handles AbortError directly (does not retry)', async () => {
    const fn = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    await expect(withRetry(fn, { maxRetries: 2 })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('defaults to 2 retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('503 Service Unavailable'));

    const promise = withRetry(fn, { baseDelayMs: 5 });
    // Attach handler before advancing timers to prevent unhandled rejection
    const assertPromise = expect(promise).rejects.toThrow('503');

    // Advance through all retry delays
    await vi.advanceTimersByTimeAsync(500);

    await assertPromise;
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries (default)
  });

  it('retries on network errors (non-HTTP)', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, { maxRetries: 1, baseDelayMs: 10 });
    await vi.advanceTimersByTimeAsync(50);

    const result = await promise;
    expect(result).toBe('ok');
  });
});
