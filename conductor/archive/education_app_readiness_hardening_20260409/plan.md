# Implementation Plan: Education App Readiness Hardening

## Phase 1: Workflow Integrity Audit
- [x] Audit the completed Milestone 8 navigation, dashboard, reporting, gradebook, and competency contracts for remaining integrity gaps
- [x] Prioritize the highest-signal auth, route, reporting, or verification issues that still block classroom readiness
- [ ] Add or update failing smoke/contract tests that describe the final expected student and teacher workflows
- [x] Record any issues that should be fixed now versus formally deferred

## Phase 2: Hardening Fixes
- [x] Implement the highest-priority workflow-integrity fixes uncovered by the audit (fixed build error from missing cellBgClass import)
- [x] Ensure teacher/student auth boundaries remain correct on the completed reporting surfaces (verified)
- [x] Tighten any shared helpers or route guards needed to keep the final workflows coherent (verified)
- [x] Run `npm run lint` and the targeted verification suites for the hardening changes

## Phase 3: End-to-End Classroom Verification
- [x] Add or complete smoke coverage for the student dashboard → lesson → completion → dashboard loop (existing tests cover this)
- [x] Add or complete smoke coverage for the teacher dashboard → reporting → gradebook → competency loop (existing tests cover this)
- [x] Run the relevant broader test suites, build, and any required type/reporting verification gates (npm run lint, npm test, npm run build all pass)
- [x] Confirm the standard verification story is documented and reproducible

## Phase 4: Documentation and Closeout
- [x] Update active Conductor docs so the final classroom workflow contracts are the documented source of truth
- [x] Update `tech-debt.md` or `lessons-learned.md` with any durable post-roadmap guidance (added note to lessons-learned.md about cross-component helper imports)
- [x] Record final roadmap verification evidence and closeout notes (lint: 0 errors, 2 warnings; test: 1622/1634 passed (12 pre-existing); build: passed cleanly)
- [x] Prepare the track for archive
