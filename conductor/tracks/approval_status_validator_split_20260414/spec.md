# ApprovalStatusValidator Split — Specification

## Overview

Split the `approvalStatusValidator` into two validators:
1. **Storage validator** (`approvalStatusValidator`) — includes all statuses including `stale` for storage in `componentApprovals` table
2. **Submission validator** (`submissionStatusValidator`) — excludes `stale` since it's a derived/computed status, not a submission input

## Problem Statement

The current `approvalStatusValidator` allows `stale` as a valid input to `submitComponentReview`, but `stale` is a **derived status** computed at query time in `getReviewQueue`:

```typescript
const effectiveStatus =
  approval.approvalStatus !== "unreviewed" && approval.approvalVersionHash !== currentHash
    ? "stale"
    : approval.approvalStatus;
```

`stale` should never be submitted as an input — it represents the gap between stored approval status and current component version.

## Scope

### Files to modify:
- `convex/component_approval_validators.ts` — split validators
- `convex/component_approvals.ts` — update `submitComponentReview` to use submission validator
- `__tests__/conductor/component-approval-phase5.test.ts` — add tests for the new validator behavior

### Files to verify (no changes needed):
- `convex/schema.ts` — uses validators for storage, should remain unchanged
- All other consumers use validators for storage/retrieval, not submission

## Acceptance Criteria

1. `submissionStatusValidator` is a union of `unreviewed`, `approved`, `changes_requested`, `rejected` — **without** `stale`
2. `approvalStatusValidator` remains unchanged (includes `stale` for storage compatibility)
3. `submitComponentReview` mutation uses `submissionStatusValidator` for its `status` argument
4. Submitting `stale` as a status to `submitComponentReview` throws a Convex validation error
5. Existing tests continue to pass
6. New tests verify that `stale` cannot be submitted as input

## Test Plan

1. Add test: `submitComponentReview with stale status throws validation error`
2. Verify existing tests still pass
3. Verify storage of `stale` still works (via computed effectiveStatus)