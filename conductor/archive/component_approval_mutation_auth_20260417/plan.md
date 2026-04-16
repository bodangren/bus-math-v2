# Implementation Plan: Component Approval Mutation Auth

## Phase 1 — Extract and Harden submitComponentReview

- [x] Task: Extract `submitComponentReviewHandler` from inline mutation wrapper
    - [x] Copy the existing handler body into `export async function submitComponentReviewHandler(ctx: MutationCtx, args: ...)`
    - [x] Replace the inline identity/profile/role checks with `await requireAdmin(ctx)`
    - [x] Update the `submitComponentReview` mutation to reference `handler: submitComponentReviewHandler`
    - [x] Run `npm run lint`

## Phase 2 — Extract and Harden resolveReview

- [x] Task: Extract `resolveReviewHandler` from inline mutation wrapper
    - [x] Copy the existing handler body into `export async function resolveReviewHandler(ctx: MutationCtx, args: { reviewId: Id<"componentReviews"> })`
    - [x] Replace the inline identity/profile/role checks with `await requireAdmin(ctx)`
    - [x] Update the `resolveReview` mutation to reference `handler: resolveReviewHandler`
    - [x] Run `npm run lint`

## Phase 3 — Add Auth Rejection Tests

- [x] Task: Write tests for `submitComponentReviewHandler` auth
    - [x] Add "throws when unauthenticated" test
    - [x] Add "throws when student" test
    - [x] Add "throws when teacher" test
    - [x] Add "succeeds when admin" test (mock dependencies to avoid full integration)
- [x] Task: Write tests for `resolveReviewHandler` auth
    - [x] Add "throws when unauthenticated" test
    - [x] Add "throws when student" test
    - [x] Add "throws when teacher" test
    - [x] Add "succeeds when admin" test (mock dependencies)
- [x] Task: Run targeted and full test suites
    - [x] Run related tests: `npm test -- component_approvals`
    - [x] Run full suite: `npm test`

## Phase 4 — Verify, Update Tech Debt, and Archive

- [x] Task: Run build verification
    - [x] `npm run build`
- [x] Task: Update `conductor/tech-debt.md`
    - [x] Mark the two deferred component_approvals mutation auth items as Closed
- [x] Task: Commit phase checkpoint with note and push
- [x] Task: Archive track to `conductor/archive/`
    - [x] Move track directory
    - [x] Update `conductor/tracks.md` registry entry to archived
