# Implementation Plan: Practice Contract Completion

## Phase 1: Convert Remaining Simulation Components to practice.v1 Envelopes (5 components)

**Goal:** Every simulation emits the canonical practice.v1 submission envelope.

### Tasks

1. **InventoryManager — practice.v1 envelope**
   - [~] Read current `InventoryManager.tsx`, understand game state shape
   - [ ] Add `onSubmit?: PracticeSubmissionCallbackPayload` prop (import type from contract)
   - [ ] Build envelope on game win using `buildPracticeSubmissionEnvelope` with `familyKey: 'simulation-inventory'`
   - [ ] Map `GameState` fields to `practice.v1` parts (e.g., final profit, inventory decisions)
   - [ ] Write test: envelope emission on game win with correct `contractVersion`, `familyKey`, `parts`
   - [ ] Verify existing tests still pass

2. **PitchPresentationBuilder — practice.v1 envelope**
   - [ ] Read current `PitchPresentationBuilder.tsx`, understand pitch state shape
   - [ ] Add `onSubmit?: PracticeSubmissionCallbackPayload` prop
   - [ ] Build envelope on presentation submit using `buildPracticeSubmissionEnvelope` with `familyKey: 'simulation-pitch'`
   - [ ] Map pitch state to practice parts
   - [ ] Write test: envelope emission on submit
   - [ ] Verify existing tests still pass

3. **GrowthPuzzle — practice.v1 envelope**
   - [ ] Read current `GrowthPuzzle.tsx`, understand onComplete callback shape
   - [ ] Add `onSubmit?: PracticeSubmissionCallbackPayload` prop
   - [ ] Build envelope from selections/stats using `buildPracticeSubmissionEnvelope` with `familyKey: 'simulation-growth-puzzle'`
   - [ ] Write test: envelope emission on completion
   - [ ] Verify existing tests still pass

4. **PayStructureDecisionLab — practice.v1 envelope**
   - [ ] Read current `PayStructureDecisionLab.tsx`, understand component shape
   - [ ] Wire `activity` prop, add `onSubmit?: PracticeSubmissionCallbackPayload`
   - [ ] Build envelope from decisions using `buildPracticeSubmissionEnvelope` with `familyKey: 'simulation-pay-structure'`
   - [ ] Write test: envelope emission on submit
   - [ ] Verify existing tests still pass

5. **FeedbackCollector — practice.v1 envelope**
   - [ ] Read current `FeedbackCollector.tsx`, understand StakeholderFeedback shape
   - [ ] Add `onSubmit?: PracticeSubmissionCallbackPayload` prop
   - [ ] Wrap feedback in `buildPracticeSubmissionEnvelope` with `familyKey: 'quiz-feedback'`
   - [ ] Write test: envelope emission on submit
   - [ ] Verify existing tests still pass

6. **CashFlowChallenge cleanup**
   - [ ] Remove `onSubmitLegacy` prop
   - [ ] Replace hardcoded `activityId: 'cash-flow-challenge'` with `activity.id`
   - [ ] Update tests to remove legacy callback assertions

7. **Phase verification**
   - [ ] Run `npm run lint`
   - [ ] Run full test suite
   - [ ] Run `npm run build`
   - [ ] Commit and push

## Phase 2: Misconception Tag Taxonomy and Family Engine Integration

**Goal:** Misconception tags are populated in practice.v1 envelopes for common accounting errors.

### Tasks

1. **Create misconception taxonomy**
   - [ ] Create `lib/practice/misconception-taxonomy.ts` with tag definitions
   - [ ] Include tags: debit-credit-reversal, omitted-entry, wrong-normal-balance, sign-error, classification-error, wrong-account-type, computation-error, incomplete-entry
   - [ ] Export type-safe tag constants and a lookup helper

2. **Wire taxonomy into top family engines**
   - [ ] Statement completion families (D, Q): detect debit/credit reversals, wrong account types
   - [ ] Classification families (A, M, K): detect classification errors
   - [ ] Journal entry families (C, F, H, L, P): detect reversals, omissions, sign errors
   - [ ] Computation families (B, E, I, J, N, O): detect computation errors, sign errors
   - [ ] Write tests for at least 3 families asserting specific misconception tags

3. **Phase verification**
   - [ ] Run `npm run lint`
   - [ ] Run full test suite
   - [ ] Run `npm run build`
   - [ ] Commit and push

## Phase 3: Teacher Error Summary Dashboard

**Goal:** Teachers can view per-lesson class-wide error summaries from the UI.

### Tasks

1. **Create teacher error summary component**
   - [ ] Create `components/teacher/LessonErrorSummary.tsx`
   - [ ] Call `/api/teacher/error-summary` for lesson-level data
   - [ ] Show top misconceptions with counts and affected student list
   - [ ] Show per-part accuracy rates
   - [ ] Add "AI Insights" section that calls `/api/teacher/ai-error-summary` (graceful null)

2. **Wire into teacher monitoring route**
   - [ ] Find existing teacher lesson detail page
   - [ ] Add error summary component to the page
   - [ ] Ensure it loads after submission data is available

3. **Phase verification**
   - [ ] Run `npm run lint`
   - [ ] Run full test suite
   - [ ] Run `npm run build`
   - [ ] Commit and push

## Phase 4: SpreadsheetActivity practice.v1 Path and Full Verification

**Goal:** SpreadsheetActivity emits practice.v1 alongside legacy persistence, and full verification passes.

### Tasks

1. **SpreadsheetActivity practice.v1 path**
   - [ ] Read `SpreadsheetActivity.tsx` and `SpreadsheetActivityAdapter`
   - [ ] Add `practice.v1` envelope emission alongside legacy persistence
   - [ ] Write test: envelope emission with spreadsheet artifact data

2. **Final verification**
   - [ ] Run `npm run lint`
   - [ ] Run full test suite
   - [ ] Run `npm run build`
   - [ ] Verify all 5 acceptance criteria
   - [ ] Commit, push, and archive track
