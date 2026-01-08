# Sprint 6: Quality & Stability - Specification

## Problem
We have accumulated significant technical debt:
*   20 failing test files.
*   200+ TypeScript errors.
*   Missing E2E coverage for recent features.

Continuing to build features on this foundation risks regressions and makes debugging significantly harder.

## Solution
Dedicate one sprint (Sprint 6) exclusively to:
1.  **Fixing the Build**: Make `npm test` and `tsc` green.
2.  **Polishing Unit 1**: Ensure the first unit students see is flawless.

## Success Criteria
*   `npm test` passes with 0 failures.
*   `npx tsc --noEmit` returns 0 errors.
*   Teacher Command Center has E2E test coverage.
*   Unit 1 components (`AccountCategorization`, `DataCleaningExercise`, `SpreadsheetActivity`) are verified and registered in `activityRegistry`.

---

## Specification: Sprint 6 - Quality & Stability

### Context
Following the extensive migration in Epic 2 and feature development in Epic 5, the codebase has accumulated technical debt in the form of:
1.  **Failing Tests**: 20 test files are failing, primarily due to regex matching issues, mocking gaps, and router context missing in tests.
2.  **TypeScript Errors**: Over 200 TS errors, largely in test files due to missing type definitions for test runners and loose typing in mocks.
3.  **Component Consistency**: Components used in Unit 1 need a final polish pass to ensure they meet the v2 quality standards before full curriculum rollout.

### Goals
1.  **100% Test Pass Rate**: All unit and integration tests must pass.
2.  **Zero TypeScript Errors**: `tsc --noEmit` must return clean.
3.  **Verified E2E**: Critical paths for Teacher features must be covered by E2E tests.
4.  **Unit 1 Readiness**: Key interactive components for Unit 1 must be polished and bug-free.

### Technical Approach

#### Test Fixes
*   **Regex Matching**: Replace `getByText(/Regex/)` with `getAllByText` where multiple elements exist (e.g., tabs vs headers).
*   **Router Mocking**: Use `next-router-mock` or a custom provider wrapper for components dependent on `useRouter`.
*   **Supabase Mocking**: Ensure `supabase-js` mocks align with the v2 client signature (e.g., chaining `from().select()`).

#### Type Safety
*   **Vitest Globals**: Explicitly add `vitest/globals` to `tsconfig.json` to resolve `describe`, `it`, `expect` errors.
*   **Strict Null Checks**: Add explicit optional chaining (`?.`) or non-null assertions (`!`) where test data is guaranteed but TS cannot infer it.

#### Component Readiness (Unit 1 Focus)
*   **Registry Updates**:
    *   Add `DataCleaningExercise` to `lib/activities/registry.ts` (key: `data-cleaning`).
    *   Add `FinancialDashboard` or `BarChart` to registry (key: `financial-dashboard`).
*   **Component Verification**:
    *   **AccountCategorization**: Ensure it accepts a list of items via `props` (not hardcoded).
    *   **SpreadsheetActivity**: Verify "Balance Sheet" and "Transaction Log" templates load correctly.
    *   **ComprehensionCheck**: Confirm it handles the assessment question types defined in the schema.
