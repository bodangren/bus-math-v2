import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ACTIVITIES_DIR = path.join(process.cwd(), 'components/activities');
const FAMILIES_DIR = path.join(process.cwd(), 'lib/practice/engine/families');
const OUTPUT_FILE = path.join(process.cwd(), 'lib/component-versions.json');

const ACTIVITY_KEY_TO_FILE: Record<string, string> = {
  'comprehension-quiz': 'quiz/ComprehensionCheck.tsx',
  'tiered-assessment': 'quiz/TieredAssessment.tsx',
  'percentage-calculation-sorting': 'drag-drop/PercentageCalculationSorting.tsx',
  'inventory-flow-diagram': 'drag-drop/InventoryFlowDiagram.tsx',
  'cash-flow-timeline': 'drag-drop/CashFlowTimeline.tsx',
  'fill-in-the-blank': 'quiz/FillInTheBlank.tsx',
  'journal-entry-building': 'accounting/JournalEntryActivity.tsx',
  'reflection-journal': 'quiz/ReflectionJournal.tsx',
  'peer-critique-form': 'quiz/PeerCritiqueForm.tsx',
  'lemonade-stand': 'simulations/LemonadeStand.tsx',
  'startup-journey': 'simulations/StartupJourney.tsx',
  'budget-balancer': 'simulations/BudgetBalancer.tsx',
  'cash-flow-challenge': 'simulations/CashFlowChallenge.tsx',
  'inventory-manager': 'simulations/InventoryManager.tsx',
  'pitch-presentation-builder': 'simulations/PitchPresentationBuilder.tsx',
  'pitch': 'simulations/PitchPresentationBuilder.tsx',
  'cafe-supply-chaos': 'simulations/CafeSupplyChaos.tsx',
  'notebook-organizer': 'simulations/NotebookOrganizer.tsx',
  'growth-puzzle': 'simulations/GrowthPuzzle.tsx',
  'asset-time-machine': 'simulations/AssetTimeMachine.tsx',
  'capital-negotiation': 'simulations/CapitalNegotiation.tsx',
  'business-stress-test': 'simulations/BusinessStressTest.tsx',
  'pay-structure-lab': 'simulations/PayStructureDecisionLab.tsx',
  'classification': 'ClassificationActivity.tsx',
  'financial-dashboard': 'charts/FinancialDashboard.tsx',
  'chart-builder': 'charts/FinancialDashboard.tsx',
  'spreadsheet': 'spreadsheet/SpreadsheetActivityAdapter.tsx',
  'spreadsheet-evaluator': 'spreadsheet/SpreadsheetEvaluator.tsx',
  'data-cleaning': 'spreadsheet/DataCleaningActivity.tsx',
  'profit-calculator': 'exercises/ProfitCalculator.tsx',
  'budget-worksheet': 'exercises/BudgetWorksheet.tsx',
  'straight-line-mastery': 'exercises/StraightLineMastery.tsx',
  'ddb-comparison-mastery': 'exercises/DDBComparisonMastery.tsx',
  'capitalization-expense-mastery': 'exercises/CapitalizationExpenseMastery.tsx',
  'depreciation-method-comparison': 'simulations/DepreciationMethodComparisonSimulator.tsx',
  'asset-register-simulator': 'simulations/AssetRegisterSimulator.tsx',
  'dynamic-method-selector': 'simulations/DynamicMethodSelector.tsx',
  'method-comparison-simulator': 'simulations/MethodComparisonSimulator.tsx',
  'scenario-switch-showtell': 'simulations/ScenarioSwitchShowTell.tsx',
  'inventory-algorithm-showtell': 'exercises/InventoryAlgorithmShowtell.tsx',
  'markup-margin-mastery': 'exercises/MarkupMarginMastery.tsx',
  'break-even-mastery': 'exercises/BreakEvenMastery.tsx',
  'income-statement-practice': 'exercises/IncomeStatementPractice.tsx',
  'cash-flow-practice': 'exercises/CashFlowPractice.tsx',
  'balance-sheet-practice': 'exercises/BalanceSheetPractice.tsx',
  'chart-linking-simulator': 'exercises/ChartLinkingSimulator.tsx',
  'cross-sheet-link-simulator': 'exercises/CrossSheetLinkSimulator.tsx',
  'adjustment-practice': 'exercises/AdjustmentPractice.tsx',
  'closing-entry-practice': 'exercises/ClosingEntryPractice.tsx',
  'month-end-close-practice': 'exercises/MonthEndClosePractice.tsx',
  'error-checking-system': 'exercises/ErrorCheckingSystem.tsx',
};

const PRACTICE_KEY_TO_FILE: Record<string, string> = {
  'accounting-equation': 'accounting-equation.ts',
  'adjustment-effects': 'adjustment-effects.ts',
  'adjusting-calculations': 'adjusting-calculations.ts',
  'cycle-decisions': 'cycle-decisions.ts',
  'classification': 'classification.ts',
  'depreciation-presentation': 'depreciation-presentation.ts',
  'depreciation-schedules': 'depreciation-schedules.ts',
  'financial-analysis': 'financial-analysis.ts',
  'interest-schedules': 'interest-schedules.ts',
  'journal-entry': 'journal-entry.ts',
  'merchandising-entries': 'merchandising-entries.ts',
  'normal-balance': 'normal-balance.ts',
  'posting-balances': 'posting-balances.ts',
  'statement-construction': 'statement-construction.ts',
  'statement-subtotals': 'statement-subtotals.ts',
  'transaction-effects': 'transaction-effects.ts',
  'transaction-matrix': 'transaction-matrix.ts',
  'trial-balance-errors': 'trial-balance-errors.ts',
  'cvp-analysis': 'cvp-analysis.ts',
};

function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function scanActivities(): Record<string, string> {
  const hashes: Record<string, string> = {};

  for (const [key, filePath] of Object.entries(ACTIVITY_KEY_TO_FILE)) {
    const fullPath = path.join(ACTIVITIES_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Activity file not found: ${fullPath}`);
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    hashes[key] = hashString(content);
  }

  return hashes;
}

function scanFamilies(): Record<string, string> {
  const hashes: Record<string, string> = {};

  for (const [key, file] of Object.entries(PRACTICE_KEY_TO_FILE)) {
    const fullPath = path.join(FAMILIES_DIR, file);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Family file not found: ${fullPath}`);
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    hashes[key] = hashString(content);
  }

  return hashes;
}

function main() {
  console.log('Generating component version manifest...');

  const activities = scanActivities();
  console.log(`Found ${Object.keys(activities).length} activity components`);

  const families = scanFamilies();
  console.log(`Found ${Object.keys(families).length} practice families`);

  const manifest = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    activities,
    practices: families,
  };

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written to ${OUTPUT_FILE}`);
}

main();