# Component Approval Query Auth

## Spec

### Context
`component_approvals.ts` exposes several public Convex queries (`getComponentApproval`, `getComponentVersionHash`, `getReviewQueue`, `getComponentReviews`, `getUnresolvedReviews`, `getAuditSummary`) without any authentication checks. While these power a dev-only review harness, they are still callable by any authenticated Convex client. Pass 80 deferred this as acceptable for dev-only use, but current_directive.md lists it as a next priority for deferred code quality.

### Objective
Add authentication guards to all public queries in `convex/component_approvals.ts` so that only admin/developer roles can read approval state, review queues, and audit summaries.

### Scope
- Create or reuse an admin-auth helper for Convex query/mutation contexts
- Add auth checks to `getComponentApproval`
- Add auth checks to `getComponentVersionHash`
- Add auth checks to `getReviewQueue`
- Add auth checks to `getComponentReviews`
- Add auth checks to `getUnresolvedReviews`
- Add auth checks to `getAuditSummary`
- Leave `submitComponentReview` and `resolveReview` auth unchanged (already guarded)
- Write tests verifying rejection for unauthenticated, student, and teacher roles

### Exit Gates
- All 6 public queries reject non-admin callers
- `npm run lint` passes with 0 errors, 0 warnings
- `npm test` passes (all existing + new tests)
- `npm run build` passes cleanly
- Tech-debt.md updated to close this deferred item
