# Implementation Plan: Teacher Monitoring Core

## Phase 1: Track the Missing Lesson-Level Teacher Surface

- [x] Task: Write route tests for the teacher lesson drill-down page
  - [x] Add page tests covering teacher auth, internal query wiring, redirect, and not-found behavior for `/teacher/units/[unitNumber]/lessons/[lessonId]`
  - [x] Add or update source-level assertions that the unit gradebook lesson links point at the implemented route shape
  - [x] Run `npm run lint` and the targeted teacher route tests

- [x] Task: Write failing tests for the lesson monitoring view-model mapper
  - [x] Add a pure helper test for mapping published Convex lesson/phase data into the teacher lesson plan shape
  - [x] Include coverage for published-phase ordering, adjacent lesson navigation, and empty-phase fallback behavior
  - [x] Run `npm run lint` and the targeted mapper tests

## Phase 2: Implement the Teacher Lesson Drill-Down

- [x] Task: Implement the Convex teacher lesson query and mapping helper
  - [x] Add an internal teacher query for lesson-level monitoring data scoped to the selected unit and lesson
  - [x] Implement a pure mapper for lesson-plan rendering from published Convex lesson content
  - [x] Keep the query and helper aligned with published curriculum contracts already used in student runtime flows
  - [x] Run `npm run lint` and the targeted teacher/mapper tests

- [x] Task: Implement the teacher lesson page and verify the full app surface
  - [x] Add the `/teacher/units/[unitNumber]/lessons/[lessonId]` page and wire it to the internal Convex teacher query
  - [x] Render the lesson plan with back navigation plus previous/next and lesson-jump controls
  - [x] Update related Conductor memory/docs if the implementation reveals durable architecture guidance or debt
  - [x] Run `npm run lint`, `npm test`, and `npm run build`
