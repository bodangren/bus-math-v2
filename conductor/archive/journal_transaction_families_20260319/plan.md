# Implementation Plan: Journal Entry and Transaction Practice Families (C, F, H, L, P)

## Phase 1 — Shared Infrastructure: Transaction Event Library and Merchandising Timeline

- [x] Task: Build transaction event library (`lib/practice/engine/transactions.ts`)
    - [x] Write unit tests: each archetype produces valid account effects, direction, amount rules; variant generation by label/amount/context
    - [x] Implement typed transaction archetype catalog (owner invests, earns revenue cash/on-account, collects receivable, pays payable, pays expense, purchases supplies/equipment cash/on-account, receives advance, owner withdraws)
    - [x] Implement variant generation helpers (swap labels, amounts, cash vs on-account, service vs merchandise)
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Build merchandising timeline generator (`lib/practice/engine/merchandising.ts`)
    - [x] Write unit tests: seller and buyer timelines, discount eligibility, FOB freight allocation, return-before-discount, deterministic per seed
    - [x] Implement timeline generator with parameters: role, inventory system, discount method, amounts, terms, freight, FOB
    - [x] Implement timeline solver: processes events in order, emits journal lines per date
    - [x] Verify: `npm run lint` and tests pass

## Phase 2 — Families C and F: Transaction Analysis

- [x] Task: Build Family C generator, solver, and grader (`lib/practice/engine/families/transaction-effects.ts`)
    - [x] Write unit tests: generates transaction scenarios from event library, multi-output grading (accounts affected, direction, amount, equity reason)
    - [x] Implement generator drawing from transaction event library
    - [x] Implement solver and grader with per-output misconception tags
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Wire Family C to practice.v1 envelope and SelectionMatrix UI
    - [x] Write integration test: full round-trip
    - [x] Implement toEnvelope, register familyKey `transaction-effects`
    - [x] Implement adapter to SelectionMatrix props (rows: accounts/categories, columns: increase/decrease/no effect)
    - [x] Update preview route
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Build Family F generator, solver, and grader (`lib/practice/engine/families/transaction-matrix.ts`)
    - [x] Write unit tests: compound table output captures intermediate reasoning (account, direction, amount, equity reason)
    - [x] Implement generator reusing event library, exposing structured scaffold
    - [x] Implement solver and grader
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Wire Family F to practice.v1 envelope and SelectionMatrix UI
    - [x] Write integration test: full round-trip
    - [x] Implement toEnvelope, register familyKey `transaction-matrix`
    - [x] Implement adapter to SelectionMatrix props (multi-column grid)
    - [x] Update preview route
    - [x] Verify: `npm run lint` and tests pass

## Phase 3 — Family H: Journal Entry Recording

- [x] Task: Build Family H transaction ontology and generator (`lib/practice/engine/families/journal-entry.ts`)
    - [x] Write unit tests: generates problems for each transaction category (service, owner, asset purchase, liability settlement, accrual/deferral, depreciation, closing, correcting, reversing, merchandising sale/purchase, return/allowance, discount)
    - [x] Implement generator with transaction-category config
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Build Family H solver and grader
    - [x] Write unit tests: balance checking, row-level grading, equivalent-entry tolerance for correcting entries, merchandising paired revenue/inventory entries
    - [x] Implement solver producing canonical journal lines
    - [x] Implement grader with row-level scoring and balance validation
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Wire Family H to practice.v1 envelope and JournalEntryTable UI
    - [x] Write integration test: full round-trip including multi-date entries
    - [x] Implement toEnvelope, register familyKey `journal-entry`
    - [x] Implement adapter from Family H definition to JournalEntryTable props
    - [x] Update preview route
    - [x] Verify: `npm run lint` and tests pass

## Phase 4 — Families L and P: Cycle Decisions and Merchandising Entries

- [x] Task: Build Family L generator, solver, and grader (`lib/practice/engine/families/cycle-decisions.ts`)
    - [x] Write unit tests: closing entries from adjusted trial balance, reversing-entry selection with "reversing recommended" tagging, correcting entries
    - [x] Implement generator modeling period-end account status
    - [x] Implement solver for closing, correcting, and reversing entries
    - [x] Implement grader with per-entry scoring
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Wire Family L to practice.v1 envelope and UI
    - [x] Write integration test: selection tasks via SelectionMatrix, entry tasks via JournalEntryTable
    - [x] Implement toEnvelope, register familyKey `cycle-decisions`
    - [x] Implement adapters for both UI components
    - [x] Update preview route
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Build Family P generator, solver, and grader (`lib/practice/engine/families/merchandising-entries.ts`)
    - [x] Write unit tests: seller perpetual (revenue + inventory sides), buyer gross vs net method, multi-date timelines, freight entries
    - [x] Implement generator consuming merchandising timeline generator
    - [x] Implement solver and grader with paired-entry awareness
    - [x] Verify: `npm run lint` and tests pass

- [x] Task: Wire Family P to practice.v1 envelope and JournalEntryTable UI
    - [x] Write integration test: full round-trip with multi-date merchandising entries
    - [x] Implement toEnvelope, register familyKey `merchandising-entries`
    - [x] Implement adapter to JournalEntryTable props
    - [x] Update preview route
    - [x] Verify: `npm run lint` and tests pass

## Phase 5 — Final Verification

- [x] Task: Update family key registry and final verification
    - [x] Update practice-component-contract.md: mark families C, F, H, L, P as `implemented`
    - [x] Run `npm run lint`, `npm test`, and `vinext build`
    - [x] Verify all acceptance criteria are met
    - [x] Update lessons-learned.md and tech-debt.md if warranted
