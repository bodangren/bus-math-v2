# Specification: CashFlowChallenge Legacy Cleanup

## Overview
Remove the legacy `onSubmitLegacy` callback from CashFlowChallenge and migrate all usage to the `activity.id ?? fallback` pattern. The dual-callback path is a maintenance trap.

## Functional Requirements
1. **Remove onSubmitLegacy**
   - Delete the `onSubmitLegacy` prop from CashFlowChallengeProps
   - Remove all code paths that call `onSubmitLegacy`

2. **Migrate to activity.id ?? fallback**
   - Replace hardcoded `activityId` 'cash-flow-challenge' with `activity.id ?? 'cash-flow-challenge'`

## Non-Functional Requirements
- All existing tests continue to pass
- No breaking changes to external API

## Acceptance Criteria
- [ ] `onSubmitLegacy` prop no longer exists in CashFlowChallengeProps
- [ ] All uses of `onSubmitLegacy` are removed
- [ ] Activity ID uses `activity.id ?? 'cash-flow-challenge'` pattern
- [ ] All tests pass
- [ ] Build is clean

## Out of Scope
- Changes to other components
- New features
