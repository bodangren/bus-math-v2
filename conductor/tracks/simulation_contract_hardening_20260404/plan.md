# Implementation Plan: Practice Simulation Contract Hardening

## Phase 1: Envelope Emission Tests for Untested Simulations
- [x] Write failing envelope emission test for AssetTimeMachine
- [x] Write failing envelope emission test for BusinessStressTest (survival path)
- [x] Write failing envelope emission test for CafeSupplyChaos
- [x] Write failing envelope emission test for CapitalNegotiation
- [x] Fix AssetTimeMachine reset bug (reset game state on "Back to Lesson")
- [~] Fix CashFlowChallenge hardcoded activityId (deferred: requires props interface refactor)
- [x] Verify tests pass, lint passes, build passes

## Phase 2: Envelope Tests for Existing Tested Simulations
- [x] Write envelope emission test for StartupJourney
- [x] Write envelope emission test for BudgetBalancer
- [x] Write envelope emission test for LemonadeStand
- [x] Verify tests pass, lint passes, build passes

## Phase 3: Test Coverage for BusinessStressTest Edge Cases
- [x] Write envelope emission test for BusinessStressTest bankruptcy path
- [x] Write render test for BusinessStressTest (already existed from Phase 1)
- [x] Verify tests pass, lint passes, build passes

## Phase 4: Verification and Cleanup
- [x] Run full test suite (1373 passed, 2 pre-existing Supabase failures)
- [x] Run npm run build
- [x] Update tech-debt.md (no new items needed; all resolved items already closed)
- [x] Update lessons-learned.md (no new lessons; bankruptcy envelope follows established pattern)
- [x] Commit checkpoint
