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
- [ ] Write envelope emission test for StartupJourney
- [ ] Write envelope emission test for BudgetBalancer
- [ ] Write envelope emission test for LemonadeStand
- [ ] Verify tests pass, lint passes, build passes

## Phase 3: Test Coverage for BusinessStressTest Edge Cases
- [ ] Write envelope emission test for BusinessStressTest bankruptcy path
- [ ] Write render test for BusinessStressTest
- [ ] Verify tests pass, lint passes, build passes

## Phase 4: Verification and Cleanup
- [ ] Run full test suite
- [ ] Run npm run build
- [ ] Update tech-debt.md (close resolved items)
- [ ] Update lessons-learned.md
- [ ] Commit checkpoint
