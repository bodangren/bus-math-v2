# Track Specification: U6 Inventory & Costing Exercise Implementation

## Overview
Implement three inventory and costing exercise components for Unit 6:
- `inventory-algorithm-showtell`
- `markup-margin-mastery`
- `break-even-mastery`

Each component must follow the existing exercise component pattern (StraightLineMastery, DDBComparisonMastery, CapitalizationExpenseMastery) with:
- practice.v1 envelope submission
- submittedRef guard for double-submit protection
- mastery threshold support
- worked example view
- misconception tagging (where applicable)

## Functional Requirements

### 1. inventory-algorithm-showtell
- Visualize FIFO, LIFO, and weighted average inventory cost flow
- Show step-by-step calculation for a small dataset
- No mastery threshold (showtell component)

### 2. markup-margin-mastery
- Practice calculating markup percentage and margin percentage
- Mastery threshold: 5 consecutive correct answers
- Distractors for common mistakes: confusing markup with margin, using wrong denominator
- Misconception tags for error patterns

### 3. break-even-mastery
- Practice calculating break-even point in units and dollars
- Mastery threshold: 5 consecutive correct answers
- Distractors for common mistakes: mixing fixed/variable costs, incorrect contribution margin
- Misconception tags for error patterns

## Non-Functional Requirements
- Follow existing code style and patterns
- 100% test coverage for new components
- No new dependencies
- Pass `npm run lint`, `npm test`, and `npm run build`

## Acceptance Criteria
- All three components are registered in `lib/activities/registry.ts`
- Each component emits valid `practice.v1` envelopes
- All tests pass
- No lint errors
- Build passes cleanly
