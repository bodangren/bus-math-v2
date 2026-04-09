# Track Specification: Teacher Competency Heatmaps and Mastery Views

## Overview
Turn the existing competency-tracking data into teacher-facing mastery views that are useful for classroom decisions. The data exists in the repo, but teachers do not yet have a heatmap or mastery-oriented reporting surface to understand which standards need intervention across the course, a unit, or an individual student.

## Functional Requirements
1. Define the canonical teacher competency-reporting hierarchy for:
   - course competency heatmap
   - unit competency heatmap or filtered unit view
   - student competency detail
   - links back to gradebook/reporting surfaces
2. Render a teacher-facing competency heatmap view using the existing competency data model.
3. Provide clear legends and mastery labels so the heatmap is interpretable without code or schema knowledge.
4. Support drill-down from the heatmap to the relevant unit, lesson, or student reporting context when practical.
5. Add regression coverage for competency view-model assembly and the primary rendered states.

## Non-Functional Requirements
- Keep mastery calculations aligned with the existing stored competency data rather than introducing parallel derivation rules.
- Preserve teacher-only authorization boundaries for competency reporting.
- The heatmap must remain legible on realistic class sizes and mobile/tablet widths where the product supports them.

## Acceptance Criteria
1. Teachers can open a competency-focused reporting surface from the reporting hierarchy.
2. The competency heatmap clearly communicates mastery distribution at the intended scope.
3. Teachers can drill from the heatmap to related reporting context when needed.
4. Regression tests cover the competency view-model and primary rendered states.

## Out of Scope
- Redefining the competency model or grading policy itself.
- New AI interpretation features beyond what existing reporting already supports.
