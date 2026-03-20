# Implementation Plan: Classification and Conceptual Practice Families (A, M, K)

## Phase 1 — Family A: Classification and Statement Mapping

- [x] Task: Build Family A generator and solver (`lib/practice/engine/families/classification.ts`)
    - [x] Write unit tests: generates valid item lists from ontology, respects config (category set, item count, confusion-pair density), deterministic per seed
    - [x] Implement generator using account ontology lookups
    - [x] Implement solver returning canonical category assignments
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Build Family A grader
    - [x] Write unit tests: per-item scoring, misconception tags for known confusion pairs, partial credit
    - [x] Implement grader with misconception tagging (e.g., prepaid insurance vs insurance expense)
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Wire Family A to practice.v1 envelope
    - [x] Write integration test: generate -> solve -> grade -> toEnvelope round-trip
    - [x] Implement toEnvelope mapping
    - [x] Register familyKey `classification` in activity registry
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Connect Family A to CategorizationList UI
    - [x] Write component test: CategorizationList renders Family A generator output, emits correct response shape
    - [x] Implement adapter/props mapping from Family A definition to CategorizationList input
    - [x] Update preview route with Family A sample
    - [x] Verify: `npm run lint` and tests pass

## Phase 2 — Family M: Normal Balances and Account Nature

- [x] Task: Build Family M generator, solver, and grader (`lib/practice/engine/families/normal-balance.ts`)
    - [x] Write unit tests: generates account lists with correct normal balances, handles contra accounts, deterministic per seed
    - [x] Implement generator, solver, and grader with contra-account misconception tags
    - [x] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family M to practice.v1 envelope and SelectionMatrix UI
    - [ ] Write integration test: full round-trip and UI rendering with debit/credit columns
    - [ ] Implement toEnvelope mapping and register familyKey `normal-balance`
    - [ ] Implement adapter from Family M definition to SelectionMatrix props
    - [ ] Update preview route with Family M sample
    - [ ] Verify: `npm run lint` and tests pass

## Phase 3 — Family K: Effects of Missing Adjustments

- [ ] Task: Build simplified adjustment scenario generator for Family K (`lib/practice/engine/families/adjustment-effects.ts`)
    - [ ] Write unit tests: generates adjustment scenarios (accrual, deferral, depreciation), computes correct effect matrix
    - [ ] Implement local adjustment scenario generator (simplified; does not need to match Family J's full generator interface)
    - [ ] Implement solver deriving 6-element effect classification from the adjustment
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build Family K grader and envelope
    - [ ] Write unit tests: per-element scoring, misconception tags for common reversal errors
    - [ ] Implement grader and toEnvelope mapping
    - [ ] Register familyKey `adjustment-effects`
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Connect Family K to SelectionMatrix UI
    - [ ] Write component test: SelectionMatrix renders effect matrix (6 rows x 3 columns), emits correct response shape
    - [ ] Implement adapter from Family K definition to SelectionMatrix props
    - [ ] Update preview route with Family K sample
    - [ ] Verify: `npm run lint` and tests pass

## Phase 4 — Final Verification

- [ ] Task: Update family key registry and final verification
    - [ ] Update practice-component-contract.md: mark families A, M, K as `implemented`
    - [ ] Run `npm run lint`, `npm test`, and `vinext build`
    - [ ] Verify all acceptance criteria are met
    - [ ] Update lessons-learned.md and tech-debt.md if warranted
