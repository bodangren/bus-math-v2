# Implementation Plan: Trial Balance Error Analysis Family (G)

## Phase 1 — Error Pattern Library

- [ ] Task: Build error pattern library (`lib/practice/engine/errors.ts`)
    - [ ] Write unit tests: each archetype produces valid error data (correct entry, error type, affected side, correct vs erroneous amount); variant generation by changing underlying entry and amounts
    - [ ] Implement typed error archetype catalog (wrong side, wrong amount, double post, both-sides-wrong, omission, transposition, slide)
    - [ ] Implement variant generation helpers
    - [ ] Verify: `npm run lint` and tests pass

## Phase 2 — Family G Generator, Solver, and Grader

- [ ] Task: Build Family G generator (`lib/practice/engine/families/trial-balance-errors.ts`)
    - [ ] Write unit tests: generates 3-6 scenario problems per seed, deterministic, respects config (error type mix, amount ranges, include-balanced scenarios)
    - [ ] Implement generator drawing from error pattern library
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build Family G solver and grader
    - [ ] Write unit tests: solver correctly determines balance/imbalance for all archetypes, handles transposition divisibility, handles compound cases; grader scores per-scenario with misconception tags
    - [ ] Implement solver
    - [ ] Implement grader with per-scenario three-part scoring (balanced?, difference, larger column)
    - [ ] Verify: `npm run lint` and tests pass

## Phase 3 — Integration and UI

- [ ] Task: Wire Family G to practice.v1 envelope and SelectionMatrix UI
    - [ ] Write integration test: full round-trip (generate -> solve -> grade -> toEnvelope)
    - [ ] Implement toEnvelope, register familyKey `trial-balance-errors`
    - [ ] Implement adapter to SelectionMatrix props (rows: scenarios, columns: balanced?/difference/larger)
    - [ ] Update preview route with Family G sample
    - [ ] Verify: `npm run lint` and tests pass

## Phase 4 — Final Verification

- [ ] Task: Update family key registry and final verification
    - [ ] Update practice-component-contract.md: mark family G as `implemented`
    - [ ] Run `npm run lint`, `npm test`, and `vinext build`
    - [ ] Verify all acceptance criteria are met
    - [ ] Update lessons-learned.md and tech-debt.md if warranted
