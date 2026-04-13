# Plan: Component Approval Security Hardening

## Phase 1: Security Bug Fixes

### Tasks

- [x] **1.1** Read and understand the existing `convex/component_approvals.ts` implementation, focusing on `getReviewQueue` and `submitComponentReview`

- [x] **1.2** Issue 1 (getReviewQueue query filter) - Already fixed in code
  - Confirmed: code uses `.filter()` for secondary predicate, not chained `.withIndex()`
  - Tech-debt entry was stale

- [x] **1.3** Fix `submitComponentReview` hash verification
  - Added server-side hash recomputation before accepting submission
  - Added rejection if client hash doesn't match server-computed hash
  - Added error: "Component version hash mismatch"

- [x] **1.4** Run verification gates
  - `npm run lint`: 0 errors, 2 warnings (pre-existing)
  - `npm test`: 1775/1775 passed
  - `npm run build`: passed

- [x] **1.5** Update `tech-debt.md` to close fixed items

- [ ] **1.6** Finalize track
  - Update metadata.json status to completed
  - Commit changes with note
  - Push to remote