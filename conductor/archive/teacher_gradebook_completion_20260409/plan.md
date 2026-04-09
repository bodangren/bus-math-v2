# Implementation Plan: Teacher Gradebook Completion

## Phase 1: Gradebook Contract Definition
- [x] Audit  the current course and unit gradebook data/view contracts and identify what is missing for independent practice, assessment, and evidence drill-down
- [x] Define  the canonical gradebook semantics for lesson, independent-practice, assessment, and unit-test visibility
- [x] Add or update failing tests around the gradebook view-model and rendering contract
- [x] Record any data-shape gaps that must be closed before UI completion

## Phase 2: Unit Gradebook Expansion
- [x] Expand  the unit-level gradebook so teachers can inspect detailed progress for all students across the unit
- [x] Add or refine  the UI affordances that distinguish lesson progress, independent practice, assessment, and unit-test states
- [x] Ensure  the unit page remains readable on realistic class rosters and viewport
- [x] Run `npm run lint` and  the targeted gradebook/component tests

## Phase 3: Submission and Evidence Drill-Down
- [x] Connect gradebook cells or related affordances to the appropriate submission/progress detail surfaces
- [x] Ensure percentages or status indicators are explainable through drill-down evidence rather than opaque aggregates
- [x] Add regression coverage for the primary teacher gradebook drill-down flows
- [x] Run the relevant broader tests for shared teacher reporting helpers

## Phase 4: Verification and Documentation
- [x] Run final relevant lint, targeted tests, broader `npm test`, and build gates for the gradebook changes
- [x] Update active Conductor docs if the teacher gradebook contract changes
- [x] Record any intentionally deferred gradebook/product debt
- [x] Prepare the track for archive with verification evidence
