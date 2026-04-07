# Track Specification: Component Import from Business-Operations

## Overview

Import 21 exercise and simulation components from the sibling `Business-Operations` project into `bus-math-v2`, adapted to the canonical `practice.v1` contract and registered in the activity component registry. Components are grouped by curriculum topic cluster and imported one cluster per phase.

Components already present in v2 (ReflectionJournal, MonthEndChallenge) are excluded.

## Functional Requirements

### 1. Component Mapping

Each imported component must:

- Accept the standard `ActivityComponentProps` interface: `{ activity, onSubmit, onComplete }`
- Read configuration from `activity.props` (Zod-validated) when the component is rendered through `ActivityRenderer`
- Fall back to internal defaults when rendered standalone (dev preview, testing)
- Emit a `PracticeSubmissionEnvelope` via `onSubmit` with full `practice.v1` structure including `parts`, `artifact`, and `analytics`
- Call `onComplete` when the student reaches a terminal state (mastery, submission)

### 2. Engine Extraction

- Move random-problem generators, solver logic, and grading calculations out of component files into dedicated engine modules under `lib/activities/engines/`
- Each engine module exports: `generate(params)`, `solve(problem)`, `grade(problem, answer)`, and a typed `Problem` / `Solution` interface
- Components become thin renderers that call the engine and wire results to the practice contract

### 3. Zod Schema Registration

- Add a Zod props schema for each new componentKey in the appropriate schema file (`activities-simulation.ts` or new `activities-exercises.ts`)
- Register the componentKey → component mapping in `lib/activities/registry.ts`
- Update the `ActivityComponentKey` union type to include all new keys

### 4. Curriculum Wiring

- Each component is associated with specific unit/lesson slugs in the curriculum manifest
- Content blocks in affected lessons reference the correct `componentKey` and `activityId`

### 5. Duplicate Exclusion

The following components from Business-Operations are NOT imported (v2 equivalents already exist):

| Source File | v2 Equivalent | componentKey |
|---|---|---|
| `ReflectionJournal.tsx` | `components/activities/quiz/ReflectionJournal.tsx` | `reflection-journal` |
| `MonthEndChallenge.tsx` | Similar month-end exercises already in v2 | — |

## Cluster Import Order

Strictly serial. Complete and verify one cluster before starting the next.

### Cluster 1 — U5: Depreciation & Assets (8 components)

| Source File | Target componentKey | Unit/Lesson |
|---|---|---|
| `DepreciationMethodComparisonSimulator.tsx` | `depreciation-method-comparison` | U5 L3–L5 |
| `AssetRegisterSimulator.tsx` | `asset-register-simulator` | U5 L2–L6 |
| `DynamicMethodSelector.tsx` | `dynamic-method-selector` | U5 L3–L5 |
| `MethodComparisonSimulator.tsx` | `method-comparison-simulator` | U5 L3–L5 |
| `StraightLineMastery.tsx` | `straight-line-mastery` | U5 L3 |
| `DDBComparisonMastery.tsx` | `ddb-comparison-mastery` | U5 L5 |
| `CapitalizationExpenseMastery.tsx` | `capitalization-expense-mastery` | U5 L2 |
| `ScenarioSwitchShowTell.tsx` | `scenario-switch-showtell` | U5 L7 |

### Cluster 2 — U6: Inventory & Costing (3 components)

| Source File | Target componentKey | Unit/Lesson |
|---|---|---|
| `InventoryAlgorithmShowTell.tsx` | `inventory-algorithm-showtell` | U6 L2–L3 |
| `MarkupMarginMastery.tsx` | `markup-margin-mastery` | U6 L5 |
| `BreakEvenMastery.tsx` | `break-even-mastery` | U6 L5 |

### Cluster 3 — U3: Financial Statements & Reporting (5 components)

| Source File | Target componentKey | Unit/Lesson |
|---|---|---|
| `IncomeStatementPractice.tsx` | `income-statement-practice` | U3 L2 |
| `CashFlowPractice.tsx` | `cash-flow-practice` | U3 L4 |
| `BalanceSheetPractice.tsx` | `balance-sheet-practice` | U3 L5 |
| `ChartLinkingSimulator.tsx` | `chart-linking-simulator` | U3 L5 |
| `CrossSheetLinkSimulator.tsx` | `cross-sheet-link-simulator` | U3 L5 |

### Cluster 4 — U2: Transactions & Adjustments (3 components)

| Source File | Target componentKey | Unit/Lesson |
|---|---|---|
| `ClosingEntryPractice.tsx` | `closing-entry-practice` | U2 L3 |
| `MonthEndClosePractice.tsx` | `month-end-close-practice` | U2 L3–L4 |
| `AdjustmentPractice.tsx` | `adjustment-practice` | U2 L3 |

### Cluster 5 — U8: Integrated Model & Validation (2 components)

| Source File | Target componentKey | Unit/Lesson |
|---|---|---|
| `ErrorCheckingSystem.tsx` | `error-checking-system` | U1 L5–L6, U8 L6 |
| `ScenarioSwitchShowTell.tsx` | *(already in Cluster 1)* | — |

**Note:** `ScenarioSwitchShowTell` is placed in Cluster 1. Cluster 5 contains only `ErrorCheckingSystem` (1 net new component).

**Revised Cluster 5 — 1 component:**

| Source File | Target componentKey | Unit/Lesson |
|---|---|---|
| `ErrorCheckingSystem.tsx` | `error-checking-system` | U1 L5–L6, U8 L6 |

## Non-Functional Requirements

- All imported components pass `npm run lint`
- All new engine modules have >80% Vitest coverage
- All components emit structurally valid `practice.v1` envelopes verified by schema validation
- No new dependencies are introduced (zero `npm install` changes)
- Production build (`vinext build`) passes after each cluster

## Acceptance Criteria

- [ ] All 21 components imported and registered in the activity registry
- [ ] Each component accepts `{ activity, onSubmit, onComplete }` props
- [ ] Each component emits a valid `PracticeSubmissionEnvelope`
- [ ] Engine modules extracted with `generate`/`solve`/`grade` exports
- [ ] Zod schemas defined for all new componentKeys
- [ ] `ActivityComponentKey` union type updated
- [ ] Curriculum manifest references correct componentKeys
- [ ] `npm run lint` passes
- [ ] Vitest coverage >80% on new engine modules
- [ ] `npm test` passes (no regressions)
- [ ] `vinext build` passes

## Out of Scope

- Visual redesign or polish of imported components
- Teacher error analysis integration for new components
- Adding new practice family engine registrations (these are activity-level, not practice-family-level)
- Importing components not modified in the last 3 weeks
- Mobile responsive layout improvements
