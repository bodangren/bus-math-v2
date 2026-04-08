# Specification: Repo Cleanup and Surface Hygiene

## Overview

The repository has accumulated stale files, lingering completed Conductor tracks in the active surface, and legacy code paths that make page-level product audits harder to execute safely. This track establishes a clean baseline before UI evaluation proceeds.

## Functional Requirements

1. Identify files and code surfaces inside `bus-math-v2/` that are unused by the active product runtime, current tests, or active planning surface.
2. Remove confirmed-unused files and clean up any imports, exports, registry entries, docs references, or test references affected by those removals.
3. Reconcile Conductor active-surface hygiene so only genuinely active implementation work remains in `conductor/tracks/`, and the tracks registry accurately reflects the active queue.
4. Preserve all currently reachable product pages, curriculum routes, API handlers, and required test utilities.
5. Establish the follow-on UI audit queue for:
   - non-unit pages
   - Unit 1
   - Unit 2
   - Unit 3
   - Unit 4
   - Unit 5
   - Unit 6
   - Unit 7
   - Unit 8

## Non-Functional Requirements

1. Cleanup decisions must be evidence-based; no file may be removed on naming assumptions alone.
2. The repository must pass `npm run lint`, targeted tests for affected areas, and `npm run build` before the track closes.
3. The cleanup must not introduce dependency changes.
4. Documentation changes must stay aligned with the actual runtime and queue state.

## Acceptance Criteria

1. Confirmed-unused files and stale surfaces are removed without breaking the application build.
2. `conductor/tracks.md` reflects one active cleanup track plus the queued UI audit tracks.
3. Completed/stale Conductor track artifacts no longer leave the active planning surface in an ambiguous state.
4. Verification confirms the cleaned repository still lints, builds, and passes relevant tests.

## Out of Scope

1. Visual or layout fixes on product pages.
2. New feature work unrelated to cleanup and queue hygiene.
3. Dependency upgrades or package additions.
