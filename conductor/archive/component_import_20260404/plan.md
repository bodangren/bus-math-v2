# Implementation Plan: Component Import from Business-Operations

## Phase 0 — Scaffolding (shared infrastructure)

- [ ] Task: Create engine directory structure
  - [ ] Create `lib/activities/engines/` directory
  - [ ] Create `lib/activities/engines/index.ts` barrel export
  - [ ] Write test: barrel exports all expected engine modules

- [ ] Task: Create Zod schema file for imported exercises
  - [ ] Create `lib/db/schema/activities-exercises.ts` with placeholder export
  - [ ] Import into `activities-core.ts` schema union
  - [ ] Write test: schema file is importable and exports valid Zod schemas

- [ ] Task: Create adapter utility for practice.v1 envelope
  - [ ] Create `lib/activities/import-adapter.ts` with `buildImportedActivitySubmission()` helper
  - [ ] Mirrors `buildSimulationSubmissionEnvelope` pattern from legacy cleanup
  - [ ] Write test: adapter produces valid `PracticeSubmissionEnvelope`

- [ ] Task: Conductor - Phase 0 Manual Verification
  - [ ] Run `npm run lint`
  - [ ] Run `npm test -- lib/activities/engines`
  - [ ] Run `vinext build`

## Phase 1 — Cluster 1: U5 Depreciation & Assets (8 components)

- [ ] Task: Extract depreciation engine
  - [ ] Create `lib/activities/engines/depreciation.ts`
  - [ ] Extract `calculateSL`, `calculateDDB`, `calculateComparison` from source components
  - [ ] Define `AssetScenario`, `ScheduleRow`, `DepreciationProblem` types
  - [ ] Export `generate()`, `solve()`, `grade()` functions
  - [ ] Write unit tests for all engine functions (>80% coverage)

- [ ] Task: Import `DepreciationMethodComparisonSimulator` → `depreciation-method-comparison`
  - [ ] Create `components/activities/simulations/DepreciationMethodComparisonSimulator.tsx`
  - [ ] Adapt to accept `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to depreciation engine
  - [ ] Emit practice.v1 envelope on submit
  - [ ] Add Zod schema for `depreciation-method-comparison`
  - [ ] Register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `AssetRegisterSimulator` → `asset-register-simulator`
  - [ ] Create `components/activities/simulations/AssetRegisterSimulator.tsx`
  - [ ] Adapt to accept `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to depreciation engine
  - [ ] Emit practice.v1 envelope on submit
  - [ ] Add Zod schema for `asset-register-simulator`
  - [ ] Register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `DynamicMethodSelector` → `dynamic-method-selector`
  - [ ] Create `components/activities/simulations/DynamicMethodSelector.tsx`
  - [ ] Adapt to accept `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to depreciation engine
  - [ ] Emit practice.v1 envelope on submit
  - [ ] Add Zod schema for `dynamic-method-selector`
  - [ ] Register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `MethodComparisonSimulator` → `method-comparison-simulator`
  - [ ] Create `components/activities/simulations/MethodComparisonSimulator.tsx`
  - [ ] Adapt to accept `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to depreciation engine
  - [ ] Emit practice.v1 envelope on submit
  - [ ] Add Zod schema for `method-comparison-simulator`
  - [ ] Register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `StraightLineMastery` → `straight-line-mastery`
  - [ ] Create `components/activities/exercises/StraightLineMastery.tsx`
  - [ ] Adapt to accept `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to depreciation engine for problem generation and grading
  - [ ] Emit practice.v1 envelope on submit
  - [ ] Add Zod schema for `straight-line-mastery`
  - [ ] Register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `DDBComparisonMastery` → `ddb-comparison-mastery`
  - [ ] Create `components/activities/exercises/DDBComparisonMastery.tsx`
  - [ ] Adapt to accept `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to depreciation engine
  - [ ] Emit practice.v1 envelope on submit
  - [ ] Add Zod schema for `ddb-comparison-mastery`
  - [ ] Register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `CapitalizationExpenseMastery` → `capitalization-expense-mastery`
  - [ ] Create `components/activities/exercises/CapitalizationExpenseMastery.tsx`
  - [ ] Extract capitalization logic to engine (or reuse depreciation engine with capex/expense split)
  - [ ] Adapt to accept `{ activity, onSubmit, onComplete }` props
  - [ ] Emit practice.v1 envelope on submit
  - [ ] Add Zod schema for `capitalization-expense-mastery`
  - [ ] Register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `ScenarioSwitchShowTell` → `scenario-switch-showtell`
  - [ ] Create `components/activities/simulations/ScenarioSwitchShowTell.tsx`
  - [ ] Adapt to accept `{ activity, onSubmit, onComplete }` props
  - [ ] Emit practice.v1 envelope on submit
  - [ ] Add Zod schema for `scenario-switch-showtell`
  - [ ] Register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Update `ActivityComponentKey` union type
  - [ ] Add all 8 new componentKeys to the union in `types/activities.ts`
  - [ ] Verify type-checking passes

- [ ] Task: Conductor - Phase 1 Manual Verification
  - [ ] Run `npm run lint`
  - [ ] Run `npm test -- lib/activities/engines components/activities/simulations components/activities/exercises`
  - [ ] Run `npm test` (full suite, check for regressions)
  - [ ] Run `vinext build`
  - [ ] Update `plan.md` status markers

## Phase 2 — Cluster 2: U6 Inventory & Costing (3 components)

- [ ] Task: Extract inventory/costing engine
  - [ ] Create `lib/activities/engines/inventory-costing.ts`
  - [ ] Extract FIFO/LIFO/WAC calculation logic from source
  - [ ] Extract markup, margin, break-even, and contribution margin calculations
  - [ ] Export `generate()`, `solve()`, `grade()` functions
  - [ ] Write unit tests (>80% coverage)

- [ ] Task: Import `InventoryAlgorithmShowTell` → `inventory-algorithm-showtell`
  - [ ] Create `components/activities/simulations/InventoryAlgorithmShowTell.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to inventory-costing engine
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `MarkupMarginMastery` → `markup-margin-mastery`
  - [ ] Create `components/activities/exercises/MarkupMarginMastery.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to inventory-costing engine
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `BreakEvenMastery` → `break-even-mastery`
  - [ ] Create `components/activities/exercises/BreakEvenMastery.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to inventory-costing engine
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Update `ActivityComponentKey` union type
  - [ ] Add 3 new componentKeys
  - [ ] Verify type-checking passes

- [ ] Task: Conductor - Phase 2 Manual Verification
  - [ ] Run `npm run lint`
  - [ ] Run targeted tests
  - [ ] Run `npm test` (full suite)
  - [ ] Run `vinext build`
  - [ ] Update `plan.md` status markers

## Phase 3 — Cluster 3: U3 Financial Statements & Reporting (5 components)

- [ ] Task: Extract financial statements engine
  - [ ] Create `lib/activities/engines/financial-statements.ts`
  - [ ] Extract account classification, IS/BS/CF construction logic
  - [ ] Extract chart-linking and cross-sheet reference logic
  - [ ] Export `generate()`, `solve()`, `grade()` functions
  - [ ] Write unit tests (>80% coverage)

- [ ] Task: Import `IncomeStatementPractice` → `income-statement-practice`
  - [ ] Create `components/activities/exercises/IncomeStatementPractice.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to financial-statements engine
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `CashFlowPractice` → `cash-flow-practice`
  - [ ] Create `components/activities/exercises/CashFlowPractice.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to financial-statements engine
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `BalanceSheetPractice` → `balance-sheet-practice`
  - [ ] Create `components/activities/exercises/BalanceSheetPractice.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to financial-statements engine
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `ChartLinkingSimulator` → `chart-linking-simulator`
  - [ ] Create `components/activities/simulations/ChartLinkingSimulator.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `CrossSheetLinkSimulator` → `cross-sheet-link-simulator`
  - [ ] Create `components/activities/simulations/CrossSheetLinkSimulator.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Update `ActivityComponentKey` union type
  - [ ] Add 5 new componentKeys
  - [ ] Verify type-checking passes

- [ ] Task: Conductor - Phase 3 Manual Verification
  - [ ] Run `npm run lint`
  - [ ] Run targeted tests
  - [ ] Run `npm test` (full suite)
  - [ ] Run `vinext build`
  - [ ] Update `plan.md` status markers

## Phase 4 — Cluster 4: U2 Transactions & Adjustments (3 components)

- [ ] Task: Extract transactions/adjustments engine
  - [ ] Create `lib/activities/engines/transactions.ts`
  - [ ] Extract closing entry, month-end adjustment, and accrual/deferral logic
  - [ ] Export `generate()`, `solve()`, `grade()` functions
  - [ ] Write unit tests (>80% coverage)

- [ ] Task: Import `ClosingEntryPractice` → `closing-entry-practice`
  - [ ] Create `components/activities/exercises/ClosingEntryPractice.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to transactions engine
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `MonthEndClosePractice` → `month-end-close-practice`
  - [ ] Create `components/activities/exercises/MonthEndClosePractice.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to transactions engine
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Import `AdjustmentPractice` → `adjustment-practice`
  - [ ] Create `components/activities/exercises/AdjustmentPractice.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Wire to transactions engine
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Update `ActivityComponentKey` union type
  - [ ] Add 3 new componentKeys
  - [ ] Verify type-checking passes

- [ ] Task: Conductor - Phase 4 Manual Verification
  - [ ] Run `npm run lint`
  - [ ] Run targeted tests
  - [ ] Run `npm test` (full suite)
  - [ ] Run `vinext build`
  - [ ] Update `plan.md` status markers

## Phase 5 — Cluster 5: U8 Integrated Model & Validation (1 component)

- [ ] Task: Extract validation engine (if needed)
  - [ ] Evaluate whether `ErrorCheckingSystem` logic warrants a separate engine or can live in-component
  - [ ] If extracted: create `lib/activities/engines/validation.ts`, write tests

- [ ] Task: Import `ErrorCheckingSystem` → `error-checking-system`
  - [ ] Create `components/activities/simulations/ErrorCheckingSystem.tsx`
  - [ ] Adapt to `{ activity, onSubmit, onComplete }` props
  - [ ] Emit practice.v1 envelope
  - [ ] Add Zod schema, register in `registry.ts`
  - [ ] Write component test

- [ ] Task: Update `ActivityComponentKey` union type
  - [ ] Add 1 new componentKey
  - [ ] Verify type-checking passes

- [ ] Task: Conductor - Phase 5 Manual Verification
  - [ ] Run `npm run lint`
  - [ ] Run targeted tests
  - [ ] Run `npm test` (full suite)
  - [ ] Run `vinext build`
  - [ ] Update `plan.md` status markers

## Phase 6 — Curriculum Wiring & Final Verification

- [ ] Task: Wire imported components into curriculum manifest
  - [ ] Update published-manifest entries for affected lessons to reference new componentKeys
  - [ ] Ensure activity seed data creates records for all new componentKeys

- [ ] Task: Final integration verification
  - [ ] Run `npm run lint`
  - [ ] Run `npm test` (full suite, zero regressions)
  - [ ] Run `vinext build`
  - [ ] Verify all 21 components render in dev preview route

- [ ] Task: Update Conductor artifacts
  - [ ] Update `tracks.md` to mark track complete
  - [ ] Update `tech-debt.md` if any deferred items remain
  - [ ] Archive track to `conductor/archive/`
