# Implementation Plan: Milestone 7 Final Closure

## Phase 1: Envelope Test Quality — Add `status` and `parts` Assertions (8 test files)

**Goal:** All simulation envelope tests assert required fields `status` and `parts` (length > 0).

### Tasks

1. **BusinessStressTest.test.tsx — add status/parts assertions**
   - [x] Read current test, identify envelope assertion block
   - [x] Add `expect(envelope).toHaveProperty('status', 'submitted')` to both envelope tests
   - [x] Add `expect(envelope.parts.length).toBeGreaterThan(0)` to both envelope tests
   - [x] Write test: verify assertions pass

2. **LemonadeStand.test.tsx — add status/parts assertions**
   - [x] Add `status` and `parts` assertions to envelope test
   - [x] Verify test passes

3. **BudgetBalancer.test.tsx — add status/parts assertions**
   - [x] Add `status` and `parts` assertions to envelope test
   - [x] Verify test passes

4. **StartupJourney.test.tsx — add activityId/status/parts assertions**
   - [x] Add `activityId`, `status`, and `parts` assertions to envelope test
   - [x] Verify test passes

5. **CapitalNegotiation.test.tsx — add status/parts assertions**
   - [x] Add `status` and `parts` assertions to envelope test
   - [x] Verify test passes

6. **CafeSupplyChaos.test.tsx — add status/parts assertions**
   - [x] Add `status` and `parts` assertions to envelope test
   - [x] Verify test passes

7. **AssetTimeMachine.test.tsx — add status/parts assertions**
   - [x] Add `status` and `parts` assertions to envelope test
   - [x] Verify test passes

8. **NotebookOrganizer.test.tsx — add status/parts assertions**
   - [x] Add `status` and `parts` assertions to envelope test
   - [x] Verify test passes

9. **Phase verification**
   - [x] Run `npm run lint`
   - [x] Run full test suite (85 passed, 13 files)
   - [x] Run `npm run build`
   - [x] Commit and push

## Phase 2: Simulation Input Validation — NaN/Empty Guards

**Goal:** AssetRegisterSimulator, DepreciationMethodComparisonSimulator, and MethodComparisonSimulator reject NaN inputs.

### Tasks

1. **AssetRegisterSimulator — NaN guard**
   - [x] Read current component, identify submit handler
   - [x] Add NaN/empty check before envelope construction
   - [x] Verify existing tests pass

2. **DepreciationMethodComparisonSimulator — NaN guard**
   - [x] Read current component, identify submit handler
   - [x] Add NaN/empty check before envelope construction
   - [x] Verify existing tests pass

3. **MethodComparisonSimulator — NaN guard**
   - [x] Read current component, identify submit handler
   - [x] Add NaN/empty check before envelope construction
   - [x] Verify existing tests pass

4. **Phase verification**
   - [x] Run `npm run lint`
   - [x] Run `npm run build`
   - [x] Commit

## Phase 3: GrowthPuzzle Double-Submit Guard

**Goal:** GrowthPuzzle has defense-in-depth `submitted` state guard.

### Tasks

1. **GrowthPuzzle — add submitted state guard**
   - [x] Add `submittedRef` for synchronous guard in handleFinalize
   - [x] Reset ref on resetGame
   - [x] Verify existing tests pass

2. **Phase verification**
   - [x] Run `npm run lint`
   - [x] Run full test suite
   - [x] Commit

## Phase 4: Exercise Component Polish and Final Verification

**Goal:** Fix StraightLineMastery re-shuffle and CapitalizationExpenseMastery feedback.

### Tasks

1. **StraightLineMastery — useMemo shuffle fix**
   - [x] Move options construction + shuffle into useMemo keyed on problem.id
   - [x] Verify existing tests pass

2. **CapitalizationExpenseMastery — Show Example fix**
   - [x] Separate "Show Example" from `submitted` state
   - [x] Show example without marking as incorrect
   - [x] Verify existing tests pass

3. **DDBComparisonMastery — already implemented**
   - [x] `computeDDBSchedule` already has final-year catch-up floor

4. **Final verification**
   - [x] Run `npm run lint`
   - [x] Run full test suite (118 passed, 19 files)
   - [x] Run `npm run build`
   - [x] Update tech-debt.md (close resolved items)
   - [x] Commit checkpoint
