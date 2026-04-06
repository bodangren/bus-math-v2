/**
 * AI provider adapters for teacher error analysis.
 *
 * Each provider is a simple (prompt: string) => Promise<string> function
 * compatible with the injectable aiProvider parameter in generateAISummary.
 */

import { withRetry } from '@/lib/ai/retry';

const OPENAI_API_BASE = 'https://api.openai.com/v1';

export interface OpenAIProviderOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export function createOpenAIProvider(options: OpenAIProviderOptions) {
  const { apiKey, model = 'gpt-4o-mini', baseUrl = OPENAI_API_BASE, timeoutMs = 15000 } = options;

  return async function openAIProvider(prompt: string): Promise<string> {
    return withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert accounting teacher analyzing student practice submissions. ' +
                  'Respond with exactly three lines: ' +
                  '1) the likely misunderstanding (1-2 sentences), ' +
                  '2) evidence observed (reference specific answers), ' +
                  '3) suggested reteach or intervention direction (1-2 sentences). ' +
                  'No numbering, no extra text.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 300,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
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

export function resolveAIProviderFromEnv(): ((prompt: string) => Promise<string>) | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }

  return createOpenAIProvider({
    apiKey,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    baseUrl: process.env.OPENAI_API_BASE || OPENAI_API_BASE,
  });
}
