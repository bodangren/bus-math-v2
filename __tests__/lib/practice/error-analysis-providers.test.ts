import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { createOpenAIProvider, resolveAIProviderFromEnv } from '@/lib/practice/error-analysis/providers';

// ── createOpenAIProvider ─────────────────────────────────────────────────

describe('createOpenAIProvider', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should call the chat completions endpoint with correct headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: 'Line 1\nLine 2\nLine 3' } }],
        }),
    });
    global.fetch = mockFetch;

    const provider = createOpenAIProvider({ apiKey: 'test-key-123' });
    await provider('test prompt');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/chat/completions');
    expect(opts.headers.Authorization).toBe('Bearer test-key-123');
    expect(opts.method).toBe('POST');

    const body = JSON.parse(opts.body);
    expect(body.model).toBe('gpt-4o-mini');
    expect(body.messages[1].content).toBe('test prompt');
  });

  it('should use custom model when provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: 'response' } }],
        }),
    });
    global.fetch = mockFetch;

    const provider = createOpenAIProvider({ apiKey: 'key', model: 'gpt-4o' });
    await provider('prompt');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe('gpt-4o');
  });

  it('should use custom base URL when provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: 'response' } }],
        }),
    });
    global.fetch = mockFetch;

    const provider = createOpenAIProvider({
      apiKey: 'key',
      baseUrl: 'https://custom.ai/v1',
    });
    await provider('prompt');

    const url = mockFetch.mock.calls[0][0];
    expect(url).toBe('https://custom.ai/v1/chat/completions');
  });

  it('should throw on non-ok response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });
    global.fetch = mockFetch;

    const provider = createOpenAIProvider({ apiKey: 'key' });

    await expect(provider('prompt')).rejects.toThrow('OpenAI API error: 429');
  });

  it('should throw on empty response content', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: '' } }],
        }),
    });
    global.fetch = mockFetch;

    const provider = createOpenAIProvider({ apiKey: 'key' });

    await expect(provider('prompt')).rejects.toThrow('Empty response');
  });

  it('should throw on malformed response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    global.fetch = mockFetch;

    const provider = createOpenAIProvider({ apiKey: 'key' });

    await expect(provider('prompt')).rejects.toThrow('Empty response');
  });

  it('should abort on timeout', async () => {
    vi.useFakeTimers();

    const mockFetch = vi.fn().mockImplementation((_url: string, opts: RequestInit) => {
      return new Promise((_resolve, reject) => {
        opts.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });
    global.fetch = mockFetch;

    const provider = createOpenAIProvider({ apiKey: 'key', timeoutMs: 100 });
    const promise = provider('prompt');

    vi.advanceTimersByTime(150);

    await expect(promise).rejects.toThrow();
    vi.useRealTimers();
  });
});

// ── resolveAIProviderFromEnv ─────────────────────────────────────────────

describe('resolveAIProviderFromEnv', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
    delete process.env.OPENAI_API_BASE;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return null when OPENAI_API_KEY is not set', () => {
    expect(resolveAIProviderFromEnv()).toBeNull();
  });

  it('should return null when OPENAI_API_KEY is empty', () => {
    process.env.OPENAI_API_KEY = '  ';
    expect(resolveAIProviderFromEnv()).toBeNull();
  });

  it('should return a function when OPENAI_API_KEY is set', () => {
    process.env.OPENAI_API_KEY = 'sk-test-key';
    const provider = resolveAIProviderFromEnv();
    expect(typeof provider).toBe('function');
  });
});
