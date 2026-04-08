# Track Specification: U3 Financial Statements & Reporting Exercise Implementation

## Overview

Implement the remaining exercise components for Unit 3 (Financial Statements & Reporting):
- `income-statement-practice`
- `cash-flow-practice`
- `balance-sheet-practice`
- `chart-linking-simulator`
- `cross-sheet-link-simulator`

These components follow the same pattern as the existing exercise components (e.g., `AdjustmentPractice`, `ClosingEntryPractice`, `MarkupMarginMastery`):
- Use `practice.v1` submission envelope
- Include `submittedRef` guard for double‑submit prevention
- Support worked‑example view
- Use mastery threshold (consecutive correct answers)
- Emit `misconceptionTags` for common errors

## Functional Requirements

### 1. Exercise Components
Each exercise component must:
- Accept the standard activity props (`activity`, `onSubmit`, `onComplete`, `mode`, etc.)
- Render a worked‑example view when `mode === 'worked-example'`
- Render guided/independent/assessment views for other modes
- Track consecutive correct answers to trigger mastery
- Emit a `practice.v1` envelope on submission
- Include a reset function that clears `submittedRef` and all state
- Disable submit button after submission

### 2. Simulator Components
Each simulator component must:
- Accept the standard activity props
- Provide an interactive exploration of the concept
- Emit a `practice.v1` envelope on submission
- Include `submittedRef` guard
- Include a reset function

## Non-Functional Requirements

- Follow existing code style and patterns
- Write tests for each component (render, onSubmit, onComplete)
- Pass `npm run lint`
- Pass `npm test`
- Pass `npm run build`

## Acceptance Criteria

- All five components are implemented
- All components are registered in `lib/activities/registry.ts`
- All tests pass
- Lint and build pass
- `tech-debt.md` is updated to reflect reduced placeholder count

## Out of Scope

- New practice families
- Curriculum wiring
- Teacher mode enhancements
