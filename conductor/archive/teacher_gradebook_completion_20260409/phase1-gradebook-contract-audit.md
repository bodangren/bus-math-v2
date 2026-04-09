# Phase 1: Gradebook Contract Audit and Data Gaps

## Current Contract Analysis

The current gradebook implementation (`lib/teacher/gradebook.ts`) provides:

- ✅ **Lesson completion tracking** via phase progress status (not_started, in_progress, completed)
- ✅ **Mastery level tracking** from competency data (0-100 for primary standard)
- ✅ **Unit test identification** via `isUnitTest` flag (orderIndex === 11)
- ✅ **Cell color coding** (gray/red/yellow/green) based on completion and mastery
- ✅ **Student row structure** with displayName, username, and cell array

## Data Source Inventory

### Available in Convex Schema

**activity_submissions table** contains:
- userId: id("profiles")
- activityId: id("activities")
- submissionData: practiceSubmissionEnvelopeValidator
  - `mode`: 'worked_example' | 'guided_practice' | 'independent_practice' | 'assessment'
  - `status`: 'draft' | 'submitted' | 'graded' | 'returned'
  - `score`: optional number
  - `maxScore`: optional number
  - `parts`: array with per-part scoring and misconception tags
  - `attemptNumber`: number
- score: optional number
- maxScore: optional number
- submittedAt: number
- gradedAt: optional number
- gradedBy: optional id("profiles")

### Phase Progress Tracking

**phase_progress table** contains:
- userId: id("profiles")
- phaseId: id("phases")
- status: 'not_started' | 'in_progress' | 'completed'

## Identified Gaps

### Gap 1: Independent Practice Visibility

**Current state:** Gradebook only shows lesson-level phase completion. Independent practice submissions exist in `activity_submissions` with `mode: 'independent_practice'`, but are not aggregated into gradebook cells.

**Required:**
1. Query `activity_submissions` filtered by `mode: 'independent_practice'`
2. Aggregate independent practice completion per student/lesson
3. Add `independentPracticeStatus` field to `GradebookCell` type
4. Add `independentPracticeScore` field to `GradebookCell` type
5. Update cell display to show independent practice indicator

### Gap 2: Assessment Visibility

**Current state:** Assessment submissions exist in `activity_submissions` with `mode: 'assessment'`, but are not exposed in gradebook cells.

**Required:**
1. Query `activity_submissions` filtered by `mode: 'assessment'`
2. Aggregate assessment scores per student/lesson
3. Add `assessmentStatus` field to `GradebookCell` type
4. Add `assessmentScore` field to `GradebookCell` type
5. Add `assessmentMaxScore` field to `GradebookCell` type
6. Update cell display to show assessment score

### Gap 3: Mode-Based Drill-Down

**Current state:** Gradebook cells don't expose submission detail links that drill down into mode-specific evidence.

**Required:**
1. Add drill-down affordances to gradebook UI
2. Filter submission detail modal by mode (independent_practice vs assessment)
3. Ensure drill-down surfaces are accessible from gradebook cells

### Gap 4: Expanded GradebookCell Type

**Current `GradebookCell` interface:**
```typescript
export interface GradebookCell {
  lesson: GradebookLesson;
  completionStatus: LessonCompletionStatus;
  masteryLevel: number | null;
  color: CellColor;
}
```

**Required expansion:**
```typescript
export interface IndependentPracticeStatus {
  mode: 'independent_practice';
  completed: boolean;
  score: number | null;
  maxScore: number | null;
}

export interface AssessmentStatus {
  mode: 'assessment';
  completed: boolean;
  score: number | null;
  maxScore: number | null;
  gradedAt: number | null;
}

export interface GradebookCell {
  lesson: GradebookLesson;
  completionStatus: LessonCompletionStatus;
  masteryLevel: number | null;
  color: CellColor;
  independentPractice: IndependentPracticeStatus | null;
  assessment: AssessmentStatus | null;
}
```

## Data Mapping Strategy

### Join Pattern

1. **Lessons → Activities**: Query `activities` table filtered by `lessonId`
2. **Activities → Submissions**: Query `activity_submissions` filtered by `activityId` and `userId`
3. **Filter by Mode**: Separate independent_practice and assessment submissions
4. **Aggregate by Lesson**: Group submissions by lesson context

### Query Optimization

- Use existing index `by_user` on `activity_submissions` to get all student submissions
- Use existing index `by_activity` on `activity_submissions` when drilling down
- Add composite index if needed for efficient user+activity lookup

## UI/UX Implications

### Cell Display Requirements

1. **Primary indicator**: Lesson completion color (current implementation)
2. **Secondary indicators**:
   - Independent practice badge/icon when completed
   - Assessment score when submitted
3. **Drill-down affordances**:
   - Click cell → Show submission detail modal
   - Modal tabs: Guided Practice | Independent Practice | Assessment
   - Filter submissions by mode in modal

### Accessibility

- Ensure cell drill-down is keyboard accessible
- Provide aria labels for mode-specific indicators
- Maintain high contrast for all status indicators

## Dependencies

### Data Layer
- ✅ `activity_submissions` table exists with mode field
- ✅ `practiceSubmissionEnvelopeValidator` includes mode
- ✅ Indexes exist for efficient querying

### UI Layer
- ✅ SubmissionDetailModal component exists (needs mode filtering)
- ❌ GradebookCell type needs expansion
- ❌ Cell rendering needs mode indicator updates
- ❌ Drill-down wiring needs mode filtering

## Test Coverage Requirements

### Contract Tests (phase1-gradebook-expanded-contract.test.ts)
- ✅ Unit test flag exists and works
- ✅ Lesson completion status derivation works
- ❌ Independent practice tracking (new)
- ❌ Assessment tracking (new)
- ❌ Mode separation in same lesson (new)

### Integration Tests
- Test query aggregation of independent_practice submissions
- Test query aggregation of assessment submissions
- Test cell display with mode-specific data
- Test drill-down modal mode filtering

## Next Steps (Phase 2-3)

1. **Phase 2 (Unit Gradebook Expansion)**: Implement the expanded `GradebookCell` type and data aggregation functions
2. **Phase 3 (Submission and Evidence Drill-Down)**: Update UI to show mode-specific indicators and wire drill-down to filtered submission detail
