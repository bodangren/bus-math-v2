# Specification

## Overview

Student lesson phases currently render through a generic shell that shows the lesson title and raw content blocks, but it does not communicate the curriculum intent of the current phase. To support coherent curriculum implementation, the student lesson view should present phase-specific guidance that matches the lesson type, the current phase objective, and the lesson's learning objectives while reusing the shared lesson content renderer instead of duplicating block presentation.

## Functional Requirements

1. The curriculum layer must expose canonical phase-guidance metadata for each lesson type and phase number used in the six-phase lesson model.
2. The student lesson phase view must render a reusable guidance component that shows the current phase purpose and practical success criteria derived from the curriculum guidance plus the lesson's learning objectives.
3. The guidance component must work for at least accounting, excel, project, and assessment lesson types, with safe fallback behavior if a phase configuration is incomplete.
4. The student lesson renderer must use the shared `PhaseRenderer` content-block renderer instead of maintaining a second inline renderer for markdown, callouts, media, and activities.
5. Existing student phase progress, completion, and navigation behavior must remain intact.

## Non-Functional Requirements

1. New curriculum guidance logic must be covered by automated tests.
2. The student lesson rendering changes must be regression-tested at the component level.
3. The implementation must stay within the existing Vinext/React/TypeScript stack and avoid dependency changes.

## Acceptance Criteria

- Accounting and Excel lesson phases render guidance that clearly states the current phase goal and what successful completion looks like.
- Guided-practice phases explicitly communicate the interactive requirement through the rendered student shell.
- Lesson-specific learning objectives are surfaced in the current phase guidance without replacing the lesson-wide objectives section.
- Student lessons continue to render content blocks and activities through the shared lesson renderer path.
- Automated tests cover the new phase-guidance model and the updated student lesson rendering behavior.

## Out of Scope

- New interactive activity types or Convex persistence changes.
- Curriculum seed rewrites beyond what is required to support the guidance shell.
- Teacher-facing lesson-plan changes.
