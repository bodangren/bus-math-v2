# Implementation Plan: Teacher SRS Dashboard

## Phase 1: Convex Analytics Queries

### Task 1.1: Create SRS Analytics Queries [ ]
- Create `convex/srs/teacher-queries.ts` (or add to existing `convex/srs/queries.ts`)
- Implement `getClassSrsHealth(classId: string)`:
  - Query all `srs_cards` for students in the class
  - Compute: total students with cards, average review count, overdue card count, cards due today
  - Return structured health summary
- Implement `getWeakFamilies(classId: string)`:
  - Query `srs_review_log` for the class, grouped by `problemFamilyId`
  - For each family: compute `Again` rate, `Hard` rate, `Good` rate, `Easy` rate
  - Sort by `Again` rate descending (worst first)
  - Return array of family summaries
- Implement `getStrugglingStudents(classId: string)`:
  - Query `srs_cards` grouped by student
  - For each student: count overdue cards, compute average rating, count total reviews
  - Sort by overdue count descending
  - Return top 10 students with issues

### Task 1.2: Create Intervention Mutations [ ]
- Create `convex/srs/teacher-mutations.ts` (or add to existing mutations file)
- Implement `resetStudentCard(teacherId, studentId, problemFamilyId)`:
  - Verify caller is a teacher
  - Find the student's card for the given family
  - Reset card to empty state (same as `createNewCard`)
  - Log the intervention
- Implement `bumpFamilyPriority(teacherId, classId, problemFamilyId)`:
  - Verify caller is a teacher
  - Find all students' cards for the given family in the class
  - Set `due` to `Date.now()` for all cards (makes them due immediately)
  - Log the intervention

### Task 1.3: Write Convex Query/Mutation Tests [ ]
- Create `__tests__/convex/srs/teacher-queries.test.ts`
- Mock Convex context with test data
- Test `getClassSrsHealth` with various card states
- Test `getWeakFamilies` returns families sorted by difficulty
- Test `getStrugglingStudents` returns students with most overdue cards
- Test `resetStudentCard` resets card state
- Test `bumpFamilyPriority` sets all cards to due now
- Test auth guards: non-teachers cannot call mutations

## Phase 2: Dashboard UI

### Task 2.1: Create Teacher SRS Dashboard Page [ ]
- Create `app/teacher/srs/page.tsx`
- Auth guard: require teacher role
- Fetch class health data on mount
- Render three panels: Class Health, Weak Families, Struggling Students

### Task 2.2: Create Class Health Card Component [ ]
- Create `components/teacher/srs/ClassHealthCard.tsx`
- Display: total students, average retention (%), overdue cards count, cards due today
- Use existing BM2 card/chart styling patterns

### Task 2.3: Create Weak Families Panel [ ]
- Create `components/teacher/srs/WeakFamiliesPanel.tsx`
- Table/list showing: family name, `Again` rate, average rating, review count
- Color-coded: red for high `Again` rate, green for low
- Click on a family to expand and see individual student breakdowns

### Task 2.4: Create Struggling Students Panel [ ]
- Create `components/teacher/srs/StrugglingStudentsPanel.tsx`
- Table showing: student name, overdue cards, average rating, last active date
- Action buttons per student: "Reset Card" (opens family picker modal)
- Sort by overdue count descending

### Task 2.5: Create Intervention Modals [ ]
- Create `components/teacher/srs/ResetCardModal.tsx`
  - Teacher selects a student and a problem family
  - Confirm button calls `resetStudentCard` mutation
  - Success toast on completion
- Create `components/teacher/srs/BumpPriorityModal.tsx`
  - Teacher selects a problem family
  - Confirm button calls `bumpFamilyPriority` mutation
  - Shows how many students will be affected

## Phase 3: Navigation Integration

### Task 3.1: Add SRS Dashboard Link to Teacher Dashboard [ ]
- Find the teacher dashboard page (likely `app/teacher/dashboard/page.tsx` or similar)
- Add a new card/link: "SRS Practice Analytics" linking to `/teacher/srs`
- Place it alongside existing gradebook and reporting links

### Task 3.2: Add Breadcrumbs [ ]
- Teacher SRS dashboard should have breadcrumbs: Dashboard → SRS Practice Analytics
- Follow existing breadcrumb patterns from `LessonRenderer.tsx`

## Phase 4: Tests

### Task 4.1: Write Component Tests [ ]
- Create `__tests__/components/teacher/srs/ClassHealthCard.test.tsx`
  - Test rendering with healthy data
  - Test rendering with empty data
- Create `__tests__/components/teacher/srs/WeakFamiliesPanel.test.tsx`
  - Test families are displayed in correct order
  - Test color coding logic
- Create `__tests__/components/teacher/srs/StrugglingStudentsPanel.test.tsx`
  - Test students displayed in correct order
  - Test action buttons are present

### Task 4.2: Write Page Tests [ ]
- Create `__tests__/app/teacher/srs/page.test.tsx`
  - Test auth guard redirects non-teachers
  - Test page renders with mock data
  - Test that panels are visible

## Phase 5: Verification

### Task 5.1: Run Full Verification Gates [ ]
- `npm run lint` — 0 errors
- `npm test` — all tests pass
- `npm run build` — clean
- Commit: `feat(teacher): add SRS practice analytics dashboard with intervention tools`
