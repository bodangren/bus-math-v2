# Track Specification: U2 Transactions & Adjustments Exercise Implementation

## Overview
Implement three transactions and adjustments exercise components for Unit 2:
- `adjustment-practice`
- `closing-entry-practice`
- `month-end-close-practice`

Each component must follow the existing exercise component pattern (StraightLineMastery, DDBComparisonMastery, CapitalizationExpenseMastery, MarkupMarginMastery, BreakEvenMastery, InventoryAlgorithmShowtell) with:
- practice.v1 envelope submission
- submittedRef guard for double‑submit protection
- mastery threshold support (where applicable)
- worked example view
- misconception tagging (where applicable)

## Functional Requirements

### 1. adjustment-practice
- Practice identifying and recording adjusting entries (deferrals, accruals, depreciation)
- Mastery threshold: 5 consecutive correct answers
- Distractors for common mistakes: wrong accounts, wrong sides, wrong amounts
- Misconception tags for error patterns
- Leverages the existing `adjusting-calculations` and `adjustment-effects` practice families

### 2. closing-entry-practice
- Practice recording closing entries at period end
- Mastery threshold: 5 consecutive correct answers
- Distractors for common mistakes: closing the wrong accounts, wrong sides, incorrect amounts
- Misconception tags for error patterns

### 3. month-end-close-practice
- Integrated practice of the full month‑end close cycle (adjustments, closing entries)
- No mastery threshold (comprehensive showtell/practice)
- Distractors for common mistakes in the full cycle
- Misconception tags for error patterns

## Non-Functional Requirements
- Follow existing code style and patterns
- High test coverage for new components
- No new dependencies
- Pass `npm run lint`, `npm test`, and `npm run build`

## Acceptance Criteria
- All three components are registered in `lib/activities/registry.ts`
- Each component emits valid `practice.v1` envelopes
- All tests pass
- No lint errors
- Build passes cleanly