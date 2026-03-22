# Current State of Activity Components

This report categorizes the existing activity components into four functional buckets based on their compliance with the `practice.v1` contract as of March 22, 2026.

## 1. Newly Created "Family A-Z" (Contract-Compliant)
These components are located in `components/activities/shared/` and were built specifically for Milestone 7 to support the algorithmic problem engines. They are fully compliant with the `practice.v1` input and submission contracts.

| Component | Usage (Problem Families) |
| :--- | :--- |
| **`StatementLayout`** | Families D, E, J, N, O, Q |
| **`SelectionMatrix`** | Families C, F, K, M, P |
| **`JournalEntryTable`** | Families H, J, L, P |
| **`CategorizationList`** | Families A, M |
| **`AccountingEquationLayout`** | Family A |
| **`TrialBalanceErrorMatrix`** | Family G |
| **`PostingBalanceList`** | Family I |

## 2. Refactored First Edition Components (Contract-Compliant)
These components were imported from the first edition e-textbook and have been refactored or wrapped in adapters to satisfy the `practice.v1` submission envelope.

| Component | Refactor Method |
| :--- | :--- |
| **`SpreadsheetActivity`** | Wrapped in `SpreadsheetActivityAdapter` to bridge flat props to the activity renderer. |
| **`ComprehensionCheck`** | Refactored to use `buildPracticeSubmissionEnvelope` and `buildPracticeSubmissionParts`. |
| **`FillInTheBlank`** | Updated with standard practice-contract hooks and validators. |
| **`ReflectionJournal`** | Integrated with the shared practice submission surface. |

## 3. Legacy Components (Non-Compliant)
These are legacy components (primarily in `components/activities/accounting/`) that have not yet been migrated to the `practice.v1` contract. They are slated for replacement by the algorithmic families.

| Component | Status |
| :--- | :--- |
| **`JournalEntryActivity`** | Legacy standalone journal entry UI; replaced by `JournalEntryTable`. |
| **`TAccountSimple` / `Detailed`** | Non-interactive visualizations; replaced by `TAccountInteractive` (Family I). |
| **`TrialBalance`** | Static v1 trial balance component; replaced by `TrialBalanceErrorMatrix`. |
| **`DataCleaningActivity`** | Legacy spreadsheet-specific interaction logic. |

## 4. Curricular Display-Only Components
These components (found in `components/activities/reports/`) are used for instructional presentation and "Worked Example" modes. They are typically read-only and do not emit student submissions.

| Component | Description |
| :--- | :--- |
| **`BalanceSheetSimple`** | Basic balance sheet report for Units 1-2. |
| **`BalanceSheetDetailed`** | Classified balance sheet report for Units 3-8. |
| **`IncomeStatementSimple`** | Single-step income statement report. |
| **`IncomeStatementDetailed`** | Multi-step/Retail income statement report. |
| **`CashFlowStatement`** | Simple and detailed cash flow reporting. |
| **`TAccountsVisualization`** | Read-only T-account flow diagram. |
