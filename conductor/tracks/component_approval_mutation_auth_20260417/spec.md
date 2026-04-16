# Specification: Component Approval Mutation Auth

## Overview

The `submitComponentReview` and `resolveReview` mutations in `convex/component_approvals.ts` currently use inline authentication logic that rejects `student` and `teacher` roles but does not explicitly require `admin`. This is more permissive than the public queries, which were already hardened to require `admin` via `requireAdmin()`. This track closes that gap.

## Functional Requirements

1. Extract `submitComponentReview` inline handler into a named exported async function (`submitComponentReviewHandler`).
2. Extract `resolveReview` inline handler into a named exported async function (`resolveReviewHandler`).
3. Replace inline auth checks in both handlers with the existing `requireAdmin(ctx)` helper.
4. Wire the extracted handlers back into the `mutation({ ... })` wrappers.
5. Add Vitest unit tests covering auth rejection for both mutations:
   - Unauthenticated caller → "Unauthorized: admin role required"
   - Student caller → "Unauthorized: admin role required"
   - Teacher caller → "Unauthorized: admin role required"
   - Admin caller → succeeds

## Non-Functional Requirements

- Preserve all existing business logic (hash verification, improvement notes validation, approval upsert, etc.).
- Tests should invoke the extracted handlers directly, bypassing the Convex `mutation()` wrapper.
- No dependency changes.

## Acceptance Criteria

- `npm run lint` passes with 0 errors and 0 warnings.
- All existing tests continue to pass.
- New auth rejection tests pass.
- `npm run build` passes cleanly.
- `tech-debt.md` is updated to mark the two deferred items as closed.

## Out of Scope

- Changing query auth (already complete in previous track).
- UI or harness changes.
- Altering the component approval schema or validators.
