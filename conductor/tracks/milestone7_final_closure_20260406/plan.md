# Implementation Plan: Milestone 7 Final Closure

## Phase 1: Envelope Test Quality — Add `status` and `parts` Assertions (8 test files)

**Goal:** All simulation envelope tests assert required fields `status` and `parts` (length > 0).

### Tasks

1. **BusinessStressTest.test.tsx — add status/parts assertions**
   - [ ] Read current test, identify envelope assertion block
   - [ ] Add `expect(envelope).toHaveProperty('status', 'submitted')` to both envelope tests
   - [ ] Add `expect(envelope.parts.length).toBeGreaterThan(0)` to both envelope tests
   - [ ] Write test: verify assertions pass

2. **LemonadeStand.test.tsx — add status/parts assertions**
   - [ ] Add `status` and `parts` assertions to envelope test
   - [ ] Verify test passes

3. **BudgetBalancer.test.tsx — add status/parts assertions**
   - [ ] Add `status` and `parts` assertions to envelope test
   - [ ] Verify test passes

4. **StartupJourney.test.tsx — add activityId/status/parts assertions**
   - [ ] Add `activityId`, `status`, and `parts` assertions to envelope test
   - [ ] Verify test passes

5. **CapitalNegotiation.test.tsx — add status/parts assertions**
   - [ ] Add `status` and `parts` assertions to envelope test
   - [ ] Verify test passes

6. **CafeSupplyChaos.test.tsx — add status/parts assertions**
   - [ ] Add `status` and `parts` assertions to envelope test
   - [ ] Verify test passes

7. **AssetTimeMachine.test.tsx — add status/parts assertions**
   - [ ] Add `status` and `parts` assertions to envelope test
   - [ ] Verify test passes

8. **NotebookOrganizer.test.tsx — add status/parts assertions**
   - [ ] Add `status` and `parts` assertions to envelope test
   - [ ] Verify test passes

9. **Phase verification**
   - [ ] Run `npm run lint`
   - [ ] Run full test suite
   - [ ] Run `npm run build`
   - [ ] Commit and push

## Phase 2: Simulation Input Validation — NaN/Empty Guards

**Goal:** AssetRegisterSimulator, DepreciationMethodComparisonSimulator, and MethodComparisonSimulator reject NaN inputs.

### Tasks

1. **AssetRegisterSimulator — NaN guard**
   - [ ] Read current component, identify submit handler
   - [ ] Add NaN/empty check before envelope construction
   - [ ] Write test: NaN input rejected, envelope not emitted
   - [ ] Verify existing tests pass

2. **DepreciationMethodComparisonSimulator — NaN guard**
   - [ ] Read current component, identify submit handler
   - [ ] Add NaN/empty check before envelope construction
   - [ ] Write test: NaN input rejected
   - [ ] Verify existing tests pass

3. **MethodComparisonSimulator — NaN guard**
   - [ ] Read current component, identify submit handler
   - [ ] Add NaN/empty check before envelope construction
   - [ ] Write test: NaN input rejected
   - [ ] Verify existing tests pass

4. **Phase verification**
   - [ ] Run `npm run lint`
   - [ ] Run full test suite
   - [ ] Run `npm run build`
   - [ ] Commit and push

## Phase 3: GrowthPuzzle Double-Submit Guard

**Goal:** GrowthPuzzle has defense-in-depth `submitted` state guard.

### Tasks

1. **GrowthPuzzle — add submitted state guard**
   - [ ] Read current GrowthPuzzle.tsx
   - [ ] Add `const [submitted, setSubmitted] = useState(false)`
   - [ ] Guard onSubmit callback with `if (submitted) return`
   - [ ] Set `submitted = true` before calling onSubmit
   - [ ] Add `disabled={submitted || isComplete}` to submit button
   - [ ] Write test: double-click does not emit duplicate envelope
   - [ ] Verify existing tests pass

2. **Phase verification**
   - [ ] Run `npm run lint`
   - [ ] Run full test suite
   - [ ] Run `npm run build`
   - [ ] Commit and push

## Phase 4: Exercise Component Polish and Final Verification

**Goal:** Fix StraightLineMastery re-shuffle, CapitalizationExpenseMastery feedback, and DDB catch-up.

### Tasks

1. **StraightLineMastery — useMemo shuffle fix**
   - [ ] Read current component
   - [ ] Move `options.sort(() => Math.random() - 0.5)` to `useMemo` keyed on problem
   - [ ] Write test: options stable across re-renders
   - [ ] Verify existing tests pass

2. **CapitalizationExpenseMastery — Show Example fix**
   - [ ] Read current component
   - [ ] Separate "Show Example" from `submitted` state
   - [ ] Show example answer without marking as incorrect
   - [ ] Write test: Show Example does not set submitted
   - [ ] Verify existing tests pass

3. **DDBComparisonMastery — final-year catch-up**
   - [ ] Read current component, find DDB schedule computation
   - [ ] Add final-year catch-up: if book value < salvage, adjust final depreciation
   - [ ] Write test: final book value equals salvage value
   - [ ] Verify existing tests pass

4. **Final verification**
   - [ ] Run `npm run lint`
   - [ ] Run full test suite
   - [ ] Run `npm run build`
   - [ ] Update tech-debt.md (close resolved items)
   - [ ] Update lessons-learned.md if applicable
   - [ ] Commit checkpoint and archive track
