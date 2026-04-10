import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOpenRouterProvider } from '@/lib/ai/providers';

describe('lib/ai/providers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createOpenRouterProvider', () => {
    it('should create a provider function', () => {
      const provider = createOpenRouterProvider({ apiKey: 'test-key' });
      expect(typeof provider).toBe('function');
    });

    it('should call OpenRouter API with correct parameters', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test response' } }],
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const provider = createOpenRouterProvider({ apiKey: 'test-key' });
      const result = await provider('Test prompt');

      expect(result).toBe('Test response');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toBe('https://openrouter.ai/api/v1/chat/completions');
    });
  });
});