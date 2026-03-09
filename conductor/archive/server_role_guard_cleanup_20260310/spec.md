# Specification: Server Role Guard Cleanup & Admin Authorization Hardening

## Overview

The March 9 teacher page work introduced repeated server-side teacher/admin gating across multiple App Router pages. Those checks are already drifting: teacher pages use inconsistent fallback redirects when internal data is missing, and the admin dashboard currently checks only for authentication, not for the admin role. That combination creates duplicate code, a real authorization gap, and user-facing redirect behavior that is harder to reason about and test.

This track creates shared server-side role-guard helpers, refactors the affected teacher/admin pages to use them, closes the admin authorization bug, and adds the missing tests so future route additions inherit the correct behavior by default.

## Functional Requirements

1. Add shared server-side auth helpers that support:
   - requiring an authenticated session with a login redirect
   - requiring one or more allowed roles with a non-admin fallback redirect
   - a teacher/admin convenience path for teacher-facing pages

2. Refactor duplicated role checks in the affected App Router pages to use the shared helper:
   - `/teacher`
   - `/teacher/gradebook`
   - `/teacher/units/[unitNumber]`
   - `/teacher/students/[studentId]`
   - `/admin/dashboard`

3. Close the admin authorization gap so non-admin authenticated users cannot access the admin dashboard shell.

4. Standardize teacher-page fallback behavior when internal Convex teacher data is unavailable so teacher-facing routes do not bounce to unrelated login screens after an authenticated request.

5. Add automated tests that verify:
   - the shared helper redirects unauthenticated users to the correct login target
   - unauthorized roles are redirected to the configured fallback path
   - teacher pages still call internal Convex queries with the session profile id
   - `/admin/dashboard` rejects teacher/student roles and permits admin users

## Non-Functional Requirements

1. Follow TDD: add or update tests first and confirm a failing state before implementation.
2. Do not add or upgrade dependencies.
3. Keep all shell commands non-interactive and unattended-safe.
4. Keep role-based access decisions on the server side.
5. Preserve existing page UI structure unless a redirect/authorization fix requires a small UX correction.

## Acceptance Criteria

1. Duplicated inline teacher/admin role checks are removed from the affected pages in favor of shared server auth helpers.
2. The admin dashboard requires the `admin` role, not just any authenticated session.
3. Teacher pages redirect consistently for unauthenticated and unauthorized access, and authenticated teacher data misses no longer redirect to a generic login page.
4. New or updated tests cover the shared helper and the affected teacher/admin pages.
5. `CI=true npm run lint`, `CI=true npm test`, and `CI=true npm run build` succeed.
6. README and Conductor memory files reflect the new shared role-guard behavior and the resolved authorization issue.

## Out of Scope

1. Reworking the teacher dashboard or gradebook visual design.
2. Broad auth architecture changes beyond server-side route guards.
3. Refactoring API route authorization helpers outside the affected App Router pages.
