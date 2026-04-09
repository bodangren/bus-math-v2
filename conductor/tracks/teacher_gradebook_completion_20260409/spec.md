# Track Specification: Teacher Gradebook Completion

## Overview
Complete the teacher gradebook so it supports real classroom progress review rather than only a partial lesson-status grid. Teachers need to inspect detailed progress within a unit for all students and see the independent-practice and assessment evidence that matters for instructional follow-up.

## Functional Requirements
1. Define the canonical gradebook data contract for the teacher course and unit reporting views, including:
   - lesson completion/progress
   - independent practice visibility
   - assessment visibility
   - unit test visibility where applicable
   - submission-detail drill-down
2. Expand the unit-level gradebook so teachers can view detailed progress for all students across the full unit.
3. Ensure independent practice and assessment are visible in the gradebook at the level needed for classroom follow-up.
4. Ensure gradebook drill-down surfaces expose the relevant submission or progress evidence without leaving teachers at opaque percentages.
5. Add regression coverage for the new gradebook contract, view-model behavior, and route rendering.

## Non-Functional Requirements
- Keep Convex-derived progress and submission evidence as the source of truth.
- Preserve teacher-only authorization on all gradebook data paths.
- Prefer consistent legends, labels, and cell semantics across course and unit views.

## Acceptance Criteria
1. Teachers can inspect detailed unit progress for all students from the unit gradebook.
2. Independent practice and assessment are explicitly visible in the gradebook workflow.
3. Gradebook percentages/cells map to understandable evidence or drill-down detail.
4. Regression tests cover the expanded gradebook data/view contract.

## Out of Scope
- Competency heatmap rendering beyond any link-outs needed for drill-down continuity.
- New grading policies outside the existing course data model.
