# Specification: Student Progress Hub & Resume Navigation

## Overview

The current student dashboard is a minimal list of lesson cards, even though the product definition emphasizes guided progress and clear next steps. This track upgrades the live student experience into a progress hub that helps students understand where they are in the course, what to do next, and how each unit is progressing, while also cleaning up stale student navigation helpers that still point to non-existent routes.

## Functional Requirements

### FR1: Guided Progress Dashboard

The `/student/dashboard` experience shall summarize course progress and recommend the next lesson.

- Show overall course progress derived from existing phase-completion data.
- Show counts for completed lessons, in-progress lessons, and completed units.
- Highlight a single recommended next lesson using existing lesson progress data.
- Use action labels that match the lesson state: `Start Lesson`, `Resume Lesson`, or a completion-state message when all lessons are done.

### FR2: Unit-Level Progress Cards

The dashboard shall group lessons by unit and make progress legible at the unit level.

- Show each unit's title, progress percentage, completed-lesson counts, and status badge.
- Surface the next actionable lesson inside each unit when one exists.
- Keep the layout readable on mobile and tablet widths without horizontal overflow.

### FR3: Student Navigation Cleanup

Student-facing navigation helpers shall generate valid routes that match the live app.

- Shared student navigation helpers shall point lesson links to `/student/lesson/[lessonSlug]`.
- The `/student` route shall resolve to the dashboard so existing student breadcrumbs do not dead-end.
- Existing student overview components touched by this track shall stop generating broken lesson-phase URLs.

### FR4: Shared View-Model Logic

Dashboard progress derivation shall live in shared, testable utility code.

- Centralize course summary, unit summary, and next-lesson selection logic in a pure TypeScript module.
- Reuse shared helpers in the dashboard page and any related student-navigation cleanup.
- Avoid schema changes, new dependencies, or new persistence layers.

## Non-Functional Requirements

- Preserve the current Convex-backed auth and lesson access flow.
- Follow the current Vinext/App Router, TypeScript, Tailwind, and shadcn UI patterns.
- Keep UI copy concise and student-friendly.
- Add automated coverage for shared dashboard derivation logic, dashboard rendering, and student route cleanup.

## Acceptance Criteria

- [ ] Given a signed-in student with mixed lesson progress, when `/student/dashboard` loads, then overall progress, lesson counts, and a next-step card are visible.
- [ ] Given a lesson that has started but is not complete, when it is the student's next recommended lesson, then the dashboard labels the action `Resume Lesson`.
- [ ] Given a lesson with zero completed phases, when it is the next recommended lesson, then the dashboard labels the action `Start Lesson`.
- [ ] Given a unit with some completed lessons, when the dashboard renders, then the unit card shows a progress bar, completed-lesson counts, and the next lesson in that unit.
- [ ] Given all lessons are complete, when the dashboard renders, then the dashboard shows a completion-state message instead of prompting the student to resume a lesson.
- [ ] Given a student or component links to `/student`, when that route resolves, then the user lands on the student dashboard.
- [ ] Given student overview components generate phase links, when they render, then the links target the real lesson route with a `?phase=` query instead of a non-existent nested path.

## Out of Scope

- New grading logic or mastery algorithms.
- Calendar-based pacing targets.
- Teacher-authored notes or messaging.
- New unit practice-test routes.
