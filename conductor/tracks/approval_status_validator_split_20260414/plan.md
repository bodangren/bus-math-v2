# ApprovalStatusValidator Split — Implementation Plan

## Phase 1: Validator Split

### Tasks
- [ ] 1.1 Create `submissionStatusValidator` in `convex/component_approval_validators.ts` (same as `approvalStatusValidator` but without `stale`)
- [ ] 1.2 Export `submissionStatusValidator` from `convex/component_approval_validators.ts`

**Phase 1 Exit Gate:** Validator exports correctly, `stale` is not in `submissionStatusValidator`

---

## Phase 2: Update submitComponentReview

### Tasks
- [ ] 2.1 Import `submissionStatusValidator` in `convex/component_approvals.ts`
- [ ] 2.2 Change `submitComponentReview` `status` argument from `approvalStatusValidator` to `submissionStatusValidator`

**Phase 2 Exit Gate:** `submitComponentReview` rejects `stale` at validation layer

---

## Phase 3: Tests

### Tasks
- [ ] 3.1 Add test: `submitComponentReview with stale status throws validation error`
- [ ] 3.2 Run full test suite to verify no regressions

**Phase 3 Exit Gate:** All tests pass including new validation test

---

## Phase 4: Verification

### Tasks
- [ ] 4.1 Run `npm run lint`
- [ ] 4.2 Run `npm test`
- [ ] 4.3 Run `npm run build`
- [ ] 4.4 Update tech-debt.md to close the item
- [ ] 4.5 Archive track

**Phase 4 Exit Gate:** All gates green, track archived