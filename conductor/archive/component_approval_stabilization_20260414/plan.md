# Component Approval Stabilization — Implementation Plan

## Phase 1: Manifest Script Hardening

### Tasks

- [ ] **1.1** Modify `scripts/generate-component-manifest.ts` to throw error instead of warn when activity files are missing
- [ ] **1.2** Modify `scripts/generate-component-manifest.ts` to throw error instead of warn when family files are missing
- [ ] **1.3** Add manifest regeneration to dev script in `package.json`
- [ ] **1.4** Run `npm run build` to verify manifest generation works
- [ ] **1.5** Verify lint and tests still pass

## Phase 2: Test Corrections

### Tasks

- [ ] **2.1** Remove "marks rejected as stale when hash differs" test (lines 111-126) from phase5 test file — examples are exempt
- [ ] **2.2** Remove "detects stale when example content changes" test (lines 481-499) — examples are exempt
- [ ] **2.3** Verify remaining tests still pass

## Phase 3: New Tests

### Tasks

- [ ] **3.1** Add test for hash-mismatch rejection in submitComponentReview
- [ ] **3.2** Add auth rejection tests for submitComponentReview (student/teacher roles rejected)
- [ ] **3.3** Add auth rejection tests for resolveReview (student/teacher roles rejected)
- [ ] **3.4** Verify all new tests pass

## Phase 4: Dev Queue Fix

### Tasks

- [ ] **4.1** Update getReviewQueue to compute currentVersionHash for all components (not just those with approvals) when includeStale is true
- [ ] **4.2** Verify examples still return null for currentVersionHash
- [ ] **4.3** Verify lint and tests pass

## Phase 5: Example Harness UI Polish

### Tasks

- [ ] **5.1** Replace "Mark Approved" button with disabled "Not Applicable" state in example harness
- [ ] **5.2** Verify example harness still builds and renders correctly
- [ ] **5.3** Verify lint and tests pass

## Phase 6: Verification and Documentation

### Tasks

- [ ] **6.1** Run full lint (`npm run lint`)
- [ ] **6.2** Run full test suite (`npm test`)
- [ ] **6.3** Run build (`npm run build`)
- [ ] **6.4** Update tech-debt.md with closed items
- [ ] **6.5** Update lessons-learned.md if new patterns discovered
- [ ] **6.6** Commit with note and push