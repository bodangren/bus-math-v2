/**
 * Shared AI provider adapters for both teacher and student features.
 */

import { withRetry } from '@/lib/ai/retry';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

export interface OpenRouterProviderOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export function createOpenRouterProvider(options: OpenRouterProviderOptions) {
  const {
    apiKey,
    model = 'openrouter/free',
    baseUrl = OPENROUTER_API_BASE,
    timeoutMs = 15000,
  } = options;

  return async function openRouterProvider(prompt: string): Promise<string> {
    return withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://github.com/bodangren/ra-business-math',
            'X-Title': 'Business Math v2',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await response.json() as any;
        const content = data.choices?.[0]?.message?.content;
        if (typeof content !== 'string' || content.trim().length === 0) {
          throw new Error('Empty response from AI provider');
        }
        return content.trim();
      } finally {
        clearTimeout(timeout);
      }
    });
  };
}

export function resolveOpenRouterProviderFromEnv(): ((prompt: string) => Promise<string>) | null {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }

  return createOpenRouterProvider({
    apiKey,
    model: process.env.OPENROUTER_MODEL || 'openrouter/free',
    baseUrl: process.env.OPENROUTER_API_BASE || OPENROUTER_API_BASE,
  });
}