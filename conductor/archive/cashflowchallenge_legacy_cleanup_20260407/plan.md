# Plan: CashFlowChallenge Legacy Cleanup

## Phase 1: Analyze Current State
- [x] Read CashFlowChallenge.tsx to understand current implementation (already done)
- [x] Find all uses of onSubmitLegacy in the codebase (only in docs)
- [x] Find all uses of hardcoded activityId 'cash-flow-challenge' (already uses activity.id ?? fallback)

## Phase 2: Remove onSubmitLegacy
- [x] Delete onSubmitLegacy prop from CashFlowChallengeProps (already done in commit 75bba08)
- [x] Remove all code paths that call onSubmitLegacy (already done)
- [x] Update any consumers that use onSubmitLegacy (if any) (none found)

## Phase 3: Migrate activity.id
- [x] Replace hardcoded 'cash-flow-challenge' with activity.id ?? 'cash-flow-challenge' (already done)
- [x] Test the changes (tests pass)

## Phase 4: Verify
- [x] Run lint
- [x] Run tests
- [x] Run build
