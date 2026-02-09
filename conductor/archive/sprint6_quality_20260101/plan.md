# Tasks: Sprint 6 - Quality & Stability

## Phase 1: Test Stabilization
- [ ] Task: Fix `DepreciationMethodBuilder.test.tsx` regex selection errors
    - [ ] Task: Use `getAllByText` or more specific queries
- [ ] Task: Fix `InterestCalculationBuilder.test.tsx` regex selection errors
    - [ ] Task: Use `getAllByText` or more specific queries
- [ ] Task: Fix `LessonRenderer.test.tsx` router mounting and prop errors
    - [ ] Task: Mock `useRouter` correctly
    - [ ] Task: Fix missing props in test fixtures
- [ ] Task: Fix `mock-factories.test.ts` Zod validation errors
    - [ ] Task: Ensure `standardId` is generated or optional
- [ ] Task: Fix `app/api/progress/assessment/route.test.ts` status code failures
- [ ] Task: Fix `app/student/lesson/[lessonSlug]/page.test.tsx` Supabase mocking
- [ ] Task: Fix `app/api/lessons/[lessonId]/progress/route.test.ts` status code failures
- [ ] Task: Fix `components/auth/AuthProvider.test.tsx` unhandled rejections

## Phase 2: Type Safety
- [ ] Task: Configure Vitest types in `tsconfig.json`
    - [ ] Task: Add `vitest/globals` or `@types/jest` to types array
- [ ] Task: Fix `SpreadsheetTemplates.test.tsx` undefined object errors
    - [ ] Task: Add null checks or assertions for array access
- [ ] Task: Fix `SupabaseClient` type mismatches in security tests
    - [ ] Task: Align mock client types with `supabase-js` v2
- [ ] Task: Fix `LessonRendererProps` type mismatches in tests

## Phase 3: E2E Verification
- [ ] Task: Implement E2E tests for Teacher Command Center (Bulk Import)
- [ ] Task: Implement E2E tests for Teacher Gradebook View
- [ ] Task: Verify and update Unit 1 Lesson 1 E2E flow

## Phase 4: Unit 1 Component Readiness
- [ ] Task: **Lesson 1 & 2**: Verify `AccountCategorization` matches DB schema.
    - [ ] Task: Ensure dynamic items can be passed via props.
- [ ] Task: **Lesson 3 & 4**: Verify `SpreadsheetActivity` templates.
    - [ ] Task: Test loading "Balance Sheet" template.
    - [ ] Task: Create/Verify "Transaction Log" template.
- [ ] Task: **Lesson 5**: Register `DataCleaningExercise`.
    - [ ] Task: Add `data-cleaning` to `activityRegistry`.
    - [ ] Task: Ensure props support custom datasets.
- [ ] Task: **Lesson 7**: Enable Charting Components.
    - [ ] Task: Add `financial-dashboard` or `chart-builder` to `activityRegistry`.
    - [ ] Task: Verify `BarChart` renders with static data props.
- [ ] Task: **Lesson 11**: Verify `ComprehensionCheck`.
    - [ ] Task: Test multiple-choice and short-answer modes.
