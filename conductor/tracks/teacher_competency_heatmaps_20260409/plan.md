# Implementation Plan: Teacher Competency Heatmaps and Mastery Views

## Phase 1: Competency Reporting Contract
- [ ] Audit the existing competency schema, teacher helpers, and any current reporting seams that already expose mastery data
- [ ] Define the canonical course/unit/student competency reporting contract and drill-down expectations
- [ ] Add or update failing tests for the competency view-model assembly and primary route states
- [ ] Record any data or labeling inconsistencies that must be resolved before UI work

## Phase 2: Heatmap Rendering
- [ ] Implement the primary teacher competency heatmap surface and shared legend/mastery labeling
- [ ] Ensure the heatmap remains readable with realistic student and standard counts
- [ ] Link the heatmap into the teacher reporting hierarchy established by the previous track
- [ ] Run `npm run lint` and targeted competency/reporting tests

## Phase 3: Drill-Down and Context
- [ ] Add unit-scoped or student-scoped drill-down behavior from the competency surface
- [ ] Ensure competency views link back to the relevant gradebook/reporting context
- [ ] Add regression coverage for the primary heatmap drill-down flows
- [ ] Run the relevant broader tests for shared reporting helpers

## Phase 4: Verification and Documentation
- [ ] Run final relevant lint, targeted tests, broader `npm test`, and build gates for the competency-reporting changes
- [ ] Update active Conductor docs if the competency reporting contract changes
- [ ] Record any intentionally deferred competency UX or aggregation work
- [ ] Prepare the track for archive with verification evidence
