# Track Specification: Teacher Reporting Information Architecture

## Overview
Expose the teacher reporting system from the teacher dashboard and define the canonical reporting hierarchy for daily classroom use. The current repo contains partial reporting surfaces, but the teacher dashboard does not present a coherent information architecture for course, unit, lesson, and student drill-down workflows.

## Functional Requirements
1. Define the canonical teacher reporting hierarchy and entry points for:
   - dashboard
   - course overview / course gradebook
   - unit report / unit gradebook
   - lesson report
   - student detail
   - competency views (as forthcoming destinations if not fully implemented in this track)
2. Add explicit reporting entry points from the teacher dashboard to the course-gradebook and related reporting surfaces.
3. Add consistent breadcrumbs and back-link behavior across teacher reporting routes.
4. Ensure course, unit, lesson, and student reporting pages expose clear orientation about where the teacher is in the reporting tree.
5. Add regression coverage for the teacher dashboard reporting entry points and route-level wayfinding behavior.

## Non-Functional Requirements
- Preserve existing teacher/student authorization boundaries.
- Prefer shared reporting navigation primitives over one-off page-local links.
- Keep the information architecture understandable for real teacher use, not just development discovery.

## Acceptance Criteria
1. A teacher can discover and enter reporting flows directly from the teacher dashboard.
2. Course, unit, lesson, and student reporting routes follow a coherent drill-down contract.
3. Reporting pages include consistent breadcrumbs or back-link patterns.
4. Regression tests cover the primary reporting entry points and route navigation behavior.

## Out of Scope
- Completing the underlying gradebook data model for independent practice and assessment.
- Rendering full competency heatmaps beyond whatever placeholder links are needed for the IA.
