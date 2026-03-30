# Activity-to-Family Key Mapping Analysis

Generated: 2026-03-31

## Current Mappings

| Activity Component | Current Family Key | Practice Registry Family | Status |
|-------------------|-------------------|-------------------------|---------|
| AccountCategorization | account-categorization | classification | ⚠️ MISMATCH |
| FinancialStatementMatching | financial-statement-matching | statement-construction | ⚠️ MISMATCH |
| TrialBalanceSorting | trial-balance-sorting | trial-balance-errors | ⚠️ MISMATCH |
| GeneralDragAndDrop | (dynamic componentKey) | - | ⚠️ VARIABLE |
| BreakEvenComponents | break-even-components | cvp-analysis | ⚠️ MISMATCH |
| BudgetCategorySort | budget-category-sort | financial-analysis | ⚠️ MISMATCH |
| CashFlowTimeline | cash-flow-timeline | - | ⚠️ NOT IN REGISTRY |
| InventoryFlowDiagram | inventory-flow-diagram | - | ⚠️ NOT IN REGISTRY |
| PercentageCalculationSorting | percentage-calculation-sorting | - | ⚠️ NOT IN REGISTRY |
| RatioMatching | ratio-matching | financial-analysis | ⚠️ MISMATCH |
| JournalEntryActivity | journal-entry-building | journal-entry | ⚠️ MISMATCH |

## Practice Registry Families

```
'accounting-equation'
'adjustment-effects'
'adjusting-calculations'
classification
'cvp-analysis'
'cycle-decisions'
'depreciation-presentation'
'depreciation-schedules'
'financial-analysis'
'interest-schedules'
'journal-entry'
'merchandising-entries'
'normal-balance'
'posting-balances'
'statement-construction'
'statement-subtotals'
'transaction-effects'
'transaction-matrix'
'trial-balance-errors'
```

## Analysis

### Issues Found

1. **Naming Convention Mismatch**: Activity component keys use descriptive names while practice registry uses family identifiers
2. **Missing Mappings**: Some activities (CashFlowTimeline, InventoryFlowDiagram, PercentageCalculationSorting) don't have corresponding practice families
3. **Consolidation Opportunities**: RatioMatching and BudgetCategorySort both could use 'financial-analysis'
4. **Hardcoded Keys**: JournalEntryActivity hardcodes family instead of receiving it via props

### Recommendations

1. Standardize on practice registry family keys for submissions
2. Add familyKey prop to activity components that generate practice submissions
3. Update curriculum manifests to specify familyKey for each practice activity
4. Maintain backward compatibility by supporting both old and new keys during transition
