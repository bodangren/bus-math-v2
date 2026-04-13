# Capstone Workbook Lookup Gap Fix

## Problem

Capstone workbook files (`capstone_investor_ready_workbook.xlsx` and `capstone_investor_ready_workbook_teacher.xlsx`) exist in `public/workbooks/` and are included in the workbook manifest `files` array, but they:

1. Don't match the `unit_XX_lesson_YY` naming pattern used by all other workbooks
2. Are therefore excluded from the `byUnitAndLesson` lookup in the manifest
3. Cannot be discovered via `hasStudentWorkbook()`, `hasTeacherWorkbook()`, or `lessonHasWorkbooks()`
4. Have no API endpoint to serve them (the existing route only handles unit/lesson paths)

## Impact

- Students/teachers cannot discover or download capstone workbooks through the app
- The capstone page only links to PDFs (business plan guide, pitch rubric, model tour checklist), not the Excel workbooks
- If any future lesson page checks for capstone workbooks using the standard lookup, it will incorrectly return false

## Solution

1. **Add `byCapstone` lookup to workbook manifest** - Extend `lib/workbooks-manifest.json` to include a `byCapstone` object that maps capstone workbook availability
2. **Add client-side lookup functions** - Add `hasCapstoneWorkbook(type)` to `workbooks.client.ts`
3. **Add capstone workbook API route** - Create `/api/workbooks/capstone/[type]/route.ts` to serve capstone workbooks with auth and role checks
4. **Update capstone page** - Add download links for capstone workbooks on the capstone overview page

## Out of Scope

- Moving or renaming existing capstone files (they already exist and work)
- Changes to the lesson renderer or teacher lesson plan (those use unit/lesson lookup which is correct for regular lessons)

## Acceptance Criteria

1. `lib/workbooks-manifest.json` includes a `byCapstone` object with student/teacher availability
2. `workbooks.client.ts` exports `hasCapstoneStudentWorkbook()` and `hasCapstoneTeacherWorkbook()` functions
3. New API route `/api/workbooks/capstone/[type]` serves capstone workbooks with proper auth and role checks
4. Capstone page shows download links for student and teacher capstone workbooks (role-aware)
5. All existing tests pass
6. Lint passes with 0 errors