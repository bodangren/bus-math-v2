# Implementation Plan: Student Navigation and Dashboard Return Paths

## Phase 1: Navigation Contract Audit
- [ ] Inventory every current student and shared-authenticated dashboard/unit/lesson return path
- [ ] Confirm which student unit-level routes exist versus which links are currently dead or implied
- [ ] Define the canonical route helpers and breadcrumb contract for dashboard, unit, lesson, and completion states
- [ ] Add or update the first failing tests that describe the required dashboard-link and breadcrumb behavior

## Phase 2: Shared Chrome and Dashboard Destinations
- [ ] Implement role-aware dashboard links in the shared user menu and any shared authenticated chrome
- [ ] Replace duplicated inline dashboard destinations with canonical helpers where appropriate
- [ ] Verify student, teacher, and admin role behavior through targeted tests
- [ ] Run `npm run lint` and the targeted test suite for shared navigation changes

## Phase 3: Student Lesson and Unit Wayfinding
- [ ] Implement the canonical student breadcrumb and return-path flow across lesson, completion, empty, and error states
- [ ] Add the required student unit surface or redirect strategy so unit links are real and intentional
- [ ] Fix any dead-end lesson links uncovered during the implementation
- [ ] Add regression coverage for the primary student wayfinding states

## Phase 4: Verification and Documentation
- [ ] Run final relevant lint, targeted tests, broader `npm test`, and build gates for the touched navigation surfaces
- [ ] Update active Conductor docs if the canonical student navigation contract changes
- [ ] Record any follow-on navigation debt that is intentionally deferred
- [ ] Prepare the track for archive with a concise verification summary
