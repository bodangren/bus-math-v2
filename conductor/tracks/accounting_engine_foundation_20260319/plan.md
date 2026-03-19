# Implementation Plan: Accounting Domain Engine Foundation

## Phase 1 — Account Ontology and Engine Types

- [ ] Task: Define practice engine types (`lib/practice/engine/types.ts`)
    - [ ] Write unit tests for ProblemFamily interface contract (type-level and runtime shape validation)
    - [ ] Implement ProblemFamily<TDefinition, TResponse> generic interface
    - [ ] Implement GradeResult type with per-part scoring and misconception tags
    - [ ] Implement toEnvelope helper type that maps to PracticeSubmissionEnvelope
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build account ontology (`lib/practice/engine/accounts.ts`)
    - [ ] Write unit tests: lookup helpers (byType, byStatement, byNormalBalance, isContra), minimum 40 accounts, all required metadata fields present
    - [ ] Implement typed account record and static account array (>=40 accounts covering service and retail)
    - [ ] Implement lookup helpers
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build mini-ledger generator (`lib/practice/engine/mini-ledger.ts`)
    - [ ] Write unit tests: determinism (same seed -> same output), A = L + OE balance invariant, configurable complexity (account count, contra accounts, beginning/ending capital)
    - [ ] Implement seeded random utility (or reuse existing)
    - [ ] Implement MiniLedger type and generator function
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Implement reference ProblemFamily for contract conformance
    - [ ] Write integration test: generate -> solve -> grade -> toEnvelope round-trip produces valid practice.v1 envelope
    - [ ] Implement a trivial reference family (e.g., a single-part accounting-equation problem using the mini-ledger)
    - [ ] Verify: `npm run lint` and `npm test` pass (broad run — touches shared contract)

## Phase 2 — Compound UI Components

- [ ] Task: Build SelectionMatrix component (`components/activities/shared/SelectionMatrix.tsx`)
    - [ ] Write component tests: renders rows x columns, radio vs checkbox mode, emits selected values, read-only and graded-feedback states, keyboard navigation
    - [ ] Implement SelectionMatrix with shadcn primitives (checkbox, label) + ARIA grid role
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build StatementLayout component (`components/activities/shared/StatementLayout.tsx`)
    - [ ] Write component tests: renders section headers and rows, editable vs prefilled vs computed cells, auto-subtotals, read-only and graded-feedback states
    - [ ] Implement StatementLayout with shadcn primitives (input, card) + table semantics
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Build JournalEntryTable component (`components/activities/shared/JournalEntryTable.tsx`)
    - [ ] Write component tests: renders account/debit/credit columns, accepts generated account list, balance validation, row-level grading feedback, multi-date entries, keyboard navigation
    - [ ] Implement data-driven JournalEntryTable with shadcn primitives
    - [ ] Verify: `npm run lint` and tests pass

- [ ] Task: Refactor CategorizationList (`components/activities/shared/CategorizationList.tsx`)
    - [ ] Write component tests: accepts generator-shaped input (items with IDs, target zones, hint metadata), preserves existing drag-drop UX
    - [ ] Extract reusable CategorizationList from existing AccountCategorization, accepting generic generator output
    - [ ] Update AccountCategorization to delegate to new CategorizationList
    - [ ] Verify: `npm run lint` and tests pass; existing categorization activities still work

## Phase 3 — Preview Route and Documentation

- [ ] Task: Create practice preview route (`/dev/practice-preview`)
    - [ ] Create dev-guarded page rendering all four compound UI components with sample mini-ledger data
    - [ ] One section per component with representative props (editable, read-only, graded states)
    - [ ] Verify: route renders without errors in dev mode; not reachable in production build

- [ ] Task: Update family key registry in practice-component-contract.md
    - [ ] Add family key table listing all 17 families (A-Q) with familyKey, status, UI component dependency, generator dependency
    - [ ] Mark foundation-track deliverables as `foundation`; all others as `planned`
    - [ ] Verify: table is complete and consistent with spec sheet family list

- [ ] Task: Final verification
    - [ ] Run `npm run lint`, `npm test`, and `vinext build`
    - [ ] Verify all acceptance criteria are met
    - [ ] Update lessons-learned.md and tech-debt.md if warranted
