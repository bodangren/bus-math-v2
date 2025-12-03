---
title: Sprint 6 - Quality & Stability Tasks
type: tasks
status: draft
created: 2025-12-03
updated: 2025-12-03
epic: 6
description: Tasks for fixing tests, TypeScript errors, and cleaning up Unit 1 components.
tags: [sprint-6, quality, testing, cleanup]
---

# Tasks: Sprint 6 - Quality & Stability

## Phase 1: Test Stabilization
- [ ] Fix `DepreciationMethodBuilder.test.tsx` regex selection errors
    - [ ] Use `getAllByText` or more specific queries
- [ ] Fix `InterestCalculationBuilder.test.tsx` regex selection errors
    - [ ] Use `getAllByText` or more specific queries
- [ ] Fix `LessonRenderer.test.tsx` router mounting and prop errors
    - [ ] Mock `useRouter` correctly
    - [ ] Fix missing props in test fixtures
- [ ] Fix `mock-factories.test.ts` Zod validation errors
    - [ ] Ensure `standardId` is generated or optional
- [ ] Fix `app/api/progress/assessment/route.test.ts` status code failures
- [ ] Fix `app/student/lesson/[lessonSlug]/page.test.tsx` Supabase mocking
- [ ] Fix `app/api/lessons/[lessonId]/progress/route.test.ts` status code failures
- [ ] Fix `components/auth/AuthProvider.test.tsx` unhandled rejections

## Phase 2: Type Safety
- [ ] Configure Vitest types in `tsconfig.json`
    - [ ] Add `vitest/globals` or `@types/jest` to types array
- [ ] Fix `SpreadsheetTemplates.test.tsx` undefined object errors
    - [ ] Add null checks or assertions for array access
- [ ] Fix `SupabaseClient` type mismatches in security tests
    - [ ] Align mock client types with `supabase-js` v2
- [ ] Fix `LessonRendererProps` type mismatches in tests

## Phase 3: E2E Verification
- [ ] Implement E2E tests for Teacher Command Center (Bulk Import)
- [ ] Implement E2E tests for Teacher Gradebook View
- [ ] Verify and update Unit 1 Lesson 1 E2E flow

## Phase 4: Unit 1 Component Readiness
- [ ] **Lesson 1 & 2**: Verify `AccountCategorization` matches DB schema.
    - [ ] Ensure dynamic items can be passed via props.
- [ ] **Lesson 3 & 4**: Verify `SpreadsheetActivity` templates.
    - [ ] Test loading "Balance Sheet" template.
    - [ ] Create/Verify "Transaction Log" template.
- [ ] **Lesson 5**: Register `DataCleaningExercise`.
    - [ ] Add `data-cleaning` to `activityRegistry`.
    - [ ] Ensure props support custom datasets.
- [ ] **Lesson 7**: Enable Charting Components.
    - [ ] Add `financial-dashboard` or `chart-builder` to `activityRegistry`.
    - [ ] Verify `BarChart` renders with static data props.
- [ ] **Lesson 11**: Verify `ComprehensionCheck`.
    - [ ] Test multiple-choice and short-answer modes.
