# Implementation Plan: Student Navigation and Dashboard Return Paths

## Phase 1: Navigation Contract Audit
- [x] Inventory every current student and shared-authenticated dashboard/unit/lesson return path
- [x] Confirm which student unit-level routes exist versus which links are currently dead or implied
- [x] Define the canonical route helpers and breadcrumb contract for dashboard, unit, lesson, and completion states
- [x] Add or update the first failing tests that describe the required dashboard-link and breadcrumb behavior

## Phase 2: Shared Chrome and Dashboard Destinations
- [x] Implement role-aware dashboard links in the shared user menu and any shared authenticated chrome
- [x] Replace duplicated inline dashboard destinations with canonical helpers where appropriate
- [x] Verify student, teacher, and admin role behavior through targeted tests
- [x] Run `npm run lint` and the targeted test suite for shared navigation changes

## Phase 3: Student Lesson and Unit Wayfinding
- [x] Implement the canonical student breadcrumb and return-path flow across lesson, completion, empty, and error states
- [x] Add the required student unit surface or redirect strategy so unit links are real and intentional
- [x] Fix any dead-end lesson links uncovered during the implementation
- [x] Add regression coverage for the primary student wayfinding states

## Phase 4: Verification and Documentation
- [ ] Run final relevant lint, targeted tests, broader `npm test`, and build gates for the touched navigation surfaces
- [ ] Update active Conductor docs if the canonical student navigation contract changes
- [ ] Record any follow-on navigation debt that is intentionally deferred
- [ ] Prepare the track for archive with a concise verification summary
