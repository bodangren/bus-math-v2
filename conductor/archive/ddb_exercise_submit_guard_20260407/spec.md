# Specification: DDBComparisonMastery submittedRef Guard

## Overview

Track 11 completed double-submit guard standardization for 5 simulation components using the useRef pattern. DDBComparisonMastery (an exercise component) still lacks this protection, relying only on `disabled={!userAnswer}` on the submit button. This track closes the gap.

## Functional Requirements

1. **DDBComparisonMastery submittedRef guard**: Add `submittedRef = useRef(false)` to prevent rapid double-click bypass of the `submitted` state guard.
2. **Source-level test**: Verify the submittedRef pattern exists in the component source.

## Non-Functional Requirements

- Follow the exact pattern established in Track 11 (CashFlowChallenge, BusinessStressTest, BudgetBalancer, LemonadeStand, NotebookOrganizer).
- `submittedRef.current` must be set to `true` before `setSubmitted(true)`.
- `submittedRef.current` must be reset to `false` in `handleNewProblem`.
- No behavioral change to the submission envelope or grading logic.

## Acceptance Criteria

- [ ] DDBComparisonMastery has `submittedRef = useRef(false)`
- [ ] DDBComparisonMastery `handleSubmit` checks `submittedRef.current` before proceeding
- [ ] DDBComparisonMastery `handleNewProblem` resets `submittedRef.current = false`
- [ ] Source-level test verifies submittedRef guard pattern
- [ ] All existing tests pass
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## Out of Scope

- Other exercise components (StraightLineMastery, CapitalizationExpenseMastery)
- BusinessStressTest visual disabled state (already has submittedRef; buttons are hidden via conditional rendering)
