import type { SpreadsheetData } from "./SpreadsheetWrapper";

export interface SpreadsheetTemplate {
  name: string;
  description: string;
  data: SpreadsheetData;
}

// Unit 1: Smart Ledger Launch - T-Account Template
export const tAccountTemplate: SpreadsheetTemplate = {
  name: "T-Account Template",
  description: "Basic T-Account structure for tracking debits and credits",
  data: [
    [
      { value: "Account Name:", readOnly: true },
      { value: "Cash", readOnly: false },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "Debits", readOnly: true },
      { value: "", readOnly: true },
      { value: "|", readOnly: true },
      { value: "", readOnly: true },
      { value: "Credits", readOnly: true },
    ],
    [
      { value: "", readOnly: false },
      { value: "", readOnly: true },
      { value: "|", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: false },
    ],
    [
      { value: "", readOnly: false },
      { value: "", readOnly: true },
      { value: "|", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: false },
    ],
    [
      { value: "", readOnly: false },
      { value: "", readOnly: true },
      { value: "|", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: false },
    ],
    [
      { value: "Total:", readOnly: true },
      { value: "=SUM(A4:A6)", readOnly: false },
      { value: "|", readOnly: true },
      { value: "=SUM(E4:E6)", readOnly: false },
      { value: "Total:", readOnly: true },
    ],
    [
      { value: "Balance:", readOnly: true },
      { value: "=ABS(B7-D7)", readOnly: false },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
  ],
};

// Unit 2: Month-End Wizard - Trial Balance Template
export const trialBalanceTemplate: SpreadsheetTemplate = {
  name: "Trial Balance Template",
  description: "Trial balance worksheet with automatic balance checking",
  data: [
    [
      { value: "Account Name", readOnly: true },
      { value: "Debit", readOnly: true },
      { value: "Credit", readOnly: true },
    ],
    [
      { value: "Cash", readOnly: true },
      { value: 5000, readOnly: false },
      { value: "", readOnly: false },
    ],
    [
      { value: "Accounts Receivable", readOnly: true },
      { value: 2500, readOnly: false },
      { value: "", readOnly: false },
    ],
    [
      { value: "Inventory", readOnly: true },
      { value: 3000, readOnly: false },
      { value: "", readOnly: false },
    ],
    [
      { value: "Accounts Payable", readOnly: true },
      { value: "", readOnly: false },
      { value: 1500, readOnly: false },
    ],
    [
      { value: "Common Stock", readOnly: true },
      { value: "", readOnly: false },
      { value: 5000, readOnly: false },
    ],
    [
      { value: "Retained Earnings", readOnly: true },
      { value: "", readOnly: false },
      { value: 4000, readOnly: false },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "TOTALS", readOnly: true },
      { value: "=SUM(B2:B7)", readOnly: false },
      { value: "=SUM(C2:C7)", readOnly: false },
    ],
    [
      { value: "Balance Check", readOnly: true },
      { value: "=IF(B9=C9,\"BALANCED\",\"OUT OF BALANCE\")", readOnly: false },
      { value: "", readOnly: true },
    ],
  ],
};

// Unit 3: Financial Statement Template
export const incomeStatementTemplate: SpreadsheetTemplate = {
  name: "Income Statement Template",
  description: "Basic income statement with revenue, expenses, and net income calculation",
  data: [
    [
      { value: "INCOME STATEMENT", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "For the Month Ended [Date]", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "REVENUES:", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "Sales Revenue", readOnly: true },
      { value: 50000, readOnly: false },
    ],
    [
      { value: "Service Revenue", readOnly: true },
      { value: 15000, readOnly: false },
    ],
    [
      { value: "Total Revenues", readOnly: true },
      { value: "=SUM(B5:B6)", readOnly: false },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "EXPENSES:", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "Cost of Goods Sold", readOnly: true },
      { value: 30000, readOnly: false },
    ],
    [
      { value: "Salaries Expense", readOnly: true },
      { value: 12000, readOnly: false },
    ],
    [
      { value: "Rent Expense", readOnly: true },
      { value: 3000, readOnly: false },
    ],
    [
      { value: "Utilities Expense", readOnly: true },
      { value: 800, readOnly: false },
    ],
    [
      { value: "Total Expenses", readOnly: true },
      { value: "=SUM(B10:B13)", readOnly: false },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "NET INCOME", readOnly: true },
      { value: "=B7-B14", readOnly: false },
    ],
  ],
};

// Unit 4: Statistical Analysis Template
export const statisticalAnalysisTemplate: SpreadsheetTemplate = {
  name: "Statistical Analysis Template",
  description: "Template for analyzing sales data with statistical functions",
  data: [
    [
      { value: "Month", readOnly: true },
      { value: "Sales", readOnly: true },
      { value: "Customers", readOnly: true },
      { value: "Avg Sale", readOnly: true },
    ],
    [
      { value: "January", readOnly: true },
      { value: 45000, readOnly: false },
      { value: 150, readOnly: false },
      { value: "=B2/C2", readOnly: false },
    ],
    [
      { value: "February", readOnly: true },
      { value: 52000, readOnly: false },
      { value: 175, readOnly: false },
      { value: "=B3/C3", readOnly: false },
    ],
    [
      { value: "March", readOnly: true },
      { value: 48000, readOnly: false },
      { value: 160, readOnly: false },
      { value: "=B4/C4", readOnly: false },
    ],
    [
      { value: "April", readOnly: true },
      { value: 55000, readOnly: false },
      { value: 185, readOnly: false },
      { value: "=B5/C5", readOnly: false },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "STATISTICS:", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "Average Sales", readOnly: true },
      { value: "=AVERAGE(B2:B5)", readOnly: false },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "Maximum Sales", readOnly: true },
      { value: "=MAX(B2:B5)", readOnly: false },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "Minimum Sales", readOnly: true },
      { value: "=MIN(B2:B5)", readOnly: false },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "Total Sales", readOnly: true },
      { value: "=SUM(B2:B5)", readOnly: false },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
  ],
};

// Unit 5: Payroll Template
export const payrollTemplate: SpreadsheetTemplate = {
  name: "Payroll Template",
  description: "Basic payroll calculation with tax deductions",
  data: [
    [
      { value: "Employee", readOnly: true },
      { value: "Hours", readOnly: true },
      { value: "Rate", readOnly: true },
      { value: "Gross Pay", readOnly: true },
      { value: "Tax Rate", readOnly: true },
      { value: "Tax", readOnly: true },
      { value: "Net Pay", readOnly: true },
    ],
    [
      { value: "John Smith", readOnly: true },
      { value: 40, readOnly: false },
      { value: 25, readOnly: false },
      { value: "=B2*C2", readOnly: false },
      { value: 0.25, readOnly: true },
      { value: "=D2*E2", readOnly: false },
      { value: "=D2-F2", readOnly: false },
    ],
    [
      { value: "Jane Doe", readOnly: true },
      { value: 35, readOnly: false },
      { value: 30, readOnly: false },
      { value: "=B3*C3", readOnly: false },
      { value: 0.25, readOnly: true },
      { value: "=D3*E3", readOnly: false },
      { value: "=D3-F3", readOnly: false },
    ],
    [
      { value: "Bob Johnson", readOnly: true },
      { value: 42, readOnly: false },
      { value: 28, readOnly: false },
      { value: "=B4*C4", readOnly: false },
      { value: 0.25, readOnly: true },
      { value: "=D4*E4", readOnly: false },
      { value: "=D4-F4", readOnly: false },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "TOTALS", readOnly: true },
      { value: "=SUM(B2:B4)", readOnly: false },
      { value: "", readOnly: true },
      { value: "=SUM(D2:D4)", readOnly: false },
      { value: "", readOnly: true },
      { value: "=SUM(F2:F4)", readOnly: false },
      { value: "=SUM(G2:G4)", readOnly: false },
    ],
  ],
};

// Unit 6: Break-Even Analysis Template
export const breakEvenTemplate: SpreadsheetTemplate = {
  name: "Break-Even Analysis Template",
  description: "Cost-Volume-Profit analysis with break-even calculation",
  data: [
    [
      { value: "BREAK-EVEN ANALYSIS", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "Fixed Costs:", readOnly: true },
      { value: 50000, readOnly: false },
    ],
    [
      { value: "Variable Cost per Unit:", readOnly: true },
      { value: 15, readOnly: false },
    ],
    [
      { value: "Selling Price per Unit:", readOnly: true },
      { value: 25, readOnly: false },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "Contribution Margin per Unit:", readOnly: true },
      { value: "=B5-B4", readOnly: false },
    ],
    [
      { value: "Break-Even Point (Units):", readOnly: true },
      { value: "=B3/B7", readOnly: false },
    ],
    [
      { value: "Break-Even Point (Sales $):", readOnly: true },
      { value: "=B8*B5", readOnly: false },
    ],
    [
      { value: "", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "SCENARIO ANALYSIS:", readOnly: true },
      { value: "", readOnly: true },
    ],
    [
      { value: "Target Units:", readOnly: true },
      { value: 6000, readOnly: false },
    ],
    [
      { value: "Total Revenue:", readOnly: true },
      { value: "=B12*B5", readOnly: false },
    ],
    [
      { value: "Total Variable Costs:", readOnly: true },
      { value: "=B12*B4", readOnly: false },
    ],
    [
      { value: "Total Fixed Costs:", readOnly: true },
      { value: "=B3", readOnly: false },
    ],
    [
      { value: "Total Costs:", readOnly: true },
      { value: "=B14+B15", readOnly: false },
    ],
    [
      { value: "Profit:", readOnly: true },
      { value: "=B13-B16", readOnly: false },
    ],
  ],
};

// Export all templates
export const spreadsheetTemplates = {
  't-account': tAccountTemplate,
  'trial-balance': trialBalanceTemplate,
  'income-statement': incomeStatementTemplate,
  'statistical-analysis': statisticalAnalysisTemplate,
  'payroll': payrollTemplate,
  'break-even': breakEvenTemplate,
};

// Helper function to get template by key
export const getTemplateByKey = (templateKey: string): SpreadsheetTemplate | null => {
  return spreadsheetTemplates[templateKey as keyof typeof spreadsheetTemplates] || null;
};

// Helper function to get template by unit
export const getTemplateByUnit = (unitNumber: number): SpreadsheetTemplate[] => {
  switch (unitNumber) {
    case 1:
      return [tAccountTemplate];
    case 2:
      return [trialBalanceTemplate];
    case 3:
      return [incomeStatementTemplate];
    case 4:
      return [statisticalAnalysisTemplate];
    case 5:
      return [payrollTemplate];
    case 6:
      return [breakEvenTemplate];
    default:
      return [];
  }
};