# Specification: Teacher SRS Dashboard Type Safety Cleanup

## Overview

Remove the `internal as any` workaround from `TeacherSRSDashboardClient.tsx` and `app/teacher/srs/page.tsx` now that the `srs` module is present in the generated Convex API types. This addresses a deferred code-quality item from Pass 80.

## Functional Requirements

- `TeacherSRSDashboardClient.tsx` must reference `internal.srs.*` functions without an `as any` cast.
- `app/teacher/srs/page.tsx` must reference `internal.srs.getTeacherClasses` without an `as any` cast.
- Existing behavior must be preserved exactly.

## Non-Functional Requirements

- Lint must pass with zero errors and zero warnings.
- All tests must pass.
- Build must pass cleanly.

## Acceptance Criteria

- [ ] No `eslint-disable-next-line @typescript-eslint/no-explicit-any` comments remain in `components/teacher/srs/TeacherSRSDashboardClient.tsx` related to `internal` typing.
- [ ] No `eslint-disable-next-line @typescript-eslint/no-explicit-any` comments remain in `app/teacher/srs/page.tsx` related to `internal` typing.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `tech-debt.md` is updated to mark the deferred item as closed.

## Out of Scope

- Refactoring `fetchInternalQuery`/`fetchInternalMutation` signatures in `lib/convex/server.ts`.
- Adding new features to the SRS dashboard.
- Modifying child components (ClassHealthCard, WeakFamiliesPanel, etc.).
