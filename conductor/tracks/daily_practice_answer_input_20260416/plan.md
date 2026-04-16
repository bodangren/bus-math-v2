# Implementation Plan: DailyPracticeSession Interactive Answer Input

## [x] Phase 1: Registry infrastructure + accounting-equation numeric input

**Goal:** Establish the answer-input component registry and implement the first interactive input.

**Completed:** 2026-04-16

### Tasks
1. [x] Define `DailyPracticeAnswerInput` type and `dailyPracticeInputRegistry` in `lib/srs/answer-inputs/registry.ts`.
2. [x] Build `AccountingEquationInput` component in `components/student/answer-inputs/AccountingEquationInput.tsx`:
   - Display the two visible facts from the definition.
   - Render a single numeric input for the hidden term.
   - On submit, call `family.grade(definition, studentResponse)`.
   - Show correct/incorrect result with the expected value.
3. [x] Update `DailyPracticeSession` to look up the family in the registry; if found, render the input component. If not found, keep the current auto-solve `ProblemRenderer`.
4. [x] Write tests:
   - `__tests__/lib/srs/answer-inputs/registry.test.ts`
   - `__tests__/components/student/answer-inputs/AccountingEquationInput.test.tsx`
   - Update `__tests__/components/student/DailyPracticeSession.test.tsx` to verify registry lookup behavior.
5. [x] Run lint, tests, build. Commit phase checkpoint.

**Verification:** lint 0 errors/2 pre-existing warnings, 2175/2175 tests pass, build clean. k2p5 verified.

## Phase 2: normal-balance selection input

**Goal:** Implement debit/credit selection for normal-balance practice.

### Tasks
1. Build `NormalBalanceInput` component:
   - List each account with Debit/Credit buttons or radio group.
   - Track student selections in component state.
   - Grade on submit and show per-account results.
2. Register `NormalBalanceInput` in the registry.
3. Write tests for `NormalBalanceInput`.
4. Run lint, tests, build. Commit phase checkpoint.

## Phase 3: classification categorization input

**Goal:** Implement category selection for classification practice.

### Tasks
1. Build `ClassificationInput` component:
   - Show each account with a dropdown/select for category.
   - Use categories from the definition.
   - Grade on submit and show per-item results.
2. Register `ClassificationInput` in the registry.
3. Write tests for `ClassificationInput`.
4. Run lint, tests, build. Commit phase checkpoint.

## Phase 4: Fallback UX and session polish

**Goal:** Improve the experience for registered families and ensure smooth queue advancement.

### Tasks
1. Add a "Next Problem" button after showing results (instead of auto-advancing immediately).
2. Add basic loading/disabled states during SRS mutation.
3. Ensure focus management moves to the next card when advancing.
4. Update DailyPracticeSession tests for the new flow.
5. Run lint, tests, build. Commit phase checkpoint.

## Phase 5: Verification and track closure

**Goal:** Confirm coverage, clean up, and archive the track.

### Tasks
1. Run full test suite and confirm no regressions.
2. Check build passes cleanly.
3. Update `tech-debt.md` to close the DailyPracticeSession MVP answer input item (or downgrade/close if fully addressed).
4. Update `lessons-learned.md` with any patterns discovered.
5. Update `tracks.md` and archive the track.
6. Final commit and push.
