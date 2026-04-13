# Plan: Component Approval Security Hardening

## Phase 1: Security Bug Fixes

### Tasks

- [ ] **1.1** Read and understand the existing `convex/component_approvals.ts` implementation, focusing on `getReviewQueue` and `submitComponentReview`

- [ ] **1.2** Write failing tests for `getReviewQueue` query filter bug
  - Test that filtering by both `componentType` AND `approvalStatus` returns correct results
  - Test should fail against current implementation (proves bug exists)

- [ ] **1.3** Write failing tests for hash verification gap
  - Test that submitting with tampered hash is rejected
  - Test should fail against current implementation (proves vulnerability exists)

- [ ] **1.4** Fix `getReviewQueue` query filter bug
  - Restructure query to use `.filter()` for secondary predicate, or pick one index per call path
  - Verify tests pass

- [ ] **1.5** Fix `submitComponentReview` hash verification
  - Add server-side hash recomputation before accepting submission
  - Reject if client hash doesn't match server-computed hash
  - Verify tests pass

- [ ] **1.6** Run verification gates
  - `npm run lint`: 0 errors
  - `npm test`: all pass
  - `npm run build`: passes

- [ ] **1.7** Update `tech-debt.md` to close fixed items

- [ ] **1.8** Finalize track
  - Update metadata.json status to completed
  - Commit changes with note
  - Push to remote