import { describe, it, expect } from 'vitest';
import {
  tAccountTemplate,
  trialBalanceTemplate,
  incomeStatementTemplate,
  statisticalAnalysisTemplate,
  payrollTemplate,
  breakEvenTemplate,
  spreadsheetTemplates,
  getTemplateByKey,
  getTemplateByUnit,
  type SpreadsheetTemplate
} from './SpreadsheetTemplates';

describe('SpreadsheetTemplates', () => {
  describe('Template Structure', () => {
    it('has correct structure for t-account template', () => {
      expect(tAccountTemplate).toHaveProperty('name');
      expect(tAccountTemplate).toHaveProperty('description');
      expect(tAccountTemplate).toHaveProperty('data');
      expect(Array.isArray(tAccountTemplate.data)).toBe(true);
    });

    it('has correct structure for trial balance template', () => {
      expect(trialBalanceTemplate).toHaveProperty('name');
      expect(trialBalanceTemplate).toHaveProperty('description');
      expect(trialBalanceTemplate).toHaveProperty('data');
      expect(Array.isArray(trialBalanceTemplate.data)).toBe(true);
    });
  });

  describe('T-Account Template', () => {
    it('contains T-account structure', () => {
      const data = tAccountTemplate.data;
      
      // Should have account name row
      expect(data[0][0].value).toBe('Account Name:');
      expect(data[0][1].value).toBe('Cash');
      
      // Should have debits/credits separator
      expect(data[2][0].value).toBe('Debits');
      expect(data[2][2].value).toBe('|');
      expect(data[2][4].value).toBe('Credits');
      
      // Should have total formulas
      expect(data[6][1].value).toBe('=SUM(A4:A6)');
      expect(data[6][3].value).toBe('=SUM(E4:E6)');
      
      // Should have balance formula
      expect(data[7][1].value).toBe('=ABS(B7-D7)');
    });

    it('has correct read-only cells', () => {
      const data = tAccountTemplate.data;
      
      // Headers should be read-only
      expect(data[0][0].readOnly).toBe(true);
      expect(data[2][0].readOnly).toBe(true);
      expect(data[2][2].readOnly).toBe(true);
      expect(data[2][4].readOnly).toBe(true);
      
      // Input cells should be editable
      expect(data[3][0].readOnly).toBe(false);
      expect(data[4][0].readOnly).toBe(false);
      expect(data[5][0].readOnly).toBe(false);
    });
  });

  describe('Trial Balance Template', () => {
    it('contains trial balance structure', () => {
      const data = trialBalanceTemplate.data;
      
      // Should have headers
      expect(data[0][0].value).toBe('Account Name');
      expect(data[0][1].value).toBe('Debit');
      expect(data[0][2].value).toBe('Credit');
      
      // Should have sample accounts
      expect(data[1][0].value).toBe('Cash');
      expect(data[1][1].value).toBe(5000);
      
      // Should have totals
      expect(data[8][0].value).toBe('TOTALS');
      expect(data[8][1].value).toBe('=SUM(B2:B7)');
      expect(data[8][2].value).toBe('=SUM(C2:C7)');
      
      // Should have balance check
      expect(data[9][0].value).toBe('Balance Check');
      expect(data[9][1].value).toBe('=IF(B9=C9,\"BALANCED\",\"OUT OF BALANCE\")');
    });
  });

  describe('Income Statement Template', () => {
    it('contains income statement structure', () => {
      const data = incomeStatementTemplate.data;
      
      // Should have title
      expect(data[0][0].value).toBe('INCOME STATEMENT');
      
      // Should have revenue section
      expect(data[3][0].value).toBe('REVENUES:');
      expect(data[4][0].value).toBe('Sales Revenue');
      expect(data[4][1].value).toBe(50000);
      
      // Should have expense section
      expect(data[8][0].value).toBe('EXPENSES:');
      expect(data[9][0].value).toBe('Cost of Goods Sold');
      
      // Should have net income calculation
      expect(data[15][0].value).toBe('NET INCOME');
      expect(data[15][1].value).toBe('=B7-B14');
    });
  });

  describe('Statistical Analysis Template', () => {
    it('contains statistical analysis structure', () => {
      const data = statisticalAnalysisTemplate.data;
      
      // Should have data headers
      expect(data[0][0].value).toBe('Month');
      expect(data[0][1].value).toBe('Sales');
      expect(data[0][2].value).toBe('Customers');
      expect(data[0][3].value).toBe('Avg Sale');
      
      // Should have sample data
      expect(data[1][0].value).toBe('January');
      expect(data[1][1].value).toBe(45000);
      expect(data[1][2].value).toBe(150);
      expect(data[1][3].value).toBe('=B2/C2');
      
      // Should have statistics section
      expect(data[6][0].value).toBe('STATISTICS:');
      expect(data[7][0].value).toBe('Average Sales');
      expect(data[7][1].value).toBe('=AVERAGE(B2:B5)');
      expect(data[8][0].value).toBe('Maximum Sales');
      expect(data[8][1].value).toBe('=MAX(B2:B5)');
    });
  });

  describe('Payroll Template', () => {
    it('contains payroll structure', () => {
      const data = payrollTemplate.data;
      
      // Should have employee headers
      expect(data[0][0].value).toBe('Employee');
      expect(data[0][1].value).toBe('Hours');
      expect(data[0][2].value).toBe('Rate');
      expect(data[0][3].value).toBe('Gross Pay');
      expect(data[0][4].value).toBe('Tax Rate');
      expect(data[0][5].value).toBe('Tax');
      expect(data[0][6].value).toBe('Net Pay');
      
      // Should have sample employee
      expect(data[1][0].value).toBe('John Smith');
      expect(data[1][1].value).toBe(40);
      expect(data[1][2].value).toBe(25);
      expect(data[1][3].value).toBe('=B2*C2');
      expect(data[1][4].value).toBe(0.25);
      expect(data[1][5].value).toBe('=D2*E2');
      expect(data[1][6].value).toBe('=D2-F2');
      
      // Should have totals
      expect(data[5][0].value).toBe('TOTALS');
      expect(data[5][1].value).toBe('=SUM(B2:B4)');
    });
  });

  describe('Break-Even Template', () => {
    it('contains break-even analysis structure', () => {
      const data = breakEvenTemplate.data;
      
      // Should have title
      expect(data[0][0].value).toBe('BREAK-EVEN ANALYSIS');
      
      // Should have cost inputs
      expect(data[2][0].value).toBe('Fixed Costs:');
      expect(data[3][0].value).toBe('Variable Cost per Unit:');
      expect(data[4][0].value).toBe('Selling Price per Unit:');
      
      // Should have calculations
      expect(data[6][0].value).toBe('Contribution Margin per Unit:');
      expect(data[6][1].value).toBe('=B5-B4');
      expect(data[7][0].value).toBe('Break-Even Point (Units):');
      expect(data[7][1].value).toBe('=B3/B7');
      
      // Should have scenario analysis
      expect(data[10][0].value).toBe('SCENARIO ANALYSIS:');
      expect(data[11][0].value).toBe('Target Units:');
      expect(data[12][0].value).toBe('Total Revenue:');
      expect(data[12][1].value).toBe('=B12*B5');
    });
  });

  describe('spreadsheetTemplates export', () => {
    it('exports all templates', () => {
      expect(spreadsheetTemplates).toHaveProperty('t-account');
      expect(spreadsheetTemplates).toHaveProperty('trial-balance');
      expect(spreadsheetTemplates).toHaveProperty('income-statement');
      expect(spreadsheetTemplates).toHaveProperty('statistical-analysis');
      expect(spreadsheetTemplates).toHaveProperty('payroll');
      expect(spreadsheetTemplates).toHaveProperty('break-even');
      
      expect(Object.keys(spreadsheetTemplates)).toHaveLength(6);
    });

    it('templates match individual exports', () => {
      expect(spreadsheetTemplates['t-account']).toBe(tAccountTemplate);
      expect(spreadsheetTemplates['trial-balance']).toBe(trialBalanceTemplate);
      expect(spreadsheetTemplates['income-statement']).toBe(incomeStatementTemplate);
      expect(spreadsheetTemplates['statistical-analysis']).toBe(statisticalAnalysisTemplate);
      expect(spreadsheetTemplates['payroll']).toBe(payrollTemplate);
      expect(spreadsheetTemplates['break-even']).toBe(breakEvenTemplate);
    });
  });

  describe('getTemplateByKey', () => {
    it('returns correct template for valid keys', () => {
      expect(getTemplateByKey('t-account')).toBe(tAccountTemplate);
      expect(getTemplateByKey('trial-balance')).toBe(trialBalanceTemplate);
      expect(getTemplateByKey('income-statement')).toBe(incomeStatementTemplate);
    });

    it('returns null for invalid keys', () => {
      expect(getTemplateByKey('invalid')).toBeNull();
      expect(getTemplateByKey('')).toBeNull();
    });
  });

  describe('getTemplateByUnit', () => {
    it('returns correct templates for each unit', () => {
      expect(getTemplateByUnit(1)).toEqual([tAccountTemplate]);
      expect(getTemplateByUnit(2)).toEqual([trialBalanceTemplate]);
      expect(getTemplateByUnit(3)).toEqual([incomeStatementTemplate]);
      expect(getTemplateByUnit(4)).toEqual([statisticalAnalysisTemplate]);
      expect(getTemplateByUnit(5)).toEqual([payrollTemplate]);
      expect(getTemplateByUnit(6)).toEqual([breakEvenTemplate]);
    });

    it('returns empty array for invalid units', () => {
      expect(getTemplateByUnit(0)).toEqual([]);
      expect(getTemplateByUnit(7)).toEqual([]);
      expect(getTemplateByUnit(99)).toEqual([]);
    });
  });

  describe('Template Data Validation', () => {
    it('all templates have valid data structure', () => {
      const templates = Object.values(spreadsheetTemplates);
      
      templates.forEach((template: SpreadsheetTemplate) => {
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(Array.isArray(template.data)).toBe(true);
        expect(template.data.length).toBeGreaterThan(0);
        
        // Check that each row is an array
        template.data.forEach(row => {
          expect(Array.isArray(row)).toBe(true);
          
          // Check that each cell has a value property
          row.forEach(cell => {
            expect(cell).toHaveProperty('value');
            expect(typeof cell.value === 'string' || typeof cell.value === 'number').toBe(true);
          });
        });
      });
    });

    it('all templates contain at least one formula', () => {
      const templates = Object.values(spreadsheetTemplates);
      
      templates.forEach((template: SpreadsheetTemplate) => {
        const hasFormula = template.data.some(row =>
          row.some(cell => typeof cell.value === 'string' && cell.value.startsWith('='))
        );
        
        expect(hasFormula).toBe(true);
      });
    });
  });
});