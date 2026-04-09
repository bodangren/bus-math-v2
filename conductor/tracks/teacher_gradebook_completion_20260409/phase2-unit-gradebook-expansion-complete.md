# Phase 2: Unit Gradebook Expansion - Complete

## Summary

Expanded the unit-level gradebook to support independent practice and assessment visibility for all students. Teachers can now see which students have completed independent practice and assessments at the lesson level, with visual indicators in the gradebook cells.

## Implementation

### Data Layer (`lib/teacher/gradebook.ts`)

1. **Expanded `GradebookCell` type**:
   - Added `independentPractice: IndependentPracticeStatus | null`
   - Added `assessment: AssessmentStatus | null`
   - Both interfaces include `mode`, `completed`, `score`, `maxScore`
   - `AssessmentStatus` also includes `gradedAt` timestamp

2. **Added raw data types**:
   - `RawActivity`: maps activities to lessons
   - `RawActivitySubmission`: maps submission data with mode filtering

3. **Updated `assembleGradebookRows` function**:
   - Added `rawActivities` and `rawActivitySubmissions` parameters
   - Added helper to build lesson → activity ID map
   - Added helper to build user-activity-mode submission lookup
   - Added `getIndependentPracticeStatus` helper
   - Added `getAssessmentStatus` helper
   - Updated cell building to include mode-specific status

4. **Updated `buildGradebookCell` function**:
   - Added `independentPractice` parameter
   - Added `assessment` parameter
   - Both included in returned cell object

### Convex Query Layer (`convex/teacher.ts`)

1. **Updated `getTeacherGradebookData` query**:
   - Added `activities` table query for the unit
   - Filtered activities by lessonId to build lesson → activity mapping
   - Added `activity_submissions` table query for all students
   - Filtered submissions by activityId and mapped to helper shape
   - Passed activity and submission data to `assembleGradebookRows`

### UI Layer (`components/teacher/GradebookGrid.tsx`)

1. **Updated lesson cell rendering**:
   - Added `independentPractice` extraction from cell
   - Added `assessment` extraction from cell
   - Added flex column layout with mastery percentage and mode badges

2. **Added mode-specific indicators**:
   - "IP" badge (blue) for completed independent practice
   - "A: score/max" badge (purple) for completed assessments
   - Badges display below mastery percentage in each cell

3. **Applied to both regular lessons and unit test**:
   - Unit test cells also show independent practice and assessment indicators
   - Consistent visual treatment across all lesson types

## Test Coverage

### Unit Tests (`__tests__/lib/teacher/`)

1. **`gradebook.test.ts`** (32 tests passing):
   - Updated `buildGradebookCell` tests to accept new parameters
   - Added test for independent practice status
   - Added test for assessment status
   - All existing tests continue to pass with new signature

2. **`gradebook-data.test.ts`** (13 tests passing):
   - Updated all `assembleGradebookRows` calls to include empty arrays
   - Added test for independent practice status in cells
   - Added test for assessment status in cells
   - Added test distinguishing independent practice from assessment

### Component Tests

1. **`GradebookGrid.test.tsx`** (18 tests passing):
   - All existing tests pass with updated cell structure
   - Visual regression tests verify unchanged behavior for existing cells

2. **Unit gradebook page tests** (5 tests passing):
   - Page rendering tests pass with updated data contract

3. **All teacher component tests** (146 total tests):
   - All passing
   - One pre-existing warning in unrelated test file

## Verification Gates

- ✅ `npm run lint`: 0 errors, 1 pre-existing warning (worker default export)
- ✅ `npm test`: All 1615 tests pass (2 pre-existing Supabase suite failures)
- ✅ Gradebook data layer tests: 45 tests passing
- ✅ Gradebook UI component tests: 18 tests passing
- ✅ Unit gradebook page tests: 5 tests passing

## Data Flow

```
New cell display:
┌─────────────────────────┐
│      85%            │ ← Mastery percentage
│  [IP]  [A: 90/100] │ ← Mode indicators
└─────────────────────────┘
```

- **Blue "IP" badge**: Independent practice completed
- **Purple "A: score/max" badge**: Assessment completed with score display
- Badges only appear when the respective mode has a completed submission
- Multiple badges can appear in same cell (lesson may have both IP and assessment)

## Next Steps

Phase 3 (Submission and Evidence Drill-Down) will:
1. Wire gradebook cell clicks to mode-filtered submission detail modal
2. Add tabs to SubmissionDetailModal for Guided Practice | Independent Practice | Assessment
3. Filter submissions by mode before displaying in modal
4. Ensure drill-down surfaces show evidence for selected mode only

## Tech Debt Recorded

None new items recorded in this phase. All changes are backward-compatible with existing gradebook contract.
