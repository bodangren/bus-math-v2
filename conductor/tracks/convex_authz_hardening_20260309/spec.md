# Specification: Convex Authorization Hardening & Server Boundary Cleanup

## Overview

The March 9, 2026 review uncovered critical authorization gaps in SubLink's Convex layer: multiple sensitive queries and mutations accept caller-supplied profile IDs without Convex-side identity checks, and several server pages still call those public functions directly through `ConvexHttpClient`. This cleanup/refactor track hardens those boundaries by moving identity-sensitive reads and writes behind internal server-only Convex functions, updating server callers to use the internal helper path, cleaning the clearly stale duplicate Conductor track artifact left active after archival, and refreshing tests and README guidance to reflect the hardened architecture.

This track serves as the first cleanup/refactor track for March 9, 2026 by addressing a critical security issue found during review, reducing duplicated server-access patterns, and reconciling stale Conductor state from a previous incomplete run.

## Functional Requirements

1. Harden sensitive Convex functions in the student, teacher, activity, and phase-progress domains so identity-sensitive reads and writes are not exposed as public caller-controlled APIs.
   - Profile lookups that expose role or organization data must be internal-only when used for server authorization.
   - Student progress, spreadsheet draft/response, submission, and competency mutations must be internal-only when they depend on caller identity supplied by the server.
   - Teacher dashboard and submission-detail functions that expose roster or student work data must be internal-only.

2. Update server routes and server-rendered pages that currently call those functions so they use the internal Convex helper path instead of public `fetchQuery` / `fetchMutation` or ad hoc `ConvexHttpClient` instances.

3. Preserve current product behavior for authenticated users:
   - student dashboard and lesson progress still load correctly
   - phase completion still honors existing access checks and idempotency behavior
   - spreadsheet draft/save/replay flows still work for authorized users
   - assessment scoring/submission still works
   - teacher dashboard and submission-detail flows still work for authorized teachers/admins

4. Remove the obviously stale duplicate Conductor artifact for `component_reorganization_20260220` from the active tracks directory and registry so the live queue matches archival reality.

5. Refresh README documentation for the hardened server/Convex boundary where needed.

## Non-Functional Requirements

1. Follow TDD: add or update tests before implementation changes and confirm they fail for the old boundary.
2. Do not add dependencies or change the core tech stack.
3. Keep all shell usage non-interactive and unattended-safe.
4. Avoid exposing secrets, internal function references, or admin auth to client bundles.
5. Limit behavior changes outside the authorization hardening and stale-track cleanup scope.

## Acceptance Criteria

1. Sensitive Convex functions identified by review are implemented as `internalQuery` / `internalMutation` rather than public `query` / `mutation`.
2. Server routes/pages that depend on those functions use `fetchInternalQuery` / `fetchInternalMutation`, not direct `ConvexHttpClient` calls or public helper calls.
3. Existing authenticated dashboard, lesson, spreadsheet, assessment, and teacher flows continue to pass automated tests.
4. New automated tests guard the internal-only boundary and the updated server call pattern.
5. `npm run lint`, `CI=true npm test`, and `npm run build` succeed.
6. `README.md` documents the hardened server-only Convex access pattern.
7. The stale `component_reorganization_20260220` active artifact is removed from the live Conductor queue.

## Out of Scope

1. Rewriting the public curriculum-content queries that are not identity-sensitive.
2. Rebuilding the auth product model or adding end-user permission-management UI.
3. Broad refactors unrelated to the reviewed Convex authorization surface.
