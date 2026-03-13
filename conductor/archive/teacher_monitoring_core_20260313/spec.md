# Specification: Teacher Monitoring Core

## Overview

The current teacher surface already provides course-level, unit-level, and student-level monitoring, but the lesson-level drill-down remains incomplete. Unit gradebook headers link to `/teacher/units/[unitNumber]/lessons/[lessonId]`, yet no route exists, which leaves the promised teacher monitoring workflow without a lesson follow-up layer.

This track closes that gap by adding a teacher-guarded, Convex-backed lesson drill-down page that renders the published lesson plan and phase guidance for a selected lesson, supports adjacent-lesson navigation within the unit, and preserves the current authorization model.

## Functional Requirements

### FR1: Teacher Lesson Drill-Down Route

Add a teacher-only route at `/teacher/units/[unitNumber]/lessons/[lessonId]`.

- The route must require teacher session claims.
- Invalid unit numbers or unit/lesson mismatches must return `notFound()`.
- Unauthorized or missing teacher data must redirect back to `/teacher`.

### FR2: Convex-Backed Lesson Monitoring Query

Expose an internal Convex teacher query that returns the published lesson monitoring payload needed by the new route.

- The query must validate the requesting teacher profile.
- It must return the selected lesson, its published phases and ordered sections, and the ordered lesson list for the same unit.
- It must use Convex as the source of truth and must not introduce new Drizzle-backed runtime reads.

### FR3: Read-Only Teacher Lesson Monitoring Experience

Render the selected lesson as a read-only teacher follow-up page.

- Show unit and lesson context, breadcrumb-style navigation, and links back to the unit gradebook.
- Show previous/next lesson navigation and a jump list for other lessons in the same unit.
- Show published lesson overview and ordered phases with teacher-facing guidance.
- Do not add student mutation controls, grading workflows, or new authoring affordances.

### FR4: Automated Coverage

Add automated tests for the new lesson-level monitoring surface.

- Cover the page route’s authorization, not-found, and internal-query wiring behavior.
- Cover the helper that maps Convex published lesson data into the lesson-plan view model.
- Keep existing teacher gradebook links compatible with the new route shape.

## Non-Functional Requirements

- Follow the existing Vinext, React, TypeScript, Tailwind, and Convex architecture.
- Reuse published curriculum contracts already shared by student runtime flows.
- Do not add dependencies or schema changes.
- Keep teacher data on guarded server paths or internal Convex queries.

## Acceptance Criteria

- [ ] Given an authenticated teacher on a unit gradebook, when they open a lesson header link, then the lesson drill-down page renders instead of 404ing.
- [ ] Given a valid teacher request, when the lesson page loads, then it shows the selected lesson overview, ordered phases, and navigation to adjacent lessons in the same unit.
- [ ] Given an invalid unit number, unknown lesson id, or lesson that does not belong to the unit, when the route loads, then the request resolves with `notFound()`.
- [ ] Given an unauthorized teacher query result, when the route loads, then the request redirects to `/teacher`.
- [ ] Given a lesson without a published version or phases, when the route loads, then the page shows a stable empty state instead of crashing.
- [ ] Given the new teacher lesson flow changes shared runtime code, when verification runs, then `npm run lint`, `npm test`, and `npm run build` succeed.

## Out of Scope

- New grading tools, annotations, or intervention notes on lesson pages.
- Changes to student lesson progression behavior.
- Curriculum authoring or editor workflows.
- Reworking the existing dashboard, course overview, unit gradebook, or student detail layouts beyond what is needed to wire the lesson route.
