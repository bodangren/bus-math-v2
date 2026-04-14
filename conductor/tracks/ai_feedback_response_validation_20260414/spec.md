# AI Feedback Response Validation

## Track ID
ai_feedback_response_validation_20260414

## Spec
Add Zod schema validation to `generateAiFeedback` parsed response to ensure AI-returned fields match expected types. The parsed JSON currently casts fields without validation — if AI returns wrong types (e.g., `preliminaryScore` as string, or `strengths` as number array), these would propagate to callers without error.

## Problem Statement
In `lib/ai/spreadsheet-feedback.ts` line 97, `JSON.parse(rawResponse)` result is cast to:
```ts
parsed: {
  preliminaryScore: number;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}
```
If AI returns `preliminaryScore: "35"` (string) or `strengths: [1, 2]` (numbers), no validation occurs before assignment.

## Solution
Add a Zod schema in `lib/ai/spreadsheet-feedback.ts` and parse/validate the AI response. On validation failure, fall back to deterministic feedback (same as parse error fallback).

## Acceptance Criteria
1. Zod schema validates `preliminaryScore` (number 0-40), `strengths` (string[]), `improvements` (string[]), `nextSteps` (string[])
2. Invalid response types trigger fallback to deterministic feedback
3. Existing tests pass (lint, test, build)
4. Tech-debt item marked closed in tech-debt.md

## Tech Debt Item
- `generateAiFeedback` parsed response fields not validated (Low, 2026-04-11)
  - JSON.parse result is cast but not validated. Add zod validation or type guards.