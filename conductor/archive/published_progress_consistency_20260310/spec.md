# Specification: Published Progress Consistency & Dashboard Hardening

## Overview

The March 9 dashboard work introduced a higher-priority correctness issue: both student and teacher progress views can derive completion from draft or historical curriculum versions instead of the latest published lesson version. That can leak unreleased lesson metadata to students, undercount or overcount teacher intervention progress, and make dashboard decisions diverge from the intended production curriculum path.

This cleanup/refactor track centralizes published-curriculum progress derivation into shared helper code, refactors the affected Convex student and teacher queries to use it, and fixes the remaining dashboard math drift so progress percentages align with published phase totals.

This is the first new cleanup/refactor track for March 10, 2026 and is based on a code review of the March 9 teacher-related tracks. A focused security review is part of the work; no serious or critical issues are expected to remain unaddressed when the track closes.

## Functional Requirements

### FR1: Latest Published Lesson Version Selection

Student-facing and teacher-facing progress queries shall derive curriculum state from the latest published lesson version only.

- Shared helper code shall select the highest-version `lesson_versions` row whose status is `published` for each lesson.
- Student dashboard, lesson progress, phase completion, and teacher progress snapshot paths shall stop using draft or superseded lesson versions.
- If a lesson has no published version, progress calculations shall treat it as having no published phases.

### FR2: Shared Published Phase Progress Snapshots

Teacher and student progress calculations shall share the same published-phase semantics.

- Shared helper code shall derive active published phase ids for lessons and progress snapshots from those ids.
- Teacher dashboard and teacher student detail snapshots shall count only published phases.
- Student lesson progress and phase-completion mutations shall resolve phases from the latest published lesson version.

### FR3: Accurate Student Dashboard Progress Math

Student dashboard summary cards and unit cards shall reflect phase-weighted progress.

- Unit progress shall be computed from completed phases divided by total phases in the unit, not by averaging lesson percentages.
- Existing next-lesson and status behavior shall remain intact.
- The rendered UI contract for the dashboard shall remain compatible with the current page/component tests.

### FR4: Documentation and Cleanup Closeout

Project documentation shall reflect the shared helper pattern and the cleanup outcome.

- Update `README.md` with the published-curriculum progress guarantee for student and teacher dashboard flows.
- Record the resolved draft/historical progress drift in Conductor memory files.
- Archive the track after successful verification.

## Non-Functional Requirements

- Follow TDD: add or update tests first and confirm failure before implementation.
- Do not add or upgrade dependencies.
- Keep shell commands non-interactive and unattended-safe.
- Preserve existing Convex data contracts and role-based access behavior.
- Keep new helper code in TypeScript modules under `lib/` or shared Convex-support modules as appropriate.
- Do not introduce new schema fields or tables.

## Acceptance Criteria

- [ ] Student dashboard data uses only the latest published lesson version for lesson titles, descriptions, total phases, and completed phases.
- [ ] Teacher dashboard and teacher student detail snapshots count only phases belonging to the latest published lesson version for each lesson.
- [ ] Student lesson progress and phase completion resolve phases against the latest published lesson version only.
- [ ] Student unit progress is phase-weighted rather than lesson-average weighted.
- [ ] Automated tests cover the shared published-progress helper logic and the updated student dashboard math.
- [ ] `CI=true npm run lint`, `CI=true npm test`, and `CI=true npm run build` all succeed.

## Out of Scope

- Changing teacher authorization rules or role-guard behavior.
- Reworking gradebook mastery calculations beyond published-version selection.
- Adding new teacher/student UI surfaces unrelated to progress correctness.
