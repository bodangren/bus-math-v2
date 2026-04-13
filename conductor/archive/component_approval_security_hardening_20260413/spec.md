# Track: Component Approval Security Hardening

## Overview

Fix two HIGH severity security/correctness issues in the component approval system identified during Pass 42 code review:

1. `getReviewQueue` silently drops `componentType` when `approvalStatus` is also passed — the second `.withIndex()` call reassigns the query base, making the first filter ineffective.

2. `submitComponentReview` accepts client-supplied `componentVersionHash` without server-side recomputation — reviewers could approve a hash that never existed.

## Functional Requirements

### Issue 1: getReviewQueue Query Filter Bug

- **File**: `convex/component_approvals.ts`
- **Line**: ~37
- **Problem**: When both `componentType` and `approvalStatus` are passed, the second `.withIndex()` call reassigns the query base, dropping the first filter.
- **Fix**: Use `.filter()` for the secondary predicate, or restructure to use a single index with combined conditions.
- **Tests**: Add unit tests that verify query returns correct results when filtering by both `componentType` AND `approvalStatus` simultaneously.

### Issue 2: Untrusted Hash Submission

- **File**: `convex/component_approvals.ts`
- **Problem**: `submitComponentReview` accepts `componentVersionHash` from client without server-side verification. A malicious reviewer could approve a hash that never existed.
- **Fix**: Server-side recompute the hash from the component's current state and reject if client-supplied hash doesn't match.
- **Tests**: Add security tests that verify submission fails when hash is tampered with.

## Acceptance Criteria

1. `getReviewQueue` returns correct filtered results when filtering by both `componentType` and `approvalStatus`
2. `submitComponentReview` rejects submissions where the hash doesn't match server-computed hash
3. All existing tests continue to pass
4. New security tests cover both fixes
5. `npm run lint` passes with 0 errors
6. `npm test` passes all tests
7. `npm run build` passes

## Out of Scope

- Other component approval features or UX improvements
- LLM audit query changes
- Stale approval detection changes