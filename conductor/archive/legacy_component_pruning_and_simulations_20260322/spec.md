# Specification: Legacy Cleanup — Component Pruning, Chart Refactor, and Simulation Rebuilds

> Families R-U creation moved to Practice Engine Stabilization track.
> This track handles deletion of superseded components, chart refactoring, and simulation rebuilds.

## Dependencies

Do not start this track until:
- Practice Engine Stabilization is complete (Families R-U exist as replacements)
- Curriculum Rollout is complete (lessons are wired to new family keys, safe to delete old components)
- Practice Visual & Teaching Upgrade is complete (simulations benefit from the redesigned shared components)

## 1. Pruning Obsolete Components
The following legacy components are superseded by Families A-Q and must be deleted:
- `drag-drop/AccountCategorization.tsx`
- `drag-drop/FinancialStatementMatching.tsx`
- `drag-drop/TrialBalanceSorting.tsx`
- `drag-drop/GeneralDragAndDrop.tsx`
- `simulations/LedgerHero.tsx`

## 2. Pruning Legacy Interactive Builders
The following legacy interactive builders are superseded by Families R-U and must be deleted:
- `BreakEvenCalculator.tsx`, `BreakEvenComponents.tsx` (replaced by Family R)
- `InterestBuilder.tsx` (replaced by Family S)
- `DepreciationBuilder.tsx` (replaced by Family T)
- `RatioMatching.tsx`, `BudgetCategorySort.tsx` (replaced by Family U)

## 3. Refactoring Display Components
The following display components are buggy and need to be refactored for reliability. They are for display/worked-examples only and do not emit student submissions.
- `charts/BarChart.tsx`
- `charts/BreakEvenChart.tsx`
- `charts/DoughnutChart.tsx`
- `charts/LineChart.tsx`
- `charts/PieChart.tsx`
- `charts/FinancialDashboard.tsx`
- `charts/chart-types.ts`

## 4. Simulation Rebuilds
8 core simulations will be rebuilt to be `practice.v1` compliant. They will be placed in Lesson 1 (Discovery) and Lesson 7/8 (Synthesis) of each unit.
- **Contract compliance:**
  - `parts`: Key game decisions/milestones.
  - `artifact`: A static, teacher-readable summary report of the student's performance (e.g., Monthly Performance Report, Cash Runway chart).
