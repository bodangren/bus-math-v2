# Specification

## Overview

Finish the phase-1 student study loop so published lessons resume predictably, completed lessons reopen in a useful review state, and students get a clear next action when they finish a lesson.

## Functional Requirements

1. Entering a student lesson without an explicit `phase` query must use the student's published progress to choose the correct landing phase.
   - If the lesson has incomplete phases, land on the first incomplete phase.
   - If the lesson is fully complete, land on the final published phase instead of restarting at phase 1.
2. The student lesson experience must expose a clear completion state when the lesson is fully complete.
   - The completion state must offer a way back to the student dashboard.
   - If another lesson is the student's next recommended lesson, the completion state must offer a continue-learning action for it.
3. The "next recommended lesson" on a completed lesson page must come from the same published curriculum and progress model used by the student dashboard so course navigation stays consistent.
4. Public curriculum messaging must not claim that protected student lesson study is available without signing in when the actual route requires authentication.

## Non-Functional Requirements

- Convex remains the only runtime source of truth for student progress and lesson sequencing.
- The implementation must not introduce new product roles or admin/editor behavior.
- Automated tests must cover the lesson resume redirect and lesson completion navigation contracts.

## Acceptance Criteria

- Opening a partially completed lesson without `?phase=` redirects to the first incomplete published phase.
- Opening a fully completed lesson without `?phase=` redirects to the final published phase.
- A completed final lesson phase shows a lesson-complete state with dashboard navigation and a continue-learning CTA when another recommended lesson exists.
- The lesson-complete CTA uses the same next-lesson recommendation as the student dashboard model.
- Public curriculum copy no longer states that students can study protected lessons without signing in.

## Out of Scope

- New assessment engines or activity component types
- Teacher monitoring changes
- Curriculum authoring or editing tooling
