# Implementation Plan: Journal Entry and Transaction Practice Families (C, F, H, L, P)

## Phase 1 — Shared Infrastructure: Transaction Event Library and Merchandising Timeline

- [ ] Task: Build transaction event library (`lib/practice/engine/transactions.ts`)
    - [ ] Write unit tests: each archetype produces valid account effects, direction, amount rules; variant generation by label/amount/context
    - [ ] Implement typed transaction archetype catalog (owner invests, earns revenue cash/on-account, collects receivable, pays payable, pays expense, purchases supplies/equipment cash/on-account, receives advance, owner withdraws)
    - [ ] Implement variant generation helpers (swap labels, amounts, cash vs on-account, service vs merchandise)
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build merchandising timeline generator (`lib/practice/engine/merchandising.ts`)
    - [ ] Write unit tests: seller and buyer timelines, discount eligibility, FOB freight allocation, return-before-discount, deterministic per seed
    - [ ] Implement timeline generator with parameters: role, inventory system, discount method, amounts, terms, freight, FOB
    - [ ] Implement timeline solver: processes events in order, emits journal lines per date
    - [ ] Verify: `npm run lint` and tests pass

## Phase 2 — Families C and F: Transaction Analysis

- [ ] Task: Build Family C generator, solver, and grader (`lib/practice/engine/families/transaction-effects.ts`)
    - [ ] Write unit tests: generates transaction scenarios from event library, multi-output grading (accounts affected, direction, amount, equity reason)
    - [ ] Implement generator drawing from transaction event library
    - [ ] Implement solver and grader with per-output misconception tags
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family C to practice.v1 envelope and SelectionMatrix UI
    - [ ] Write integration test: full round-trip
    - [ ] Implement toEnvelope, register familyKey `transaction-effects`
    - [ ] Implement adapter to SelectionMatrix props (rows: accounts/categories, columns: increase/decrease/no effect)
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build Family F generator, solver, and grader (`lib/practice/engine/families/transaction-matrix.ts`)
    - [ ] Write unit tests: compound table output captures intermediate reasoning (account, direction, amount, equity reason)
    - [ ] Implement generator reusing event library, exposing structured scaffold
    - [ ] Implement solver and grader
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family F to practice.v1 envelope and SelectionMatrix UI
    - [ ] Write integration test: full round-trip
    - [ ] Implement toEnvelope, register familyKey `transaction-matrix`
    - [ ] Implement adapter to SelectionMatrix props (multi-column grid)
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

## Phase 3 — Family H: Journal Entry Recording

- [ ] Task: Build Family H transaction ontology and generator (`lib/practice/engine/families/journal-entry.ts`)
    - [ ] Write unit tests: generates problems for each transaction category (service, owner, asset purchase, liability settlement, accrual/deferral, depreciation, closing, correcting, reversing, merchandising sale/purchase, return/allowance, discount)
    - [ ] Implement generator with transaction-category config
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build Family H solver and grader
    - [ ] Write unit tests: balance checking, row-level grading, equivalent-entry tolerance for correcting entries, merchandising paired revenue/inventory entries
    - [ ] Implement solver producing canonical journal lines
    - [ ] Implement grader with row-level scoring and balance validation
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family H to practice.v1 envelope and JournalEntryTable UI
    - [ ] Write integration test: full round-trip including multi-date entries
    - [ ] Implement toEnvelope, register familyKey `journal-entry`
    - [ ] Implement adapter from Family H definition to JournalEntryTable props
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

## Phase 4 — Families L and P: Cycle Decisions and Merchandising Entries

- [ ] Task: Build Family L generator, solver, and grader (`lib/practice/engine/families/cycle-decisions.ts`)
    - [ ] Write unit tests: closing entries from adjusted trial balance, reversing-entry selection with "reversing recommended" tagging, correcting entries
    - [ ] Implement generator modeling period-end account status
    - [ ] Implement solver for closing, correcting, and reversing entries
    - [ ] Implement grader with per-entry scoring
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family L to practice.v1 envelope and UI
    - [ ] Write integration test: selection tasks via SelectionMatrix, entry tasks via JournalEntryTable
    - [ ] Implement toEnvelope, register familyKey `cycle-decisions`
    - [ ] Implement adapters for both UI components
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build Family P generator, solver, and grader (`lib/practice/engine/families/merchandising-entries.ts`)
    - [ ] Write unit tests: seller perpetual (revenue + inventory sides), buyer gross vs net method, multi-date timelines, freight entries
    - [ ] Implement generator consuming merchandising timeline generator
    - [ ] Implement solver and grader with paired-entry awareness
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Wire Family P to practice.v1 envelope and JournalEntryTable UI
    - [ ] Write integration test: full round-trip with multi-date merchandising entries
    - [ ] Implement toEnvelope, register familyKey `merchandising-entries`
    - [ ] Implement adapter to JournalEntryTable props
    - [ ] Update preview route
    - [ ] Verify: `npm run lint` and tests pass

## Phase 5 — Final Verification

- [ ] Task: Update family key registry and final verification
    - [ ] Update practice-component-contract.md: mark families C, F, H, L, P as `implemented`
    - [ ] Run `npm run lint`, `npm test`, and `vinext build`
    - [ ] Verify all acceptance criteria are met
    - [ ] Update lessons-learned.md and tech-debt.md if warranted
