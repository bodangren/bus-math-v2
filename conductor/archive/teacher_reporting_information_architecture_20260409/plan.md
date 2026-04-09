# Implementation Plan: Teacher Reporting Information Architecture

## Phase 1: Reporting IA Definition
- [x] Audit the current teacher dashboard, course gradebook, unit gradebook, lesson report, and student detail entry points
- [x] Define the canonical dashboard → course → unit → lesson → student reporting hierarchy
- [x] Identify the missing reporting destinations and the minimum navigation contract needed before deeper reporting work
- [x] Add or update failing tests for teacher dashboard reporting entry points and route-level orientation

## Phase 2: Dashboard Entry Points
- [x] Add explicit reporting entry points to the teacher dashboard for the course gradebook and related reporting destinations
- [x] Ensure that dashboard makes reporting discoverable without requiring teachers to infer clickable table cells
- [x] Preserve existing teacher workflow actions (imports, CSV, student actions) while improving information architecture
- [x] Run `npm run lint` and targeted teacher-dashboard tests

## Phase 3: Shared Reporting Wayfinding
- [x] Implement shared breadcrumbs and back-link behavior across course, unit, lesson, and student reporting pages
- [x] Normalize route titles, labels, and page descriptions so the reporting hierarchy is legible
- [x] Add regression coverage for the canonical teacher reporting drill-down paths
- [x] Run the relevant broader route/component tests for teacher reporting pages

## Phase 4: Verification and Documentation
- [x] Run final relevant lint, targeted tests, broader `npm test`, and build gates for the reporting IA changes
- [x] Update active Conductor docs if the teacher reporting hierarchy changes
- [x] Record any deeper reporting work intentionally deferred to the gradebook or competency tracks
- [x] Prepare the track for archive with verification evidence
