# Specification: Legacy Component Pruning and Simulation Rebuilds

## 1. Pruning Obsolete Components
The following legacy components are superseded by Families A-Q and must be deleted:
- `drag-drop/AccountCategorization.tsx`
- `drag-drop/FinancialStatementMatching.tsx`
- `drag-drop/TrialBalanceSorting.tsx`
- `drag-drop/GeneralDragAndDrop.tsx`
- `simulations/LedgerHero.tsx`

## 2. Refactoring Display Components
The following display components are buggy and need to be refactored for reliability. They are for display/worked-examples only and do not emit student submissions.
- `charts/BarChart.tsx`
- `charts/BreakEvenChart.tsx`
- `charts/DoughnutChart.tsx`
- `charts/LineChart.tsx`
- `charts/PieChart.tsx`
- `charts/FinancialDashboard.tsx`
- `charts/chart-types.ts`

## 3. New Practice Families (R-U)
These new algorithmic families will be built on the `practice.v1` contract, replacing older legacy interactive builders.

### Family R: Cost-Volume-Profit (CVP) Analysis
- **Replaces:** `BreakEvenCalculator.tsx`, `BreakEvenComponents.tsx`
- **Pedagogical Purpose:** Teach break-even points, contribution margin, and target profit.
- **Generator:** `cvp-scenario-generator`

### Family S: Time Value of Money & Interest Schedules
- **Replaces:** `InterestBuilder.tsx`
- **Pedagogical Purpose:** Calculate simple and compound interest, loan amortization.
- **Generator:** `interest-scenario-generator`

### Family T: Multi-Year Depreciation Schedules
- **Replaces:** `DepreciationBuilder.tsx`
- **Pedagogical Purpose:** Build depreciation schedules (Straight-line, DDB, UOP) over an asset's useful life.
- **Generator:** `asset-schedule-generator`

### Family U: Financial Statement Analysis (Ratios)
- **Replaces:** `RatioMatching.tsx`, `BudgetCategorySort.tsx` (adapted)
- **Pedagogical Purpose:** Compute and interpret liquidity, solvency, and profitability ratios.
- **Generator:** `mini-ledger` (balanced financial statements)

## 4. Simulation Rebuilds
8 core simulations will be rebuilt to be `practice.v1` compliant. They will be placed in Lesson 1 (Discovery) and Lesson 7/8 (Synthesis) of each unit.
- **Contract compliance:** 
  - `parts`: Key game decisions/milestones.
  - `artifact`: A static, teacher-readable summary report of the student's performance (e.g., Monthly Performance Report, Cash Runway chart).
