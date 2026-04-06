/**
 * AI-Assisted Interpretation Pipeline
 *
 * Generates teacher-facing interpretations from stored practice evidence
 * and deterministic summaries. AI output is strictly additive — it never
 * replaces raw evidence or deterministic tags.
 *
 * The pipeline is designed to fail gracefully: if the AI provider is
 * unavailable, disabled, or returns an error, the teacher still sees
 * the full deterministic summary and raw evidence.
 */

import type { LessonErrorSummary } from './error-summary';
import { withRetry } from '@/lib/ai/retry';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIInterpretationResult {
  interpretation: string | null;
  likelyMisunderstanding: string | null;
  evidenceObserved: string[];
  suggestedReteach: string | null;
  groundedIn: string[];
  providerUsed: string | null;
  error: string | null;
}

export interface AIInterpretationConfig {
  enabled: boolean;
  provider?: string;
  apiKey?: string;
  maxTokens?: number;
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Read AI configuration from environment variables.
 *
 * Returns a disabled config by default so the feature is opt-in.
 */
export function getAIConfig(): AIInterpretationConfig {
  const enabled = process.env.AI_INTERPRETATION_ENABLED === 'true';
  const provider = process.env.AI_INTERPRETATION_PROVIDER;
  const apiKey = process.env.AI_INTERPRETATION_API_KEY;
  const maxTokens = parseInt(process.env.AI_INTERPRETATION_MAX_TOKENS ?? '500', 10);
  const timeoutMs = parseInt(process.env.AI_INTERPRETATION_TIMEOUT_MS ?? '5000', 10);

  return {
    enabled,
    provider,
    apiKey,
    maxTokens: Number.isNaN(maxTokens) ? 500 : maxTokens,
    timeoutMs: Number.isNaN(timeoutMs) ? 5000 : timeoutMs,
  };
}

// ---------------------------------------------------------------------------
// Prompt assembly
// ---------------------------------------------------------------------------

/**
 * Build a prompt for the AI provider from the deterministic summary.
 *
 * The prompt includes:
 * - Student performance overview
 * - Top misconception tags with frequencies
 * - Scaffold usage patterns
 * - Per-activity breakdown
 *
 * The AI is asked to return structured JSON with:
 * - likelyMisunderstanding: the most probable conceptual gap
 * - evidenceObserved: specific evidence points from the submission
 * - suggestedReteach: a concrete reteaching direction
 * - groundedIn: which submission data points the interpretation is based on
 */
function buildAIPrompt(summary: LessonErrorSummary): string {
  const lines: string[] = [];

  lines.push('You are an expert accounting education assistant.');
  lines.push('Analyze the following student practice evidence and provide a concise interpretation.');
  lines.push('');

  lines.push(`Student: ${summary.studentName}`);
  lines.push(`Lesson: ${summary.lessonTitle}`);
  lines.push('');

  if (summary.overallCorrectnessRate !== null) {
    const pct = Math.round(summary.overallCorrectnessRate * 100);
    lines.push(`Overall performance: ${pct}% correct (${summary.correctParts}/${summary.totalParts} parts)`);
  }

  if (summary.topMisconceptions.length > 0) {
    lines.push('');
    lines.push('Top misconceptions:');
    for (const m of summary.topMisconceptions.slice(0, 5)) {
      lines.push(`  - "${m.tag}" (${m.count} occurrences across parts: ${m.partIds.join(', ')})`);
    }
  }

  if (summary.totalHintsUsed > 0 || summary.totalRevealsSeen > 0 || summary.totalEditsMade > 0) {
    lines.push('');
    lines.push(`Scaffold usage: ${summary.totalHintsUsed} hints, ${summary.totalRevealsSeen} reveals, ${summary.totalEditsMade} edits`);
  }

  if (summary.activities.length > 0) {
    lines.push('');
    lines.push('Activity breakdown:');
    for (const activity of summary.activities) {
      const pct = activity.correctnessRate !== null
        ? `${Math.round(activity.correctnessRate * 100)}%`
        : 'unscored';
      lines.push(`  - ${activity.activityTitle}: ${activity.correctParts}/${activity.totalParts} correct (${pct})`);
      if (activity.misconceptionTags.length > 0) {
        const tags = activity.misconceptionTags.map((t) => t.tag).join(', ');
        lines.push(`    Tags: ${tags}`);
      }
    }
  }

  lines.push('');
  lines.push('Return a JSON object with these fields:');
  lines.push('  - likelyMisunderstanding: string — the most probable conceptual gap');
  lines.push('  - evidenceObserved: string[] — 2-4 specific evidence points from the submission');
  lines.push('  - suggestedReteach: string — a concrete reteaching direction');
  lines.push('  - groundedIn: string[] — which submission data points your interpretation is based on');
  lines.push('');
  lines.push('Be concise. Only reference evidence that is actually present in the data above.');
  lines.push('If the student performed well, say so and suggest enrichment rather than reteaching.');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Provider abstraction
// ---------------------------------------------------------------------------

/**
 * Call the configured AI provider with a timeout.
 *
 * Returns the raw response string or throws on error.
 */
async function callAIProvider(
  prompt: string,
  config: AIInterpretationConfig,
): Promise<string> {
  const provider = config.provider ?? 'openai';
  const apiKey = config.apiKey;
  const maxTokens = config.maxTokens ?? 500;
  const timeoutMs = config.timeoutMs ?? 5000;

  if (!apiKey) {
    throw new Error('AI API key is not configured');
  }

  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (provider === 'openai') {
        return await callOpenAI(prompt, apiKey, maxTokens, controller.signal);
      } else if (provider === 'anthropic') {
        return await callAnthropic(prompt, apiKey, maxTokens, controller.signal);
      } else {
        throw new Error(`Unknown AI provider: ${provider}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  });
}

async function callOpenAI(
  prompt: string,
  apiKey: string,
  maxTokens: number,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callAnthropic(
  prompt: string,
  apiKey: string,
  maxTokens: number,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? '';
}

// ---------------------------------------------------------------------------
// Response parsing
// ---------------------------------------------------------------------------

/**
 * Parse the AI response into a structured interpretation result.
 *
 * Handles malformed JSON gracefully by returning a partial result.
 */
function parseAIResponse(rawResponse: string, provider: string): AIInterpretationResult {
  try {
    let jsonStr = rawResponse.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

    const evidenceObserved = Array.isArray(parsed.evidenceObserved)
      ? parsed.evidenceObserved.filter((e): e is string => typeof e === 'string')
      : [];

    const groundedIn = Array.isArray(parsed.groundedIn)
      ? parsed.groundedIn.filter((g): g is string => typeof g === 'string')
      : [];

    return {
      interpretation: typeof parsed.likelyMisunderstanding === 'string'
        ? parsed.likelyMisunderstanding
        : null,
      likelyMisunderstanding: typeof parsed.likelyMisunderstanding === 'string'
        ? parsed.likelyMisunderstanding
        : null,
      evidenceObserved,
      suggestedReteach: typeof parsed.suggestedReteach === 'string'
        ? parsed.suggestedReteach
        : null,
      groundedIn,
      providerUsed: provider,
      error: null,
    };
  } catch {
    return {
      interpretation: rawResponse.trim().slice(0, 1000),
      likelyMisunderstanding: null,
      evidenceObserved: [],
      suggestedReteach: null,
      groundedIn: [],
      providerUsed: provider,
      error: 'Failed to parse AI response as structured JSON',
    };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate an AI-assisted interpretation for a lesson-level error summary.
 *
 * Returns a structured result even when the AI layer fails — the `error`
 * field will be populated and `interpretation` may contain a fallback.
 *
 * This function is designed to be called asynchronously from the API route
 * without blocking the deterministic summary delivery.
 */
export async function generateAIInterpretation(
  summary: LessonErrorSummary,
  config?: AIInterpretationConfig,
): Promise<AIInterpretationResult> {
  const cfg = config ?? getAIConfig();

  if (!cfg.enabled) {
    return {
      interpretation: null,
      likelyMisunderstanding: null,
      evidenceObserved: [],
      suggestedReteach: null,
      groundedIn: [],
      providerUsed: null,
      error: 'AI interpretation is disabled',
    };
  }

  if (summary.totalParts === 0) {
    return {
      interpretation: null,
      likelyMisunderstanding: null,
      evidenceObserved: [],
      suggestedReteach: null,
      groundedIn: [],
      providerUsed: cfg.provider ?? null,
      error: 'No practice evidence available to analyze',
    };
  }

  try {
    const prompt = buildAIPrompt(summary);
    const rawResponse = await callAIProvider(prompt, cfg);
    return parseAIResponse(rawResponse, cfg.provider ?? 'unknown');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return {
      interpretation: null,
      likelyMisunderstanding: null,
      evidenceObserved: [],
      suggestedReteach: null,
      groundedIn: [],
      providerUsed: cfg.provider ?? null,
      error: errorMessage,
    };
  }
}
