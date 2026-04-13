# Plan: Simulation Activity Type Standardization

## Phase 1: Fix StartupJourney and BudgetBalancer (most egregious violations)

- [ ] Read StartupJourney.tsx to understand current type structure
- [ ] Fix StartupJourney to use canonical Activity type pattern
- [ ] Read BudgetBalancer.tsx to understand current type structure
- [ ] Fix BudgetBalancer to use canonical Activity type pattern
- [ ] Run `npm run lint` to verify no errors
- [ ] Run `npm run build` to verify compilation
- [ ] Run `npm test` to verify no regressions

## Phase 2: Fix CashFlowChallenge

- [ ] Read CashFlowChallenge.tsx to understand current type structure
- [ ] Fix CashFlowChallenge to use canonical Activity type pattern
- [ ] Run `npm run lint` to verify no errors
- [ ] Run `npm run build` to verify compilation
- [ ] Run `npm test` to verify no regressions

## Phase 3: Fix DynamicMethodSelector and MethodComparisonSimulator

- [ ] Read both files to understand current type structures
- [ ] Fix DynamicMethodSelector to use canonical Activity type pattern
- [ ] Fix MethodComparisonSimulator to use canonical Activity type pattern
- [ ] Run `npm run lint` to verify no errors
- [ ] Run `npm run build` to verify compilation
- [ ] Run `npm test` to verify no regressions

## Phase 4: Fix AssetRegisterSimulator and DepreciationMethodComparisonSimulator

- [ ] Read both files to understand current type structures
- [ ] Fix AssetRegisterSimulator to use canonical Activity type pattern
- [ ] Fix DepreciationMethodComparisonSimulator to use canonical Activity type pattern
- [ ] Run `npm run lint` to verify no errors
- [ ] Run `npm run build` to verify compilation
- [ ] Run `npm test` to verify no regressions

## Phase 5: Final Verification

- [ ] Run full `npm run lint` across entire project
- [ ] Run `npm run build` to verify full compilation
- [ ] Run `npm test` to verify all tests pass
- [ ] Update tech-debt.md to mark item as closed
- [ ] Archive track