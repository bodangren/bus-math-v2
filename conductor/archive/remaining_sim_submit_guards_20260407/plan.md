# Implementation Plan: Remaining Simulation Double-Submit Guards

## Phase 1: HIGH — AssetTimeMachine and CapitalNegotiation

### Tasks

1. [x] Write source-level test verifying submittedRef guard pattern in AssetTimeMachine
2. [x] Implement submittedRef guard in AssetTimeMachine handleAction
3. [x] Reset submittedRef in AssetTimeMachine "Back to Lesson" button
4. [x] Write source-level test verifying submittedRef guard pattern in CapitalNegotiation
5. [x] Implement submittedRef guard in CapitalNegotiation handleFinalize
6. [x] Reset submittedRef in CapitalNegotiation reset function
7. [x] Verify: lint, tests, build for Phase 1

## Phase 2: HIGH — CafeSupplyChaos and ScenarioSwitchShowTell

### Tasks

1. [x] Write source-level test verifying submittedRef guard pattern in CafeSupplyChaos
2. [x] Implement submittedRef guard in CafeSupplyChaos handleNextDay
3. [x] Reset submittedRef in CafeSupplyChaos reset function
4. [x] Write source-level test verifying submittedRef guard pattern in ScenarioSwitchShowTell
5. [x] Implement submittedRef guard in ScenarioSwitchShowTell handleComplete
6. [x] Verify: lint, tests, build for Phase 2

## Phase 3: MEDIUM — PitchPresentationBuilder, PayStructureDecisionLab, InventoryManager

### Tasks

1. [x] Fix submittedRef ordering in PitchPresentationBuilder (check before onSubmit)
2. [x] Fix submittedRef ordering in PayStructureDecisionLab (check before onSubmit)
3. [x] Fix submittedRef ordering in InventoryManager (check before onSubmit)
4. [x] Write source-level tests for MEDIUM components
5. [x] Verify: lint, tests, build for Phase 3
6. [x] Update tech-debt.md and lessons-learned.md
7. [x] Checkpoint commit with git note
