# Spec: Practice Simulation Contract Hardening

## Overview
Milestone 7 requires every practice component to emit canonical `practice.v1` envelopes. While 9 of 13 simulation components now emit envelopes, only CashFlowChallenge and NotebookOrganizer have tests verifying envelope structure. This track adds missing envelope emission tests and fixes the remaining contract compliance gaps.

## Functional Requirements
1. All simulation components that emit `practice.v1` envelopes must have test coverage verifying `contractVersion`, `artifact.kind`, and basic envelope shape.
2. AssetTimeMachine "Back to Lesson" button must reset game state to allow clean replay.
3. CashFlowChallenge must use `activity.id` instead of hardcoded `'cash-flow-challenge'`.

## Non-Functional Requirements
- Tests follow the CashFlowChallenge envelope test pattern (render → trigger completion → assert onSubmit envelope shape).
- No changes to component behavior beyond the specific fixes listed.
- All changes pass `npm run lint`, `npm run build`, and relevant test subsets.

## Acceptance Criteria
- [ ] AssetTimeMachine: test file exists with envelope emission test
- [ ] BusinessStressTest: test file exists with envelope emission test (both survival and bankruptcy paths)
- [ ] CafeSupplyChaos: test file exists with envelope emission test
- [ ] CapitalNegotiation: test file exists with envelope emission test
- [ ] AssetTimeMachine reset resets game state
- [ ] CashFlowChallenge uses activity.id instead of hardcoded slug

## Out of Scope
- Adding envelope emission to simulations that don't currently emit (InventoryManager, PitchPresentationBuilder, GrowthPuzzle, PayStructureDecisionLab).
- Adding Zod schema adoption to simulations using inline interfaces.
- StartupJourney/BudgetBalancer/LemonadeStand envelope test coverage (Phase 2).
