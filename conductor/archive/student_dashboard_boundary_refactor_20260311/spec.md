# Specification

## Overview
The first track for 2026-03-11 must be a cleanup/refactor pass over the previous day's teacher/student dashboard work. This track will harden the student dashboard so only student-role sessions can access it, and it will refactor duplicated "next lesson" and unit-status presentation into shared dashboard UI/helpers used by both the student dashboard and teacher student-detail experience.

## Functional Requirements
- Add an explicit student-only server auth helper for student-facing routes.
- Update the student dashboard route to enforce the student role and redirect teacher/admin sessions away from the student dashboard.
- Extract shared lesson-status presentation primitives so student and teacher dashboard surfaces render the same next-lesson messaging, CTA labels, and unit status styling from one implementation path.
- Preserve the published-curriculum progression rules already used by `buildStudentDashboardViewModel`.
- Improve teacher student-detail UX by reusing the shared next-lesson presentation instead of its bespoke card markup.

## Non-Functional Requirements
- Follow TDD: tests must fail before the implementation changes.
- Do not introduce new dependencies or change the documented tech stack.
- Keep auth logic centralized under `lib/auth/server`.
- Keep the refactor within the active app and Conductor documentation only.

## Acceptance Criteria
- A student session can still render the student dashboard and fetch dashboard data.
- A teacher session hitting `/student/dashboard` is redirected to `/teacher`.
- An admin session hitting `/student/dashboard` is redirected to `/admin/dashboard`.
- Shared dashboard presentation tests cover both the actionable and completed/empty states.
- Existing teacher student-detail and student dashboard tests pass after the refactor.
- `npm run lint`, relevant automated tests, and the production build pass successfully.

## Out of Scope
- New curriculum components or new lesson content.
- Changes to lesson progression rules beyond presentation/auth cleanup.
- Demo-user provisioning or other unrelated auth flows.
