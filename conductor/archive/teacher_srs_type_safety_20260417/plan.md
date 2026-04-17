# Implementation Plan: Teacher SRS Dashboard Type Safety Cleanup

## Phase 1: Type Safety Cleanup and Tests

- [x] Task 1: Write component tests for TeacherSRSDashboardClient
  - [x] Create `__tests__/components/teacher/srs/TeacherSRSDashboardClient.test.tsx`
  - [x] Mock `@/lib/convex/server` with typed `api.srs` references
  - [x] Test rendering with classes, empty state, class change, and modal interactions

- [x] Task 2: Remove `internal as any` workaround from source files
  - [x] Update `app/teacher/srs/page.tsx` to use `internal.srs.getTeacherClasses` directly
  - [x] Update `components/teacher/srs/TeacherSRSDashboardClient.tsx` to use `api.srs.*` directly

- [x] Task 3: Update existing page test mocks
  - [x] Ensure `__tests__/app/teacher/srs/page.test.tsx` mocks work with typed references

- [x] Task 4: Run verification gates
  - [x] `npm run lint`: 0 errors, 0 warnings
  - [x] `npm test`: 2254/2254 tests pass (338 test files)
  - [x] `npm run build`: passes cleanly
  - [x] No issues found
