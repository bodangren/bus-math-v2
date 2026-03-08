# Implementation Plan: Convex Authorization Hardening & Server Boundary Cleanup

## Phase 1: Review Capture, Boundary Tests, and Track Activation

- [x] Task 1.1: Mark this track active in Conductor and capture the critical review findings in the plan context
- [x] Task 1.2: Write failing tests for the hardened Convex authorization boundary
  - [x] Add source-level coverage that the reviewed sensitive Convex functions are internal-only
  - [x] Update server page/route tests to expect internal helper usage for identity-sensitive Convex access
- [x] Task 1.3: Run the focused authorization-boundary tests and confirm they fail
- [x] Task: Conductor - User Manual Verification 'Phase 1: Review Capture, Boundary Tests, and Track Activation' (Automated verification only; unattended run)

## Phase 2: Internalize Sensitive Convex Functions

- [x] Task 2.1: Convert reviewed sensitive functions in `convex/api.ts`, `convex/activities.ts`, `convex/student.ts`, and `convex/teacher.ts` to internal-only server functions
  - [x] Preserve existing query/mutation behavior for server callers
  - [x] Keep public content-access functions unchanged unless they are identity-sensitive
- [x] Task 2.2: Run focused tests for the Convex authorization surface and confirm they pass
- [x] Task: Conductor - User Manual Verification 'Phase 2: Internalize Sensitive Convex Functions' (Automated verification only; unattended run)

## Phase 3: Refactor Server Call Sites to Internal Helpers

- [x] Task 3.1: Update server pages, auth helpers, and API routes to use `fetchInternalQuery` / `fetchInternalMutation` for sensitive Convex access
  - [x] Remove direct server-page `ConvexHttpClient` usage for teacher and student dashboards
  - [x] Keep client-only Convex provider behavior unchanged
- [x] Task 3.2: Update affected tests for the new internal helper call path
- [x] Task 3.3: Run focused route/page tests and confirm they pass
- [x] Task: Conductor - User Manual Verification 'Phase 3: Refactor Server Call Sites to Internal Helpers' (Automated verification only; unattended run)

## Phase 4: Docs, Conductor Cleanup, and Final Verification

- [x] Task 4.1: Refresh README and Conductor state to reflect the hardened server boundary and remove the stale active `component_reorganization_20260220` artifact
- [x] Task 4.2: Run non-interactive verification commands for lint, tests, and production build
- [x] Task 4.3: Update track metadata and registry state, push the branch, and archive the completed track
