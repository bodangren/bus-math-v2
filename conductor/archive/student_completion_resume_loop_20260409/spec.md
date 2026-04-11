# Track Specification: Student Completion and Resume Loop

## Overview
Make the student course workflow coherent after navigation is fixed. A student who opens, completes, revisits, or resumes a lesson should get clear next actions from both the dashboard and the lesson runtime instead of landing in ad hoc or incomplete states.

## Functional Requirements
1. Define the canonical student completion-loop behavior for:
   - not started lesson
   - in-progress lesson
   - completed lesson
   - next recommended lesson
   - review/revisit after completion
2. Ensure the student dashboard exposes the correct action label and destination for each lesson/unit state.
3. Ensure the completed-lesson state offers intentional next actions, including:
   - return to dashboard
   - review the completed lesson
   - continue to the next recommended lesson when one exists
4. Ensure dashboard and lesson-runtime recommendations are derived from the same underlying continue-state rules.
5. Add regression coverage for the continue-state and completed-lesson behavior.

## Non-Functional Requirements
- Preserve Convex-derived progress and recommendation data as the source of truth.
- Avoid duplicating continue-state logic between dashboard and lesson runtime.
- Preserve or improve clarity on both desktop and mobile layouts.

## Acceptance Criteria
1. Students see consistent start, resume, review, or continue actions across dashboard and lesson surfaces.
2. The completed-lesson panel no longer feels like a dead-end or one-off state.
3. Dashboard and lesson-runtime recommendations agree for the same student and lesson state.
4. Regression tests cover the primary continue-state transitions.

## Out of Scope
- Adding new curriculum content or new student activity types.
- Teacher-facing reporting changes.
