# Implementation Plan: ClassificationActivity Schema Fix

## Phase 1: Schema and Tests (Red-Green)

### Task 1: Write failing test
- Add `expect(categorizationActivityPropsSchemas['classification']).toBeDefined()` to categorization test block
- Add `expect(activityPropsSchemas['classification']).toBeDefined()` to barrel aggregation test block
- Run tests → confirm failure

### Task 2: Add schema entry
- Add `classificationCategorySchema` and `classificationAccountSchema` sub-schemas to `activities-categorization.ts`
- Add `'classification'` key to `categorizationActivityPropsSchemas` matching ClassificationActivity's destructured shape
- Run tests → confirm pass

## Phase 2: Registry and Verification

### Task 3: Register component
- Import `ClassificationActivity` in `registry.ts`
- Add `'classification': ClassificationActivity` entry
- TypeScript should compile without error now that key exists in the union

### Task 4: Verify all gates
- Run `npm run lint`
- Run relevant tests
- Run `npm run build`
- Fix any failures
