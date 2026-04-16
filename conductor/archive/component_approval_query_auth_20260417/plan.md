# Implementation Plan — Component Approval Query Auth

## Phase 1: Add auth guards to component_approvals.ts public queries

### Tasks

- [x] Write tests for auth rejection on all 6 public queries
    - [x] Test `getComponentApproval` rejects unauthenticated, student, and teacher roles
    - [x] Test `getComponentVersionHash` rejects unauthenticated, student, and teacher roles
    - [x] Test `getReviewQueue` rejects unauthenticated, student, and teacher roles
    - [x] Test `getComponentReviews` rejects unauthenticated, student, and teacher roles
    - [x] Test `getUnresolvedReviews` rejects unauthenticated, student, and teacher roles
    - [x] Test `getAuditSummary` rejects unauthenticated, student, and teacher roles
- [x] Extract or create shared `requireAdmin` helper for Convex query/mutation contexts
- [x] Add `requireAdmin` call to `getComponentApproval`
- [x] Add `requireAdmin` call to `getComponentVersionHash`
- [x] Add `requireAdmin` call to `getReviewQueue`
- [x] Add `requireAdmin` call to `getComponentReviews`
- [x] Add `requireAdmin` call to `getUnresolvedReviews`
- [x] Add `requireAdmin` call to `getAuditSummary`
- [x] Run `npm run lint` and `npm test`
- [x] Run `npm run build`
- [x] Update `tech-debt.md` and `lessons-learned.md`
- [x] Commit phase checkpoint and archive track
