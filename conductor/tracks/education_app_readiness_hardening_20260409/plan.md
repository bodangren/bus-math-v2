# Implementation Plan: Education App Readiness Hardening

## Phase 1: Workflow Integrity Audit
- [~] Audit the completed Milestone 8 navigation, dashboard, reporting, gradebook, and competency contracts for remaining integrity gaps
- [ ] Prioritize the highest-signal auth, route, reporting, or verification issues that still block classroom readiness
- [ ] Add or update failing smoke/contract tests that describe the final expected student and teacher workflows
- [ ] Record any issues that should be fixed now versus formally deferred

## Phase 2: Hardening Fixes
- [ ] Implement the highest-priority workflow-integrity fixes uncovered by the audit
- [ ] Ensure teacher/student auth boundaries remain correct on the completed reporting surfaces
- [ ] Tighten any shared helpers or route guards needed to keep the final workflows coherent
- [ ] Run `npm run lint` and the targeted verification suites for the hardening changes

## Phase 3: End-to-End Classroom Verification
- [ ] Add or complete smoke coverage for the student dashboard → lesson → completion → dashboard loop
- [ ] Add or complete smoke coverage for the teacher dashboard → reporting → gradebook → competency loop
- [ ] Run the relevant broader test suites, build, and any required type/reporting verification gates
- [ ] Confirm the standard verification story is documented and reproducible

## Phase 4: Documentation and Closeout
- [ ] Update active Conductor docs so the final classroom workflow contracts are the documented source of truth
- [ ] Update `tech-debt.md` or `lessons-learned.md` with any durable post-roadmap guidance
- [ ] Record final roadmap verification evidence and closeout notes
- [ ] Prepare the track for archive
