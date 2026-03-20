# Implementation Plan: Trial Balance Error Analysis Family (G)

## Phase 1 — Error Pattern Library

- [x] Task: Build error pattern library (`lib/practice/engine/errors.ts`)
    - [x] Write unit tests: each archetype produces valid error data (correct entry, error type, affected side, correct vs erroneous amount); variant generation by changing underlying entry and amounts
    - [x] Implement typed error archetype catalog (wrong side, wrong amount, double post, both-sides-wrong, omission, transposition, slide)
    - [x] Implement variant generation helpers
    - [x] Verify: `npm run lint` and tests pass

## Phase 2 — Family G Generator, Solver, and Grader

- [x] Task: Build Family G generator (`lib/practice/engine/families/trial-balance-errors.ts`)
    - [x] Write unit tests: generates 3-6 scenario problems per seed, deterministic, respects config (error type mix, amount ranges, include-balanced scenarios)
    - [x] Implement generator drawing from error pattern library
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Build Family G solver and grader
    - [x] Write unit tests: solver correctly determines balance/imbalance for all archetypes, handles transposition divisibility, handles compound cases; grader scores per-scenario with misconception tags
    - [x] Implement solver
    - [x] Implement grader with per-scenario three-part scoring (balanced?, difference, larger column)
    - [x] Verify: `npm run lint` and tests pass

## Phase 3 — Integration and UI

- [x] Task: Wire Family G to practice.v1 envelope and worksheet-card UI
    - [x] Write integration test: full round-trip (generate -> solve -> grade -> toEnvelope)
    - [x] Implement toEnvelope, register familyKey `trial-balance-errors`
    - [x] Implement adapter to worksheet-card props (rows: scenarios, columns: balanced?/difference/larger)
    - [x] Update preview route with Family G sample
    - [x] Verify: `npm run lint` and tests pass

## Phase 4 — Final Verification

- [x] Task: Update family key registry and final verification
    - [x] Update practice-component-contract.md: mark family G as `implemented`
    - [x] Run `npm run lint`, `npm test`, and `vinext build`
    - [x] Verify all acceptance criteria are met
    - [x] Update lessons-learned.md and tech-debt.md if warranted
