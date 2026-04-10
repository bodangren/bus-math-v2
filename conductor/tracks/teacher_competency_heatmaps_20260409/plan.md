# Implementation Plan: Teacher Competency Heatmaps and Mastery Views

## Phase 1: Competency Reporting Contract
- [x] Audit the existing competency schema, teacher helpers, and any current reporting seams that already expose mastery data
- [x] Define the canonical course/unit/student competency reporting contract and drill-down expectations
- [x] Add or update failing tests for the competency view-model assembly and primary route states
- [x] Record any data or labeling inconsistencies that must be resolved before UI work

## Phase 2: Heatmap Rendering
- [x] Implement the primary teacher competency heatmap surface and shared legend/mastery labeling
- [x] Ensure the heatmap remains readable with realistic student and standard counts
- [x] Link the heatmap into the teacher reporting hierarchy established by the previous track
- [x] Run `npm run lint` and targeted competency/reporting tests

## Phase 3: Drill-Down and Context
- [x] Add unit-scoped or student-scoped drill-down behavior from the competency surface
- [x] Ensure competency views link back to the relevant gradebook/reporting context
- [x] Add regression coverage for the primary heatmap drill-down flows
- [x] Run the relevant broader tests for shared reporting helpers

## Phase 4: Verification and Documentation
- [x] Run final relevant lint, targeted tests, broader `npm test`, and build gates for the competency-reporting changes
- [x] Update active Conductor docs if the competency reporting contract changes
- [x] Record any intentionally deferred competency UX or aggregation work
- [x] Prepare the track for archive with verification evidence
