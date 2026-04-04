import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAIInterpretation, getAIConfig } from '@/lib/teacher/ai-interpretation';
import type { LessonErrorSummary } from '@/lib/teacher/error-summary';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSummary(overrides: Partial<LessonErrorSummary> = {}): LessonErrorSummary {
  return {
    studentName: 'Alice Brown',
    lessonTitle: 'Lesson 1: Accounting Equation',
    activities: [
      {
        activityId: 'act-1',
        activityTitle: 'Journal Entry Practice',
        mode: 'independent_practice',
        totalParts: 3,
        correctParts: 1,
        incorrectParts: 2,
        correctnessRate: 0.33,
        misconceptionTags: [
          { tag: 'normal-balance-error', count: 2, partIds: ['q2', 'q3'] },
          { tag: 'amount-error', count: 1, partIds: ['q3'] },
        ],
        hintsUsed: 2,
        revealStepsSeen: 1,
        editsMade: 3,
      },
    ],
    totalParts: 3,
    correctParts: 1,
    incorrectParts: 2,
    overallCorrectnessRate: 0.33,
    topMisconceptions: [
      { tag: 'normal-balance-error', count: 2, partIds: ['q2', 'q3'] },
      { tag: 'amount-error', count: 1, partIds: ['q3'] },
    ],
    totalHintsUsed: 2,
    totalRevealsSeen: 1,
    totalEditsMade: 3,
    attemptNumber: 1,
    latestSubmittedAt: '2026-03-19T12:30:00.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getAIConfig
// ---------------------------------------------------------------------------

describe('getAIConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns disabled config by default', () => {
    delete process.env.AI_INTERPRETATION_ENABLED;
    const config = getAIConfig();
    expect(config.enabled).toBe(false);
  });

  it('enables when env var is true', () => {
    process.env.AI_INTERPRETATION_ENABLED = 'true';
    process.env.AI_INTERPRETATION_PROVIDER = 'openai';
    process.env.AI_INTERPRETATION_API_KEY = 'test-key';
    const config = getAIConfig();
    expect(config.enabled).toBe(true);
    expect(config.provider).toBe('openai');
    expect(config.apiKey).toBe('test-key');
  });

  it('uses defaults for invalid numeric env vars', () => {
    process.env.AI_INTERPRETATION_ENABLED = 'true';
    process.env.AI_INTERPRETATION_MAX_TOKENS = 'not-a-number';
    process.env.AI_INTERPRETATION_TIMEOUT_MS = 'also-not-a-number';
    const config = getAIConfig();
    expect(config.maxTokens).toBe(500);
    expect(config.timeoutMs).toBe(5000);
  });
});

// ---------------------------------------------------------------------------
// generateAIInterpretation
// ---------------------------------------------------------------------------

describe('generateAIInterpretation', () => {
  it('returns disabled error when AI is not enabled', async () => {
    const summary = makeSummary();
    const result = await generateAIInterpretation(summary, { enabled: false });

    expect(result.interpretation).toBeNull();
    expect(result.error).toBe('AI interpretation is disabled');
  });

  it('returns no-evidence error when summary has no parts', async () => {
    const emptySummary = makeSummary({ totalParts: 0, activities: [], topMisconceptions: [] });
    const result = await generateAIInterpretation(emptySummary, { enabled: true, provider: 'openai' });

    expect(result.error).toBe('No practice evidence available to analyze');
  });

  it('returns provider error when API key is missing', async () => {
    const summary = makeSummary();
    const result = await generateAIInterpretation(summary, {
      enabled: true,
      provider: 'openai',
      apiKey: undefined,
    });

    expect(result.error).toContain('API key is not configured');
  });

  it('returns provider error for unknown provider', async () => {
    const summary = makeSummary();
    const result = await generateAIInterpretation(summary, {
      enabled: true,
      provider: 'unknown-provider',
      apiKey: 'test-key',
    });

    expect(result.error).toContain('Unknown AI provider');
  });

  it('parses valid JSON response correctly', async () => {
    const mockResponse = JSON.stringify({
      likelyMisunderstanding: 'Student confuses debit/credit rules for asset accounts',
      evidenceObserved: [
        'Normal balance error on 2 parts',
        'Amount calculation error on 1 part',
        'Used 2 hints suggesting uncertainty',
      ],
      suggestedReteach: 'Review the DEALER mnemonic with focus on asset account normal balances',
      groundedIn: ['misconception tag frequency', 'scaffold usage pattern'],
    });

    // Mock fetch for OpenAI
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: mockResponse } }],
      }),
    });

    const summary = makeSummary();
    const result = await generateAIInterpretation(summary, {
      enabled: true,
      provider: 'openai',
      apiKey: 'test-key',
      timeoutMs: 1000,
    });

    expect(result.error).toBeNull();
    expect(result.likelyMisunderstanding).toBe('Student confuses debit/credit rules for asset accounts');
    expect(result.evidenceObserved).toHaveLength(3);
    expect(result.suggestedReteach).toContain('DEALER');
    expect(result.groundedIn).toContain('misconception tag frequency');
    expect(result.providerUsed).toBe('openai');

    global.fetch = originalFetch;
  });

  it('handles malformed JSON gracefully', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'This is not valid JSON at all!' } }],
      }),
    });

    const summary = makeSummary();
    const result = await generateAIInterpretation(summary, {
      enabled: true,
      provider: 'openai',
      apiKey: 'test-key',
      timeoutMs: 1000,
    });

    expect(result.error).toContain('Failed to parse');
    expect(result.interpretation).toBe('This is not valid JSON at all!');
    expect(result.evidenceObserved).toHaveLength(0);

    global.fetch = originalFetch;
  });

  it('handles JSON wrapped in markdown code blocks', async () => {
    const wrappedResponse = '```json\n' + JSON.stringify({
      likelyMisunderstanding: 'Test understanding',
      evidenceObserved: ['evidence 1'],
      suggestedReteach: 'reteach suggestion',
      groundedIn: ['data point'],
    }) + '\n```';

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: wrappedResponse } }],
      }),
    });

    const summary = makeSummary();
    const result = await generateAIInterpretation(summary, {
      enabled: true,
      provider: 'openai',
      apiKey: 'test-key',
      timeoutMs: 1000,
    });

    expect(result.error).toBeNull();
    expect(result.likelyMisunderstanding).toBe('Test understanding');

    global.fetch = originalFetch;
  });

  it('handles API error gracefully', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
    });

    const summary = makeSummary();
    const result = await generateAIInterpretation(summary, {
      enabled: true,
      provider: 'openai',
      apiKey: 'test-key',
      timeoutMs: 1000,
    });

    expect(result.error).toContain('429');
    expect(result.interpretation).toBeNull();

    global.fetch = originalFetch;
  });

  it('handles network timeout gracefully', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), 100);
      });
    });

    const summary = makeSummary();
    const result = await generateAIInterpretation(summary, {
      enabled: true,
      provider: 'openai',
      apiKey: 'test-key',
      timeoutMs: 50,
    });

    expect(result.error).toBeTruthy();
    expect(result.interpretation).toBeNull();

    global.fetch = originalFetch;
  });
});

// ---------------------------------------------------------------------------
// AI-Summary Fallback Behavior Tests
// ---------------------------------------------------------------------------

describe('AI-summary fallback behavior', () => {
  it('teacher evidence works when AI analysis is unavailable', async () => {
    const summary = makeSummary();
    const result = await generateAIInterpretation(summary, { enabled: false });

    // AI layer is disabled, but deterministic summary still works
    expect(result.error).toBe('AI interpretation is disabled');
    expect(result.interpretation).toBeNull();
  });

  it('AI output never replaces raw evidence access', async () => {
    // The AI interpretation is additive — it returns a separate result object
    // that can be displayed alongside the deterministic summary
    const mockResponse = JSON.stringify({
      likelyMisunderstanding: 'Test',
      evidenceObserved: ['evidence'],
      suggestedReteach: 'reteach',
      groundedIn: ['data'],
    });

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: mockResponse } }],
      }),
    });

    const summary = makeSummary();
    const aiResult = await generateAIInterpretation(summary, {
      enabled: true,
      provider: 'openai',
      apiKey: 'test-key',
      timeoutMs: 1000,
    });

    // AI result is separate from deterministic data
    expect(aiResult.likelyMisunderstanding).toBe('Test');
    expect(aiResult.evidenceObserved).toContain('evidence');
    // Raw evidence (summary.activities, summary.topMisconceptions) remains intact
    expect(summary.activities).toHaveLength(1);
    expect(summary.topMisconceptions).toHaveLength(2);

    global.fetch = originalFetch;
  });
});
