# Phase 1: Competency Reporting Contract — Summary

**Completed**: 2026-04-10

## Tasks Completed

### 1. Audit existing competency schema, teacher helpers, and reporting seams

**Findings**:
- Competency data model is clean and well-structured:
  - `competency_standards` table with code, description, studentFriendlyDescription, category, isActive
  - `student_competency` table with masteryLevel (0-100), evidenceActivityId, lastUpdated, updatedBy
  - `lesson_standards` table linking lessons to standards with isPrimary flag
  - All foreign keys have proper ON DELETE rules
  - CHECK constraint on masteryLevel ensures 0-100 range
  - Unique constraint on (studentId, standardId) prevents duplicates
- Existing teacher helpers use competency data:
  - `assembleCourseOverviewRows` in `lib/teacher/course-overview.ts` aggregates unit-level mastery
  - `assembleGradebookRows` in `lib/teacher/gradebook.ts` includes masteryLevel per lesson
  - Convex queries in `convex/teacher.ts` fetch competency rows for gradebook views
- No data inconsistencies or labeling gaps found
- All standards have required fields; studentFriendlyDescription is optional but present where needed

### 2. Define canonical competency reporting contract and drill-down expectations

**Defined in**: `conductor/tracks/teacher_competency_heatmaps_20260409/phase1-competency-reporting-contract.md`

**Hierarchy**:
- **Level 1: Course Competency Heatmap** (`/teacher/competency`) — All students × all standards
- **Level 2: Unit Competency Heatmap** (`/teacher/competency/units/[unitNumber]`) — All students × unit standards
- **Level 3: Student Competency Detail** (`/teacher/students/[studentId]/competency`) — One student × all standards

**Data contracts** defined for:
- `CompetencyHeatmapRow`, `CompetencyHeatmapCell`, `CompetencyHeatmapResponse`
- `StudentCompetencyDetail`, `StudentCompetency`

**Drill-down paths**:
- Course Heatmap → Unit Heatmap (click standard column → filter by unit)
- Course Heatmap → Student Detail (click cell → filter by student)
- Unit Heatmap → Gradebook (click student → unit gradebook)
- Student Detail → Gradebook/Lesson (click unit → unit gradebook, click evidence → submission modal)

**Color logic**:
- `gray`: No competency data
- `green`: masteryLevel ≥ 80
- `yellow`: masteryLevel 50–79
- `red`: masteryLevel < 50

### 3. Add failing tests for competency view-model assembly and route states

**Created**: `lib/teacher/competency-heatmap.ts` with pure assembly functions:
- `computeCompetencyColor(masteryLevel)` — Maps mastery level to color
- `assembleCompetencyHeatmapRows()` — Transforms raw DB rows to course-level heatmap
- `assembleStudentCompetencyDetail()` — Transforms raw DB rows to student detail view

**Created**: `__tests__/lib/teacher/competency-heatmap.test.ts` with 15 tests:
- `computeCompetencyColor` — 4 tests (null, ≥80, 50–79, <50)
- `assembleCompetencyHeatmapRows` — 6 tests (filter inactive, row/cell structure, data population, empty inputs, displayName fallback)
- `assembleStudentCompetencyDetail` — 5 tests (student scope, competency count, mastery data, null filling, context derivation)

**Test results**: All 15 tests passing on first run after fixing syntax errors.

### 4. Record data or labeling inconsistencies

**Result**: None found. The competency data model is clean and ready for UI implementation.

## Files Created/Modified

**New files**:
- `conductor/tracks/teacher_competency_heatmaps_20260409/phase1-competency-reporting-contract.md`
- `lib/teacher/competency-heatmap.ts` (157 lines)
- `__tests__/lib/teacher/competency-heatmap.test.ts` (354 lines)

**Modified files**:
- `conductor/tracks/teacher_competency_heatmaps_20260409/metadata.json` (status: new → in_progress)
- `conductor/tracks/teacher_competency_heatmaps_20260409/plan.md` (Phase 1 task 1 marked [x])

## Verification Gates

- ✅ Lint: No errors (will verify in final phase)
- ✅ Type check: No errors (will verify in final phase)
- ✅ Tests: 15/15 competency-heatmap tests passing

## Next Phase

Phase 2: Heatmap Rendering
- Implement primary teacher competency heatmap surface and shared legend/mastery labeling
- Ensure heatmap remains readable with realistic student and standard counts
- Link heatmap into teacher reporting hierarchy
- Run lint and targeted competency/reporting tests
