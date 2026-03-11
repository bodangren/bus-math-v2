# Specification

## Overview
Published lesson progress rules are now centralized at a low level, but the student dashboard query, teacher student-detail query, and student lesson-progress query still each assemble their own lesson/unit progress structures and phase-status rules. That duplication keeps the product vulnerable to silent drift whenever published-version rules or lesson-phase state rules change. This refactor will move the remaining shared progress/view-model logic into reusable helpers and have the Convex student/teacher queries consume the same implementation.

## Functional Requirements
- Add shared helpers that assemble per-unit lesson progress rows from published lesson versions, published phase ids, and student progress rows.
- Add a shared helper that derives ordered lesson phase statuses (`completed`, `current`, `available`, `locked`) from published phase rows and student progress.
- Refactor `convex/student.ts` to use the shared helpers for dashboard unit/lesson rows and lesson progress responses.
- Refactor `convex/teacher.ts` to use the shared helpers for teacher student-detail unit/lesson rows.
- Preserve current output shapes and business rules for student dashboards, teacher student detail pages, and lesson navigation.

## Non-Functional Requirements
- Follow TDD: add failing tests before refactoring production code.
- Do not add dependencies or change the tech stack.
- Keep the refactor scoped to the current Convex/runtime, tests, README, and Conductor artifacts.
- Keep published-only behavior intact so draft lesson versions never affect classroom progress.

## Acceptance Criteria
- Shared helper tests fail before implementation and pass after the refactor.
- Student dashboard and teacher student-detail progress rows are produced through the same reusable published-progress helper.
- Student lesson progress status assembly is produced through a reusable helper rather than inline query logic.
- Existing student dashboard, teacher student-detail, and published-curriculum regression tests continue to pass.
- `CI=true npm run lint`, `CI=true npm test`, and `CI=true npm run build` all pass successfully.

## Out of Scope
- New teacher dashboard features or UI redesigns.
- Changes to lesson locking policy beyond preserving current behavior.
- Curriculum seed rewrites or new lesson content authoring.
