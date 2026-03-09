# Specification: Dashboard Helper Consolidation & Dev Stack Closeout

## Overview

The current codebase has three closely related Convex dashboard/curriculum queries that repeat the same map-entry and nullable-description normalization logic. An unattended prior run already started extracting that logic, but the work was left untracked and uncommitted. Separately, local development still requires manually starting Convex and Vinext in separate terminals, which slows down daily classroom-content work and makes README setup drift more likely.

This cleanup/refactor track finishes that partial refactor, adds a single-command local development stack helper, updates onboarding/docs, and closes the stale `vinext_convex_migration_20260225` track so the branch returns to one active Conductor track.

This is the first new cleanup/refactor track for March 9, 2026 and includes a focused security review of public/test API surfaces. No serious or critical new vulnerability will be introduced; any such issue discovered during implementation must be fixed within this track.

## Functional Requirements

1. Add a shared Convex helper module for dashboard/curriculum query assembly that:
   - normalizes nullable string values consistently
   - returns existing map entries without repeated boilerplate
   - is reused by the public curriculum, student dashboard, and teacher dashboard query paths where applicable

2. Refactor the affected Convex query modules to use the shared helper without changing their external data shape.

3. Add a supported local development workflow command that starts Convex and the Vinext app together using a non-interactive script committed to the repository.

4. Update README local-development documentation so developers know when to use `npm run dev` versus `npm run dev:stack`.

5. Clean up Conductor state by:
   - creating this track with full spec/plan artifacts
   - documenting the cleanup/security review result
   - removing the stale migration track from the active queue and archiving it as superseded by completed follow-on tracks

## Non-Functional Requirements

1. Follow TDD for the new helper/script coverage by adding tests first and confirming focused failures before relying on the implementation.
2. Do not add or upgrade dependencies.
3. Keep all shell commands non-interactive and unattended-safe.
4. Preserve existing dashboard and curriculum response contracts.
5. Keep the local dev helper implementation portable across normal Unix-like developer environments already supported by the repo.

## Acceptance Criteria

1. Dedicated tests cover:
   - nullable-string normalization helper behavior
   - map-entry reuse helper behavior
   - `package.json` exposing the combined `dev:stack` script

2. The refactored Convex query modules continue to pass the full automated test suite.

3. README documents the new `dev:stack` workflow and clarifies local setup.

4. The stale `vinext_convex_migration_20260225` track is no longer left as an active execution item.

5. `CI=true npm run lint`, `CI=true npm test`, and `CI=true npm run build` all succeed.

## Out of Scope

1. Changing dashboard UX or curriculum content behavior.
2. Reopening the broader Vinext/Convex migration scope.
3. Deploying infrastructure or changing production environment configuration.
