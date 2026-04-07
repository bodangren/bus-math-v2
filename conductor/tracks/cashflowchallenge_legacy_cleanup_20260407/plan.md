# Plan: CashFlowChallenge Legacy Cleanup

## Phase 1: Analyze Current State
- [ ] Read CashFlowChallenge.tsx to understand current implementation
- [ ] Find all uses of onSubmitLegacy in the codebase
- [ ] Find all uses of hardcoded activityId 'cash-flow-challenge'

## Phase 2: Remove onSubmitLegacy
- [ ] Delete onSubmitLegacy prop from CashFlowChallengeProps
- [ ] Remove all code paths that call onSubmitLegacy
- [ ] Update any consumers that use onSubmitLegacy (if any)

## Phase 3: Migrate activity.id
- [ ] Replace hardcoded 'cash-flow-challenge' with activity.id ?? 'cash-flow-challenge'
- [ ] Test the changes

## Phase 4: Verify
- [ ] Run lint
- [ ] Run tests
- [ ] Run build
