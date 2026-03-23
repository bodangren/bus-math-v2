import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AccountingEquationLayout,
  CategorizationList,
  JournalEntryTable,
  PostingBalanceList,
  SelectionMatrix,
  TrialBalanceErrorMatrix,
  StatementLayout,
  type JournalEntryRowFeedback,
  type SelectionMatrixRowFeedback,
} from '@/components/activities/shared';
import { practiceAccounts } from '@/lib/practice/engine/accounts';
import {
  accountingEquationFamily,
  buildAccountingEquationReviewFeedback,
  type AccountingEquationResponse,
} from '@/lib/practice/engine/families/accounting-equation';
import {
  adjustmentEffectsFamily,
  buildAdjustmentEffectsReviewFeedback,
  type AdjustmentEffectsResponse,
} from '@/lib/practice/engine/families/adjustment-effects';
import {
  adjustingCalculationsFamily,
  buildAdjustingCalculationsReviewFeedback,
  type AdjustingCalculationsJournalLine,
  type AdjustingCalculationsResponse,
} from '@/lib/practice/engine/families/adjusting-calculations';
import { buildNormalBalanceReviewFeedback, normalBalanceFamily } from '@/lib/practice/engine/families/normal-balance';
import {
  buildDepreciationPresentationReviewFeedback,
  depreciationPresentationFamily,
  type DepreciationPresentationResponse,
} from '@/lib/practice/engine/families/depreciation-presentation';
import {
  buildJournalEntryReviewFeedback,
  journalEntryFamily,
  type JournalEntryResponse,
} from '@/lib/practice/engine/families/journal-entry';
import {
  buildCycleDecisionReviewFeedback,
  cycleDecisionsFamily,
  type CycleDecisionResponse,
} from '@/lib/practice/engine/families/cycle-decisions';
import {
  buildMerchandisingEntryReviewFeedback,
  merchandisingEntriesFamily,
  type MerchandisingEntryResponse,
} from '@/lib/practice/engine/families/merchandising-entries';
import {
  buildTransactionEffectsReviewFeedback,
  transactionEffectsFamily,
  type TransactionEffectsResponse,
} from '@/lib/practice/engine/families/transaction-effects';
import {
  buildTransactionMatrixReviewFeedback,
  transactionMatrixFamily,
  type TransactionMatrixResponse,
} from '@/lib/practice/engine/families/transaction-matrix';
import {
  buildTrialBalanceErrorScenarioReviewFeedback,
  trialBalanceErrorFamily,
  type TrialBalanceErrorResponse,
} from '@/lib/practice/engine/families/trial-balance-errors';
import {
  buildPostingBalanceReviewFeedback,
  postingBalancesFamily,
  type PostingBalanceResponse,
} from '@/lib/practice/engine/families/posting-balances';
import {
  buildStatementConstructionReviewFeedback,
  statementConstructionFamily,
  type StatementConstructionResponse,
} from '@/lib/practice/engine/families/statement-construction';
import {
  buildStatementSubtotalsReviewFeedback,
  statementSubtotalsFamily,
  type StatementSubtotalsResponse,
} from '@/lib/practice/engine/families/statement-subtotals';
import {
  buildCvpAnalysisReviewFeedback,
  cvpAnalysisFamily,
  type CvpAnalysisResponse,
} from '@/lib/practice/engine/families/cvp-analysis';
import {
  buildInterestSchedulesReviewFeedback,
  interestSchedulesFamily,
  type InterestSchedulesResponse,
} from '@/lib/practice/engine/families/interest-schedules';
import {
  buildDepreciationSchedulesReviewFeedback,
  depreciationSchedulesFamily,
  type DepreciationSchedulesResponse,
} from '@/lib/practice/engine/families/depreciation-schedules';
import {
  buildFinancialAnalysisReviewFeedback,
  financialAnalysisFamily,
  type FinancialAnalysisResponse,
} from '@/lib/practice/engine/families/financial-analysis';
import { generateMiniLedger } from '@/lib/practice/engine/mini-ledger';
import { formatAccountingAmount } from '@/components/activities/shared/utils';

export default function PracticePreviewPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const familyACategories = [
    { id: 'assets', label: 'Assets', description: 'Resources the business owns' },
    { id: 'liabilities', label: 'Liabilities', description: 'Debts and obligations' },
    { id: 'equity', label: 'Equity', description: 'Owner claim on the business' },
    { id: 'income-statement', label: 'Income Statement', description: 'Revenue and expense accounts' },
  ] as const;

  const familyAItems = [
    {
      id: 'cash',
      label: 'Cash',
      description: 'Cash on hand and in bank accounts',
      targetId: 'assets',
      details: { confusionPair: 'accounts-receivable' },
    },
    {
      id: 'prepaid-insurance',
      label: 'Prepaid Insurance',
      description: 'Unused coverage paid in advance',
      targetId: 'assets',
      details: { confusionPair: 'insurance-expense' },
    },
    {
      id: 'unearned-revenue',
      label: 'Unearned Revenue',
      description: 'Cash received before the service is earned',
      targetId: 'liabilities',
      details: { confusionPair: 'service-revenue' },
    },
    {
      id: 'common-stock',
      label: 'Common Stock',
      description: 'Owner contributions in exchange for shares',
      targetId: 'equity',
      details: { confusionPair: 'retained-earnings' },
    },
    {
      id: 'service-revenue',
      label: 'Service Revenue',
      description: 'Earnings from services performed',
      targetId: 'income-statement',
      details: { confusionPair: 'unearned-revenue' },
    },
    {
      id: 'insurance-expense',
      label: 'Insurance Expense',
      description: 'Insurance cost recognized this period',
      targetId: 'income-statement',
      details: { confusionPair: 'prepaid-insurance' },
    },
  ] as const;

  const familyATeacherPlacements = {
    assets: familyAItems.filter((item) => item.id === 'cash').map((item) => ({ ...item })),
    liabilities: familyAItems.filter((item) => ['unearned-revenue', 'service-revenue'].includes(item.id)).map((item) => ({ ...item })),
    equity: familyAItems.filter((item) => item.id === 'common-stock').map((item) => ({ ...item })),
    'income-statement': familyAItems.filter((item) => ['prepaid-insurance', 'insurance-expense'].includes(item.id)).map((item) => ({ ...item })),
  };

  const familyATeacherFeedback = {
    cash: {
      status: 'correct' as const,
      scoreLabel: '1/1',
      selectedZoneLabel: 'Assets',
      expectedZoneLabel: 'Assets',
      misconceptionTags: [],
      message: 'Cash is a current asset.',
    },
    'prepaid-insurance': {
      status: 'incorrect' as const,
      scoreLabel: '0/1',
      selectedZoneLabel: 'Income Statement',
      expectedZoneLabel: 'Assets',
      misconceptionTags: ['prepaid-vs-expense'],
      message: 'This is an unused prepaid asset, not an expense yet.',
    },
    'unearned-revenue': {
      status: 'correct' as const,
      scoreLabel: '1/1',
      selectedZoneLabel: 'Liabilities',
      expectedZoneLabel: 'Liabilities',
      misconceptionTags: [],
      message: 'Cash was received before the revenue was earned, so it stays a liability.',
    },
    'common-stock': {
      status: 'correct' as const,
      scoreLabel: '1/1',
      selectedZoneLabel: 'Equity',
      expectedZoneLabel: 'Equity',
      misconceptionTags: [],
      message: 'Common stock represents the owner claim.',
    },
    'service-revenue': {
      status: 'incorrect' as const,
      scoreLabel: '0/1',
      selectedZoneLabel: 'Liabilities',
      expectedZoneLabel: 'Income Statement',
      misconceptionTags: ['earned-vs-deferred'],
      message: 'Service revenue is earned, so it belongs on the income statement.',
    },
    'insurance-expense': {
      status: 'correct' as const,
      scoreLabel: '1/1',
      selectedZoneLabel: 'Income Statement',
      expectedZoneLabel: 'Income Statement',
      misconceptionTags: [],
      message: 'Insurance expense is an income statement account.',
    },
  };

  const miniLedger = generateMiniLedger(2026, {
    accountCount: 12,
    includeContraAccounts: true,
    capitalMode: 'ending',
    companyType: 'retail',
  });

  const assets = miniLedger.accounts.filter((account) => account.accountType === 'asset' && !account.contraOf);
  const liabilities = miniLedger.accounts.filter((account) => account.accountType === 'liability');

  const selectionRows = [
    { id: 'assets', label: 'Asset accounts', description: 'Balance sheet items', selectionMode: 'single' as const },
    { id: 'liabilities', label: 'Liability accounts', description: 'Claims owed to others', selectionMode: 'single' as const },
    { id: 'equity', label: 'Equity accounts', description: 'Owner claim on assets', selectionMode: 'single' as const },
  ];

  const statementSections = [
    {
      id: 'income',
      label: 'Income Statement',
      description: 'Sample values drawn from the ledger snapshot.',
      rows: [
        { id: 'revenue', label: 'Revenue', kind: 'prefilled' as const, value: miniLedger.totals.revenue },
        { id: 'expenses', label: 'Expenses', kind: 'prefilled' as const, value: -miniLedger.totals.expenses },
        { id: 'net-income', label: 'Net Income', kind: 'subtotal' as const, sumOf: ['revenue', 'expenses'], note: 'Revenue less expenses' },
      ],
    },
    {
      id: 'equity',
      label: 'Equity Rollforward',
      description: 'Beginning capital to ending capital.',
      rows: [
        { id: 'beginning-capital', label: 'Beginning Capital', kind: 'prefilled' as const, value: miniLedger.totals.beginningCapital },
        { id: 'dividends', label: 'Dividends', kind: 'prefilled' as const, value: -miniLedger.totals.dividends },
        { id: 'ending-capital', label: 'Ending Capital', kind: 'subtotal' as const, sumOf: ['beginning-capital', 'net-income', 'dividends'], note: 'Beginning capital + net income - dividends' },
      ],
    },
  ];


  const journalTotal = miniLedger.totals.liabilities + miniLedger.totals.endingCapital;
  const journalLines = [
    {
      id: 'line-1',
      date: '03/20',
      accountId: assets[0]?.id,
      debit: journalTotal,
      credit: '',
      memo: 'Initial asset recognition',
    },
    {
      id: 'line-2',
      date: '03/20',
      accountId: liabilities[0]?.id,
      debit: '',
      credit: journalTotal,
      memo: 'Liability side',
    },
    {
      id: 'line-3',
      date: '03/20',
      accountId: '',
      debit: '',
      credit: '',
      memo: 'Reserved line',
    },
    {
      id: 'line-4',
      date: '03/20',
      accountId: '',
      debit: '',
      credit: '',
      memo: 'Reserved line',
    },
  ];

  const categorizationItems = miniLedger.accounts.slice(0, 6).map((account) => ({
    id: account.id,
    label: account.label,
    description: `${account.accountType} • ${formatAccountingAmount(account.balance)}`,
    targetId:
      account.accountType === 'asset'
        ? 'assets'
        : account.accountType === 'liability'
          ? 'liabilities'
          : account.accountType === 'equity'
            ? 'equity'
            : account.accountType === 'revenue'
              ? 'revenue'
              : 'expenses',
  }));

  const categorizationPlacements = categorizationItems.reduce<Record<string, (typeof categorizationItems)[number][]>>((acc, item) => {
    const bucket = acc[item.targetId] ?? [];
    bucket.push(item);
    acc[item.targetId] = bucket;
    return acc;
  }, {});

  const normalBalanceDefinition = normalBalanceFamily.generate(2026, {
    accountCount: 8,
    includeContraAccounts: true,
    companyScope: 'retail',
    mode: 'guided_practice',
  });
  const normalBalanceSolution = normalBalanceFamily.solve(normalBalanceDefinition);
  const normalBalanceTarget = normalBalanceDefinition.parts.find((part) => part.details.isContraAccount) ?? normalBalanceDefinition.parts[0];
  const normalBalanceWrongAnswer = (() => {
    if (!normalBalanceTarget) {
      return normalBalanceSolution;
    }

    const parentNormalBalance = normalBalanceTarget.details.contraOf
      ? practiceAccounts.find((account) => account.id === normalBalanceTarget.details.contraOf)?.normalBalance
      : null;
    const nextSelection = parentNormalBalance ?? (normalBalanceTarget.targetId === 'debit' ? 'credit' : 'debit');

    return {
      ...normalBalanceSolution,
      [normalBalanceTarget.id]: nextSelection,
    };
  })();
  const normalBalanceGrade = normalBalanceFamily.grade(normalBalanceDefinition, normalBalanceWrongAnswer);
  const normalBalanceFeedback = buildNormalBalanceReviewFeedback(normalBalanceDefinition, normalBalanceWrongAnswer, normalBalanceGrade);
  const normalBalanceColumns = [
    { id: 'debit', label: 'Debit', description: 'Normal balance on the left side' },
    { id: 'credit', label: 'Credit', description: 'Normal balance on the right side' },
  ];
  const normalBalanceRows = normalBalanceDefinition.parts.map((part) => ({
    id: part.id,
    label: part.label,
    description: `${part.details.accountType} account${part.details.isContraAccount && part.details.contraOf ? ` • contra to ${part.details.contraOf}` : ''}`,
  }));
  const normalBalanceReviewFeedback: Record<string, SelectionMatrixRowFeedback> = Object.fromEntries(
    normalBalanceDefinition.parts.map((part) => [
      part.id,
      {
        status: (normalBalanceFeedback[part.id]?.status ?? 'incorrect') as SelectionMatrixRowFeedback['status'],
        scoreLabel: normalBalanceFeedback[part.id]?.scoreLabel ?? '0/1',
        selectedLabel:
          normalBalanceFeedback[part.id]?.selectedBalanceLabel ??
          (normalBalanceWrongAnswer[part.id] === 'debit' ? 'Debit' : 'Credit'),
        expectedLabel: normalBalanceFeedback[part.id]?.expectedBalanceLabel ?? part.targetId.toUpperCase(),
        misconceptionTags: normalBalanceFeedback[part.id]?.misconceptionTags ?? [],
        message: normalBalanceFeedback[part.id]?.message,
      },
    ]),
  );

  const adjustmentEffectsDefinition = adjustmentEffectsFamily.generate(2026, {
    mode: 'guided_practice',
    scenarioKind: 'depreciation',
  });
  const adjustmentEffectsSolution = adjustmentEffectsFamily.solve(adjustmentEffectsDefinition);
  const adjustmentEffectOrder = ['overstated', 'understated', 'no-effect'] as const;
  const adjustmentEffectsStudentResponse = adjustmentEffectsDefinition.parts.reduce<AdjustmentEffectsResponse>(
    (acc, part, index) => {
      const solution = adjustmentEffectsSolution[part.id];
      if (index < 2) {
        const alternateEffect = adjustmentEffectOrder.find((effect) => effect !== solution) ?? solution;
        acc[part.id] = alternateEffect;
        return acc;
      }

      acc[part.id] = solution;
      return acc;
    },
    {} as AdjustmentEffectsResponse,
  );
  const adjustmentEffectsGrade = adjustmentEffectsFamily.grade(adjustmentEffectsDefinition, adjustmentEffectsStudentResponse);
  const adjustmentEffectsFeedback = buildAdjustmentEffectsReviewFeedback(
    adjustmentEffectsDefinition,
    adjustmentEffectsStudentResponse,
    adjustmentEffectsGrade,
  );
  const adjustmentEffectsReviewFeedback: Record<string, SelectionMatrixRowFeedback> = Object.fromEntries(
    adjustmentEffectsDefinition.parts.map((part) => [
      part.id,
      {
        status: (adjustmentEffectsFeedback[part.id]?.status ?? 'incorrect') as SelectionMatrixRowFeedback['status'],
        scoreLabel: adjustmentEffectsFeedback[part.id]?.scoreLabel ?? '0/1',
        selectedLabel: adjustmentEffectsFeedback[part.id]?.selectedLabel ?? 'Not selected',
        expectedLabel:
          adjustmentEffectsFeedback[part.id]?.expectedLabel ??
          (part.targetId === 'no-effect' ? 'No effect' : `${part.targetId[0].toUpperCase()}${part.targetId.slice(1)}`),
        misconceptionTags: adjustmentEffectsFeedback[part.id]?.misconceptionTags ?? [],
        message: adjustmentEffectsFeedback[part.id]?.message,
      },
    ]),
  );

  const trialBalanceErrorDefinition = trialBalanceErrorFamily.generate(2026, {
    mode: 'guided_practice',
    scenarioCount: 4,
    includeBalancedScenarios: true,
  });
  const trialBalanceErrorSolution = trialBalanceErrorFamily.solve(trialBalanceErrorDefinition);
  const trialBalanceErrorFirstScenario = trialBalanceErrorDefinition.scenarios[0];
  const trialBalanceErrorStudentResponse: TrialBalanceErrorResponse = trialBalanceErrorFirstScenario
    ? {
        ...trialBalanceErrorSolution,
        [`${trialBalanceErrorFirstScenario.rowId}:balanced`]:
          trialBalanceErrorFirstScenario.expectedBalanced === 'still-balances'
            ? 'out-of-balance'
            : 'still-balances',
        [`${trialBalanceErrorFirstScenario.rowId}:difference`]:
          trialBalanceErrorFirstScenario.expectedDifference + 9,
        [`${trialBalanceErrorFirstScenario.rowId}:larger-column`]:
          trialBalanceErrorFirstScenario.expectedLargerColumn === 'debit' ? 'credit' : 'debit',
      }
    : trialBalanceErrorSolution;
  const trialBalanceErrorGrade = trialBalanceErrorFamily.grade(trialBalanceErrorDefinition, trialBalanceErrorStudentResponse);
  const trialBalanceErrorRowFeedback = buildTrialBalanceErrorScenarioReviewFeedback(
    trialBalanceErrorDefinition,
    trialBalanceErrorStudentResponse,
    trialBalanceErrorGrade,
  );

  const transactionEffectsDefinition = transactionEffectsFamily.generate(2026, {
    mode: 'guided_practice',
    archetypeId: 'earn-revenue',
    context: 'service',
    settlement: 'cash',
  });
  const transactionEffectsSolution = transactionEffectsFamily.solve(transactionEffectsDefinition);
  const transactionEffectsStudentResponse: TransactionEffectsResponse = {
    ...transactionEffectsSolution,
    [transactionEffectsDefinition.event.effects[0]?.accountId ?? 'cash']:
      transactionEffectsDefinition.event.effects[0]?.direction === 'increase' ? 'decrease' : 'increase',
    equity: transactionEffectsDefinition.event.equityEffect === 'increases' ? 'decrease' : 'increase',
    amount: transactionEffectsDefinition.event.amount,
    'equity-reason': transactionEffectsSolution['equity-reason'],
  };
  const transactionEffectsMatrixValue = Object.fromEntries(
    transactionEffectsDefinition.rows.map((row) => [row.id, transactionEffectsSolution[row.id]]),
  ) as Record<string, string | string[]>;
  const transactionEffectsMatrixStudentValue = Object.fromEntries(
    transactionEffectsDefinition.rows.map((row) => [row.id, transactionEffectsStudentResponse[row.id]]),
  ) as Record<string, string | string[]>;
  const transactionEffectsGrade = transactionEffectsFamily.grade(transactionEffectsDefinition, transactionEffectsStudentResponse);
  const transactionEffectsFeedback = buildTransactionEffectsReviewFeedback(
    transactionEffectsDefinition,
    transactionEffectsStudentResponse,
    transactionEffectsGrade,
  );

  const transactionMatrixDefinition = transactionMatrixFamily.generate(2026, {
    mode: 'guided_practice',
    archetypeId: 'earn-revenue',
    context: 'service',
    settlement: 'cash',
  });
  const transactionMatrixSolution = transactionMatrixFamily.solve(transactionMatrixDefinition);
  const transactionMatrixStudentResponse: TransactionMatrixResponse = {
    ...transactionMatrixSolution,
    'offset-account': 'equity-reason',
    equity: 'direction',
  };
  const transactionMatrixMatrixValue = Object.fromEntries(
    transactionMatrixDefinition.rows.map((row) => [row.id, transactionMatrixSolution[row.id]]),
  ) as Record<string, string | string[]>;
  const transactionMatrixMatrixStudentValue = Object.fromEntries(
    transactionMatrixDefinition.rows.map((row) => [row.id, transactionMatrixStudentResponse[row.id]]),
  ) as Record<string, string | string[]>;
  const transactionMatrixGrade = transactionMatrixFamily.grade(transactionMatrixDefinition, transactionMatrixStudentResponse);
  const transactionMatrixFeedback = buildTransactionMatrixReviewFeedback(
    transactionMatrixDefinition,
    transactionMatrixStudentResponse,
    transactionMatrixGrade,
  );
  const transactionMatrixScenario = transactionMatrixDefinition.event;
  const transactionMatrixReason = transactionMatrixDefinition.event.equityReason;

  const journalEntryDefinition = journalEntryFamily.generate(2026, {
    mode: 'guided_practice',
    scenarioKey: 'return-allowance',
  });
  const journalEntrySolution = journalEntryFamily.solve(journalEntryDefinition);
  const journalEntryStudentResponse: JournalEntryResponse = journalEntrySolution.map((line) => ({ ...line }));
  if (journalEntryStudentResponse.length > 1) {
    [journalEntryStudentResponse[0], journalEntryStudentResponse[1]] = [
      journalEntryStudentResponse[1],
      journalEntryStudentResponse[0],
    ];
  }
  const journalEntryGrade = journalEntryFamily.grade(journalEntryDefinition, journalEntryStudentResponse);
  const journalEntryFeedback = buildJournalEntryReviewFeedback(
    journalEntryDefinition,
    journalEntryStudentResponse,
    journalEntryGrade,
  );
  const journalEntryRowFeedback: Record<string, JournalEntryRowFeedback> = Object.fromEntries(
    journalEntryDefinition.parts.map((part) => [
      part.id,
      {
        status: (journalEntryFeedback[part.id]?.status ?? 'incorrect') as JournalEntryRowFeedback['status'],
        message: journalEntryFeedback[part.id]?.message,
        misconceptionTags: journalEntryFeedback[part.id]?.misconceptionTags ?? [],
      },
    ]),
  );
  const journalEntryEquivalentRows = Object.values(journalEntryFeedback).filter((feedback) => feedback.status === 'partial').length;

  const cycleDecisionSelectionDefinition = cycleDecisionsFamily.generate(2026, {
    mode: 'guided_practice',
    scenarioKey: 'reversing-selection',
  });
  const cycleDecisionSelectionSolution = cycleDecisionsFamily.solve(cycleDecisionSelectionDefinition);
  const cycleDecisionSelectionStudentResponse: CycleDecisionResponse = {
    selections: {
      ...cycleDecisionSelectionSolution.selections,
      'accrued-wages': 'do-not-reverse',
    },
    lines: [],
  };
  const cycleDecisionSelectionGrade = cycleDecisionsFamily.grade(
    cycleDecisionSelectionDefinition,
    cycleDecisionSelectionStudentResponse,
  );
  const cycleDecisionSelectionFeedback = buildCycleDecisionReviewFeedback(
    cycleDecisionSelectionDefinition,
    cycleDecisionSelectionStudentResponse,
    cycleDecisionSelectionGrade,
  );
  const cycleDecisionSelectionRowFeedback: Record<string, SelectionMatrixRowFeedback> = Object.fromEntries(
    cycleDecisionSelectionDefinition.selectionRows.map((row) => [
      row.id,
      {
        status: (cycleDecisionSelectionFeedback[row.id]?.status ?? 'incorrect') as SelectionMatrixRowFeedback['status'],
        scoreLabel: cycleDecisionSelectionFeedback[row.id]?.scoreLabel ?? '0/1',
        selectedLabel: cycleDecisionSelectionFeedback[row.id]?.selectedLabel ?? 'Not selected',
        expectedLabel: cycleDecisionSelectionFeedback[row.id]?.expectedLabel ?? 'Unknown',
        misconceptionTags: cycleDecisionSelectionFeedback[row.id]?.misconceptionTags ?? [],
        message: cycleDecisionSelectionFeedback[row.id]?.message,
      },
    ]),
  );

  const cycleDecisionClosingDefinition = cycleDecisionsFamily.generate(2026, {
    mode: 'guided_practice',
    scenarioKey: 'closing-entry',
  });
  const cycleDecisionClosingSolution = cycleDecisionsFamily.solve(cycleDecisionClosingDefinition);
  const cycleDecisionClosingStudentResponse: CycleDecisionResponse = {
    selections: {},
    lines: [cycleDecisionClosingSolution.lines[1], cycleDecisionClosingSolution.lines[0], ...cycleDecisionClosingSolution.lines.slice(2)],
  };
  const cycleDecisionClosingGrade = cycleDecisionsFamily.grade(cycleDecisionClosingDefinition, cycleDecisionClosingStudentResponse);
  const cycleDecisionClosingFeedback = buildCycleDecisionReviewFeedback(
    cycleDecisionClosingDefinition,
    cycleDecisionClosingStudentResponse,
    cycleDecisionClosingGrade,
  );
  const cycleDecisionClosingRowFeedback: Record<string, JournalEntryRowFeedback> = Object.fromEntries(
    cycleDecisionClosingDefinition.parts.map((part) => [
      part.id,
      {
        status: (cycleDecisionClosingFeedback[part.id]?.status ?? 'incorrect') as JournalEntryRowFeedback['status'],
        message: cycleDecisionClosingFeedback[part.id]?.message,
        misconceptionTags: cycleDecisionClosingFeedback[part.id]?.misconceptionTags ?? [],
      },
    ]),
  );
  const cycleDecisionClosingEquivalentRows = Object.values(cycleDecisionClosingFeedback).filter((feedback) => feedback.status === 'partial').length;

  const merchandisingEntryDefinition = merchandisingEntriesFamily.generate(2026, {
    mode: 'guided_practice',
    scenarioKey: 'seller-timeline',
  });
  const merchandisingEntrySolution = merchandisingEntriesFamily.solve(merchandisingEntryDefinition);
  const merchandisingEntryStudentResponse: MerchandisingEntryResponse = [
    merchandisingEntrySolution[1],
    merchandisingEntrySolution[0],
    ...merchandisingEntrySolution.slice(2),
  ];
  const merchandisingEntryGrade = merchandisingEntriesFamily.grade(merchandisingEntryDefinition, merchandisingEntryStudentResponse);
  const merchandisingEntryFeedback = buildMerchandisingEntryReviewFeedback(
    merchandisingEntryDefinition,
    merchandisingEntryStudentResponse,
    merchandisingEntryGrade,
  );
  const merchandisingEntryRowFeedback: Record<string, JournalEntryRowFeedback> = Object.fromEntries(
    merchandisingEntryDefinition.parts.map((part) => [
      part.id,
      {
        status: (merchandisingEntryFeedback[part.id]?.status ?? 'incorrect') as JournalEntryRowFeedback['status'],
        message: merchandisingEntryFeedback[part.id]?.message,
        misconceptionTags: merchandisingEntryFeedback[part.id]?.misconceptionTags ?? [],
      },
    ]),
  );
  const merchandisingEntryEquivalentRows = Object.values(merchandisingEntryFeedback).filter((feedback) => feedback.status === 'partial').length;

  const transactionEffectsRowFeedback: Record<string, SelectionMatrixRowFeedback> = Object.fromEntries(
    transactionEffectsDefinition.rows.map((row) => [
      row.id,
      {
        status: (transactionEffectsFeedback[row.id]?.status ?? 'incorrect') as SelectionMatrixRowFeedback['status'],
        scoreLabel: transactionEffectsFeedback[row.id]?.scoreLabel ?? '0/1',
        selectedLabel: transactionEffectsFeedback[row.id]?.selectedLabel ?? 'Not selected',
        expectedLabel: transactionEffectsFeedback[row.id]?.expectedLabel ?? 'Unknown',
        misconceptionTags: transactionEffectsFeedback[row.id]?.misconceptionTags ?? [],
        message: transactionEffectsFeedback[row.id]?.message,
      },
    ]),
  );

  const transactionMatrixRowFeedback: Record<string, SelectionMatrixRowFeedback> = Object.fromEntries(
    transactionMatrixDefinition.rows.map((row) => [
      row.id,
      {
        status: (transactionMatrixFeedback[row.id]?.status ?? 'incorrect') as SelectionMatrixRowFeedback['status'],
        scoreLabel: transactionMatrixFeedback[row.id]?.scoreLabel ?? '0/1',
        selectedLabel: transactionMatrixFeedback[row.id]?.selectedLabel ?? 'Not selected',
        expectedLabel: transactionMatrixFeedback[row.id]?.expectedLabel ?? 'Unknown',
        misconceptionTags: transactionMatrixFeedback[row.id]?.misconceptionTags ?? [],
        message: transactionMatrixFeedback[row.id]?.message,
      },
    ]),
  );

  const accountingEquationDefinition = accountingEquationFamily.generate(2026, {
    companyType: 'retail',
    hiddenTermId: 'equity',
    mode: 'guided_practice',
    tolerance: 1,
  });
  const accountingEquationSolution = accountingEquationFamily.solve(accountingEquationDefinition);
  const accountingEquationStudentResponse: AccountingEquationResponse = {
    equity: Math.max(1, (accountingEquationSolution.equity ?? 0) - 400),
  };
  const accountingEquationGrade = accountingEquationFamily.grade(
    accountingEquationDefinition,
    accountingEquationStudentResponse,
  );
  const accountingEquationFeedback = buildAccountingEquationReviewFeedback(
    accountingEquationDefinition,
    accountingEquationStudentResponse,
    accountingEquationGrade,
  );

  const postingBalancesDefinition = postingBalancesFamily.generate(2026, {
    mode: 'guided_practice',
    targetAccountCount: 4,
    postingAccountCount: 3,
    tolerance: 1,
  });
  const postingBalancesSolution = postingBalancesFamily.solve(postingBalancesDefinition);
  const postingBalanceTarget =
    postingBalancesDefinition.rows.find((row) => row.details.netChange !== 0) ?? postingBalancesDefinition.rows[0];
  const postingBalancesStudentResponse: PostingBalanceResponse = postingBalanceTarget
    ? {
        ...postingBalancesSolution,
        [postingBalanceTarget.id]: Math.max(1, (postingBalancesSolution[postingBalanceTarget.id] ?? 0) - 100),
      }
    : postingBalancesSolution;
  const postingBalancesGrade = postingBalancesFamily.grade(postingBalancesDefinition, postingBalancesStudentResponse);
  const postingBalancesFeedback = buildPostingBalanceReviewFeedback(
    postingBalancesDefinition,
    postingBalancesStudentResponse,
    postingBalancesGrade,
  );
  const postingBalancesRows = postingBalancesDefinition.rows.map((row) => ({
    id: row.id,
    accountLabel: row.label,
    startingBalance: row.details.startingBalance,
    normalSide: row.details.normalSide,
    netPostingCue: row.details.postingLines[0]?.effectLabel ?? 'No postings',
    placeholder: '0',
  }));

  const adjustingCalculationsCalculationDefinition = adjustingCalculationsFamily.generate(2026, {
    mode: 'guided_practice',
    presentation: 'calculation',
    scenarioKind: 'deferral',
    tolerance: 1,
  });
  const adjustingCalculationsCalculationSolution = adjustingCalculationsFamily.solve(
    adjustingCalculationsCalculationDefinition,
  ) as AdjustingCalculationsResponse;
  const adjustingCalculationsCalculationPart = adjustingCalculationsCalculationDefinition.parts[0];
  const adjustingCalculationsCalculationStudentResponse: AdjustingCalculationsResponse = adjustingCalculationsCalculationPart
    ? {
        ...adjustingCalculationsCalculationSolution,
        [adjustingCalculationsCalculationPart.id]:
          Number(adjustingCalculationsCalculationSolution[adjustingCalculationsCalculationPart.id] ?? 0) + 2,
      }
    : adjustingCalculationsCalculationSolution;
  const adjustingCalculationsCalculationGrade = adjustingCalculationsFamily.grade(
    adjustingCalculationsCalculationDefinition,
    adjustingCalculationsCalculationStudentResponse,
  );
  const adjustingCalculationsCalculationFeedback = buildAdjustingCalculationsReviewFeedback(
    adjustingCalculationsCalculationDefinition,
    adjustingCalculationsCalculationStudentResponse,
    adjustingCalculationsCalculationGrade,
  );
  const adjustingCalculationsNumericRows = adjustingCalculationsCalculationDefinition.parts.map((part) => ({
    id: part.id,
    label: part.label,
    kind: 'editable' as const,
    placeholder: '0',
    note: part.details.explanation,
  }));

  const adjustingCalculationsEntryDefinition = adjustingCalculationsFamily.generate(2026, {
    mode: 'guided_practice',
    presentation: 'journal-entry',
    scenarioKind: 'depreciation',
    tolerance: 1,
  });
  const adjustingCalculationsEntrySolution = adjustingCalculationsFamily.solve(
    adjustingCalculationsEntryDefinition,
  ) as Record<string, AdjustingCalculationsJournalLine>;
  const adjustingCalculationsEntryStudentResponse: AdjustingCalculationsResponse = {
    ...adjustingCalculationsEntrySolution,
    [adjustingCalculationsEntryDefinition.parts[0]?.id ?? 'line-1']: {
      ...(adjustingCalculationsEntrySolution[adjustingCalculationsEntryDefinition.parts[0]?.id ?? 'line-1'] ?? {}),
      memo: 'Incorrect memo',
    } as AdjustingCalculationsJournalLine,
  };
  const adjustingCalculationsEntryGrade = adjustingCalculationsFamily.grade(
    adjustingCalculationsEntryDefinition,
    adjustingCalculationsEntryStudentResponse,
  );
  const adjustingCalculationsEntryFeedback = buildAdjustingCalculationsReviewFeedback(
    adjustingCalculationsEntryDefinition,
    adjustingCalculationsEntryStudentResponse,
    adjustingCalculationsEntryGrade,
  );
  const adjustingCalculationsEntryRowFeedback: Record<string, JournalEntryRowFeedback> = Object.fromEntries(
    adjustingCalculationsEntryDefinition.parts.map((part) => [
      part.id,
      {
        status: (adjustingCalculationsEntryFeedback[part.id]?.status ?? 'incorrect') as JournalEntryRowFeedback['status'],
        message: adjustingCalculationsEntryFeedback[part.id]?.message,
        misconceptionTags: adjustingCalculationsEntryFeedback[part.id]?.misconceptionTags ?? [],
      },
    ]),
  );

  const depreciationPresentationDirectDefinition = depreciationPresentationFamily.generate(2026, {
    mode: 'guided_practice',
    layout: 'direct',
    tolerance: 1,
  });
  const depreciationPresentationDirectSolution = depreciationPresentationFamily.solve(
    depreciationPresentationDirectDefinition,
  ) as DepreciationPresentationResponse;
  const depreciationPresentationDirectPart = depreciationPresentationDirectDefinition.parts[0];
  const depreciationPresentationDirectStudentResponse: DepreciationPresentationResponse = depreciationPresentationDirectPart
    ? {
        ...depreciationPresentationDirectSolution,
        [depreciationPresentationDirectPart.id]:
          Number(depreciationPresentationDirectSolution[depreciationPresentationDirectPart.id] ?? 0) + 120,
      }
    : depreciationPresentationDirectSolution;
  const depreciationPresentationDirectGrade = depreciationPresentationFamily.grade(
    depreciationPresentationDirectDefinition,
    depreciationPresentationDirectStudentResponse,
  );
  const depreciationPresentationDirectFeedback = buildDepreciationPresentationReviewFeedback(
    depreciationPresentationDirectDefinition,
    depreciationPresentationDirectStudentResponse,
    depreciationPresentationDirectGrade,
  );

  const depreciationPresentationDerivedDefinition = depreciationPresentationFamily.generate(2026, {
    mode: 'guided_practice',
    layout: 'derived',
    tolerance: 1,
  });
  const depreciationPresentationDerivedSolution = depreciationPresentationFamily.solve(
    depreciationPresentationDerivedDefinition,
  ) as DepreciationPresentationResponse;
  const depreciationPresentationDerivedPart = depreciationPresentationDerivedDefinition.parts[0];
  const depreciationPresentationDerivedStudentResponse: DepreciationPresentationResponse = depreciationPresentationDerivedPart
    ? {
        ...depreciationPresentationDerivedSolution,
        [depreciationPresentationDerivedPart.id]:
          Number(depreciationPresentationDerivedSolution[depreciationPresentationDerivedPart.id] ?? 0) + 120,
      }
    : depreciationPresentationDerivedSolution;
  const depreciationPresentationDerivedGrade = depreciationPresentationFamily.grade(
    depreciationPresentationDerivedDefinition,
    depreciationPresentationDerivedStudentResponse,
  );
  const depreciationPresentationDerivedFeedback = buildDepreciationPresentationReviewFeedback(
    depreciationPresentationDerivedDefinition,
    depreciationPresentationDerivedStudentResponse,
    depreciationPresentationDerivedGrade,
  );

  // Family R: CVP Analysis
  const cvpDefinition = cvpAnalysisFamily.generate(2026, { mode: 'guided_practice', variant: 'break-even-units', tolerance: 1 });
  const cvpSolution = cvpAnalysisFamily.solve(cvpDefinition);
  const cvpFirstPart = cvpDefinition.parts[0];
  const cvpStudentResponse: CvpAnalysisResponse = cvpFirstPart
    ? { ...cvpSolution, [cvpFirstPart.id]: (cvpSolution[cvpFirstPart.id] ?? 0) + 50 }
    : cvpSolution;
  const cvpGrade = cvpAnalysisFamily.grade(cvpDefinition, cvpStudentResponse);
  const cvpFeedback = buildCvpAnalysisReviewFeedback(cvpDefinition, cvpStudentResponse, cvpGrade);

  // Family S: Interest Schedules
  const interestDefinition = interestSchedulesFamily.generate(2026, { mode: 'guided_practice', variant: 'compound-interest', tolerance: 1 });
  const interestSolution = interestSchedulesFamily.solve(interestDefinition);
  const interestFirstPart = interestDefinition.parts[0];
  const interestStudentResponse: InterestSchedulesResponse = interestFirstPart
    ? { ...interestSolution, [interestFirstPart.id]: (interestSolution[interestFirstPart.id] ?? 0) + 200 }
    : interestSolution;
  const interestGrade = interestSchedulesFamily.grade(interestDefinition, interestStudentResponse);
  const interestFeedback = buildInterestSchedulesReviewFeedback(interestDefinition, interestStudentResponse, interestGrade);

  // Family T: Depreciation Schedules
  const depScheduleDefinition = depreciationSchedulesFamily.generate(2026, { mode: 'guided_practice', method: 'double-declining', tolerance: 1 });
  const depScheduleSolution = depreciationSchedulesFamily.solve(depScheduleDefinition);
  const depScheduleFirstPart = depScheduleDefinition.parts[0];
  const depScheduleStudentResponse: DepreciationSchedulesResponse = depScheduleFirstPart
    ? { ...depScheduleSolution, [depScheduleFirstPart.id]: (depScheduleSolution[depScheduleFirstPart.id] ?? 0) + 300 }
    : depScheduleSolution;
  const depScheduleGrade = depreciationSchedulesFamily.grade(depScheduleDefinition, depScheduleStudentResponse);
  const depScheduleFeedback = buildDepreciationSchedulesReviewFeedback(depScheduleDefinition, depScheduleStudentResponse, depScheduleGrade);

  // Family U: Financial Analysis
  const finAnalysisDefinition = financialAnalysisFamily.generate(2026, { mode: 'guided_practice', variant: 'profitability', tolerance: 0.01 });
  const finAnalysisSolution = financialAnalysisFamily.solve(finAnalysisDefinition);
  const finAnalysisFirstPart = finAnalysisDefinition.parts[0];
  const finAnalysisStudentResponse: FinancialAnalysisResponse = finAnalysisFirstPart
    ? { ...finAnalysisSolution, [finAnalysisFirstPart.id]: (finAnalysisSolution[finAnalysisFirstPart.id] ?? 0) + 0.5 }
    : finAnalysisSolution;
  const finAnalysisGrade = financialAnalysisFamily.grade(finAnalysisDefinition, finAnalysisStudentResponse);
  const finAnalysisFeedback = buildFinancialAnalysisReviewFeedback(finAnalysisDefinition, finAnalysisStudentResponse, finAnalysisGrade);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="space-y-2 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Developer preview</p>
          <h1 className="text-3xl font-semibold tracking-tight">Accounting practice foundation preview</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Shared components backed by a deterministic mini-ledger snapshot.
          </p>
    </header>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family A preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Classification and statement mapping</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              The same 6-item dataset is shown in a guided student state and a review state with two intentional mistakes.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <CategorizationList
              title="Family A Guided Practice"
              description="Classify the accounts into the broad statement groups."
              items={familyAItems.map((item) => ({ ...item }))}
              zones={familyACategories.map((category) => ({ ...category }))}
              shuffleItems={false}
              mode="independent_practice"
            />

            <CategorizationList
              title="Family A Teacher Review"
              description="Read-only review with the same student artifact and annotated misconceptions."
              items={familyAItems.map((item) => ({ ...item }))}
              zones={familyACategories.map((category) => ({ ...category }))}
              readOnly
              teacherView
              mode="teaching"
              reviewPlacements={familyATeacherPlacements}
              reviewFeedback={familyATeacherFeedback}
              submissionSummary={{
                scoreLabel: '4/6 correct',
                attempts: 1,
                submittedAt: '2026-03-20 09:15',
                misconceptionCount: 2,
              }}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family M preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Normal balances and account nature</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              The same account set appears in a guided student state and a read-only teacher review with annotated misconceptions.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SelectionMatrix
              title="Family M Guided Practice"
              description="Choose the debit or credit normal balance for each account."
              rows={normalBalanceRows}
              columns={normalBalanceColumns}
              defaultValue={normalBalanceSolution}
            />

            <SelectionMatrix
              title="Family M Teacher Review"
              description="Read-only review with the same account set and misconception tags."
              rows={normalBalanceRows}
              columns={normalBalanceColumns}
              readOnly
              teacherView
              defaultValue={normalBalanceWrongAnswer}
              rowFeedback={normalBalanceReviewFeedback}
              submissionSummary={{
                scoreLabel: `${normalBalanceGrade.score}/${normalBalanceGrade.maxScore} correct`,
                attempts: 1,
                submittedAt: '2026-03-20 09:20',
                misconceptionCount: new Set(Object.values(normalBalanceFeedback).flatMap((feedback) => feedback.misconceptionTags ?? [])).size,
              }}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family K preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Effects of Missing Adjustments</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              The same omission scenario appears in a guided student state and a teacher review with annotated consequence patterns.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SelectionMatrix
              title="Family K Guided Practice"
              description={adjustmentEffectsDefinition.prompt.stem}
              rows={adjustmentEffectsDefinition.rows}
              columns={adjustmentEffectsDefinition.columns}
              defaultValue={adjustmentEffectsSolution}
              scenarioPanel={
                <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                  <div className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                    <div className="text-sm text-slate-700">{adjustmentEffectsDefinition.scenario.scenario}</div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What was missed</div>
                    <div className="text-sm text-slate-700">{adjustmentEffectsDefinition.scenario.missedAdjustment}</div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assumption</div>
                    <div className="text-sm text-slate-700">{adjustmentEffectsDefinition.scenario.periodEndAssumption}</div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Think about what the correct adjustment would change first, then compare adjusted versus unadjusted statements.
                  </p>
                </div>
              }
            />

            <SelectionMatrix
              title="Family K Teacher Review"
              description={adjustmentEffectsDefinition.prompt.stem}
              rows={adjustmentEffectsDefinition.rows}
              columns={adjustmentEffectsDefinition.columns}
              readOnly
              teacherView
              defaultValue={adjustmentEffectsStudentResponse}
              rowFeedback={adjustmentEffectsReviewFeedback}
              submissionSummary={{
                scoreLabel: `${adjustmentEffectsGrade.score}/${adjustmentEffectsGrade.maxScore} correct`,
                attempts: 1,
                submittedAt: '2026-03-20 09:25',
                misconceptionCount: new Set(
                  Object.values(adjustmentEffectsFeedback).flatMap((feedback) => feedback.misconceptionTags ?? []),
                ).size,
              }}
              scenarioPanel={
                <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                  <div className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)]">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                    <div className="text-sm text-slate-700">{adjustmentEffectsDefinition.scenario.scenario}</div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What was missed</div>
                    <div className="text-sm text-slate-700">{adjustmentEffectsDefinition.scenario.missedAdjustment}</div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assumption</div>
                    <div className="text-sm text-slate-700">{adjustmentEffectsDefinition.scenario.periodEndAssumption}</div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Think about what the correct adjustment would change first, then compare adjusted versus unadjusted statements.
                  </p>
                </div>
              }
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family G preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Trial balance error analysis</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              The same error pattern appears in a guided student state and a read-only teacher review with scenario-level feedback.
            </p>
          </div>

          {trialBalanceErrorFirstScenario && (
            <div className="rounded-2xl border bg-slate-50/80 p-4">
              <div className="grid gap-3 sm:grid-cols-[132px_minmax(0,1fr)]">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What happened</div>
                <div className="text-sm text-slate-700">{trialBalanceErrorFirstScenario.whatHappened}</div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Error type</div>
                <div className="text-sm text-slate-700">{trialBalanceErrorFirstScenario.archetypeLabel}</div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to decide first</div>
                <div className="text-sm text-slate-700">{trialBalanceErrorFirstScenario.whatToDecideFirst}</div>
              </div>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <TrialBalanceErrorMatrix
              title="Family G Guided Practice"
              description="Read the scenario, decide whether the trial balance balances, then choose the difference and larger column."
              scenarios={trialBalanceErrorDefinition.scenarios}
              defaultValue={trialBalanceErrorSolution}
            />

            <TrialBalanceErrorMatrix
              title="Family G Teacher Review"
              description="Read-only review with row-level evidence and misconception tags."
              scenarios={trialBalanceErrorDefinition.scenarios}
              readOnly
              teacherView
              defaultValue={trialBalanceErrorStudentResponse}
              rowFeedback={trialBalanceErrorRowFeedback}
              submissionSummary={{
                scoreLabel: `${trialBalanceErrorGrade.score}/${trialBalanceErrorGrade.maxScore} correct`,
                attempts: 1,
                submittedAt: '2026-03-20 09:25',
                misconceptionCount: new Set(Object.values(trialBalanceErrorRowFeedback).flatMap((feedback) => feedback.misconceptionTags ?? [])).size,
              }}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction analysis</p>
            <h2 className="text-2xl font-semibold tracking-tight">Families C and F</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Transaction-effects and transaction-matrix share the same narrative spine, but Family C stays close to the account
              effects while Family F slows the reasoning down into a scaffolded decision path.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family C preview</p>
                <h3 className="text-xl font-semibold tracking-tight">Transaction effects on accounts</h3>
                <p className="max-w-4xl text-sm text-slate-600">
                  Mark how each account or category changes because of this transaction.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <SelectionMatrix
                  title="Family C Guided Practice"
                  description="Select how the affected accounts and summary categories change."
                  rows={transactionEffectsDefinition.rows}
                  columns={transactionEffectsDefinition.columns}
                  defaultValue={transactionEffectsMatrixValue}
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction</div>
                        <div className="text-sm text-slate-700">{transactionEffectsDefinition.event.narrative}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Amount</div>
                        <div className="text-sm text-slate-700">{formatAccountingAmount(transactionEffectsDefinition.event.amount)}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Why equity changes</div>
                        <div className="text-sm text-slate-700">{transactionEffectsDefinition.event.equityReason}</div>
                      </div>
                    </div>
                  }
                />

                <SelectionMatrix
                  title="Family C Teacher Review"
                  description="Read-only review with the same transaction and annotated misconceptions."
                  rows={transactionEffectsDefinition.rows}
                  columns={transactionEffectsDefinition.columns}
                  readOnly
                  teacherView
                  defaultValue={transactionEffectsMatrixStudentValue}
                  rowFeedback={transactionEffectsRowFeedback}
                  submissionSummary={{
                    scoreLabel: `${transactionEffectsGrade.score}/${transactionEffectsGrade.maxScore} correct`,
                    attempts: 1,
                    submittedAt: '2026-03-20 09:30',
                    misconceptionCount: new Set(
                      Object.values(transactionEffectsFeedback).flatMap((feedback) => feedback.misconceptionTags ?? []),
                    ).size,
                  }}
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction</div>
                        <div className="text-sm text-slate-700">{transactionEffectsDefinition.event.narrative}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Amount</div>
                        <div className="text-sm text-slate-700">{formatAccountingAmount(transactionEffectsDefinition.event.amount)}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Why equity changes</div>
                        <div className="text-sm text-slate-700">{transactionEffectsDefinition.event.equityReason}</div>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family F preview</p>
                <h3 className="text-xl font-semibold tracking-tight">Transaction reasoning matrix</h3>
                <p className="max-w-4xl text-sm text-slate-600">
                  Work left to right: first identify whether the row is affected, then explain the change.
                </p>
              </div>

              <SelectionMatrix
                title="Family F Guided Practice"
                description="Select the reasoning stage that matches each row."
                rows={transactionMatrixDefinition.rows}
                columns={transactionMatrixDefinition.columns}
                defaultValue={transactionMatrixMatrixValue}
                scenarioPanel={
                  <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                    <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction</div>
                      <div className="text-sm text-slate-700">{transactionMatrixScenario.narrative}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Business context</div>
                      <div className="text-sm text-slate-700">
                        {transactionMatrixScenario.context} context • {transactionMatrixScenario.settlement ?? 'cash'}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Source document clue</div>
                      <div className="text-sm text-slate-700">{transactionMatrixScenario.tags.join(' • ')}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to decide first</div>
                      <div className="text-sm text-slate-700">{transactionMatrixReason}</div>
                    </div>
                  </div>
                }
              />

              <SelectionMatrix
                title="Family F Teacher Review"
                description="Read-only review with the same reasoning stages and stage-level feedback."
                rows={transactionMatrixDefinition.rows}
                columns={transactionMatrixDefinition.columns}
                readOnly
                teacherView
                defaultValue={transactionMatrixMatrixStudentValue}
                rowFeedback={transactionMatrixRowFeedback}
                submissionSummary={{
                  scoreLabel: `${transactionMatrixGrade.score}/${transactionMatrixGrade.maxScore} correct`,
                  attempts: 1,
                  submittedAt: '2026-03-20 09:35',
                  misconceptionCount: new Set(
                    Object.values(transactionMatrixFeedback).flatMap((feedback) => feedback.misconceptionTags ?? []),
                  ).size,
                }}
                scenarioPanel={
                  <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                    <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction</div>
                      <div className="text-sm text-slate-700">{transactionMatrixScenario.narrative}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Business context</div>
                      <div className="text-sm text-slate-700">
                        {transactionMatrixScenario.context} context • {transactionMatrixScenario.settlement ?? 'cash'}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Source document clue</div>
                      <div className="text-sm text-slate-700">{transactionMatrixScenario.tags.join(' • ')}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to decide first</div>
                      <div className="text-sm text-slate-700">{transactionMatrixReason}</div>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family H preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Journal entry recording</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Family H shows a multi-date merchandising return sequence with a teacher review that accepts equivalent line
              order.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
              <JournalEntryTable
                title="Family H Guided Practice"
                description="Record the journal lines in canonical order. The balance strip stays visible below the table."
                availableAccounts={journalEntryDefinition.availableAccounts}
                expectedLineCount={journalEntryDefinition.expectedLineCount}
                defaultValue={journalEntrySolution}
                scenarioPanel={
                  <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Expected lines: {journalEntryDefinition.expectedLineCount}</Badge>
                      <Badge variant="secondary">Mode: Guided practice</Badge>
                      <Badge variant="default">Balanced</Badge>
                      <Badge variant="outline">Dates: {journalEntryDefinition.scenario.dates.join(' • ')}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                      <div className="text-sm text-slate-700">{journalEntryDefinition.scenario.narrative}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to notice</div>
                      <div className="text-sm text-slate-700">
                        The date column keeps the original sale, the return and allowance, and the final collection separate.
                      </div>
                    </div>
                  </div>
                }
              />
            </div>

            <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Score: {journalEntryGrade.score}/{journalEntryGrade.maxScore} correct</Badge>
                <Badge variant="secondary">Attempts: 2</Badge>
                <Badge variant="secondary">Submitted: 2026-03-20 09:40</Badge>
                <Badge variant="outline">Equivalent rows: {journalEntryEquivalentRows}</Badge>
              </div>

              <div className="grid gap-2 rounded-2xl border bg-white/90 p-4">
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Teacher note</div>
                  <div className="text-sm text-slate-700">
                    The student entered the same accounting logic, but the first two lines were swapped. The review keeps the
                    response readable and marks the equivalent ordering as accepted.
                  </div>
                </div>
              </div>

              <JournalEntryTable
                title="Family H Teacher Review"
                description="Read-only evidence with row-level feedback and equivalent-order acceptance."
                availableAccounts={journalEntryDefinition.availableAccounts}
                expectedLineCount={journalEntryDefinition.expectedLineCount}
                defaultValue={journalEntryStudentResponse}
                readOnly
                teacherView
                rowFeedback={journalEntryRowFeedback}
                scenarioPanel={
                  <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Expected lines: {journalEntryDefinition.expectedLineCount}</Badge>
                      <Badge variant="secondary">Mode: Guided practice</Badge>
                      <Badge variant="default">Balanced</Badge>
                      <Badge variant="outline">Dates: {journalEntryDefinition.scenario.dates.join(' • ')}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                      <div className="text-sm text-slate-700">{journalEntryDefinition.scenario.narrative}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to notice</div>
                      <div className="text-sm text-slate-700">
                        The date column keeps the original sale, the return and allowance, and the final collection separate.
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family L preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Cycle decisions</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Family L stacks the decision first and the entry second: the student chooses what should be reversed, then prepares
              the closing entry from the adjusted trial balance.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Decision task</Badge>
                <Badge variant="secondary">Period: 01/01</Badge>
                <Badge variant="secondary">Policy: reversing recommended</Badge>
                <Badge variant="outline">Rows: {cycleDecisionSelectionDefinition.selectionRows.length}</Badge>
              </div>

              <div className="grid gap-2 rounded-2xl border bg-white/90 p-4">
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                  <div className="text-sm text-slate-700">{cycleDecisionSelectionDefinition.scenario.narrative}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to notice</div>
                  <div className="text-sm text-slate-700">
                    Reverse the accrual that will be paid next period, but keep depreciation and closing entries in place.
                  </div>
                </div>
              </div>

              <SelectionMatrix
                title="Family L Guided Decision"
                description="Choose whether each candidate entry should be reversed in the next period."
                rows={cycleDecisionSelectionDefinition.selectionRows}
                columns={cycleDecisionSelectionDefinition.selectionColumns}
                defaultValue={cycleDecisionSelectionSolution.selections}
              />

              <SelectionMatrix
                title="Family L Decision Review"
                description="Read-only review with the same reversal decisions and annotated misconception tags."
                rows={cycleDecisionSelectionDefinition.selectionRows}
                columns={cycleDecisionSelectionDefinition.selectionColumns}
                readOnly
                teacherView
                defaultValue={cycleDecisionSelectionStudentResponse.selections}
                rowFeedback={cycleDecisionSelectionRowFeedback}
                submissionSummary={{
                  scoreLabel: `${cycleDecisionSelectionGrade.score}/${cycleDecisionSelectionGrade.maxScore} correct`,
                  attempts: 1,
                  submittedAt: '2026-03-20 09:42',
                  misconceptionCount: new Set(
                    Object.values(cycleDecisionSelectionFeedback).flatMap((feedback) => feedback.misconceptionTags ?? []),
                  ).size,
                }}
              />
            </div>

            <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Entry task</Badge>
                <Badge variant="secondary">Date: 12/31</Badge>
                <Badge variant="secondary">Adjusted trial balance</Badge>
                <Badge variant="outline">Lines: {cycleDecisionClosingDefinition.expectedLineCount}</Badge>
              </div>

              <div className="grid gap-2 rounded-2xl border bg-white/90 p-4">
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                  <div className="text-sm text-slate-700">{cycleDecisionClosingDefinition.scenario.narrative}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to notice</div>
                  <div className="text-sm text-slate-700">
                    Closing entries always clear temporary accounts to retained earnings, and accepted equivalent logic is noted
                    in teacher review.
                  </div>
                </div>
              </div>

              <JournalEntryTable
                title="Family L Guided Entry"
                description="Prepare the closing entry in canonical order."
                availableAccounts={cycleDecisionClosingDefinition.availableAccounts}
                expectedLineCount={cycleDecisionClosingDefinition.expectedLineCount}
                defaultValue={cycleDecisionClosingSolution.lines}
              />

              <div className="rounded-2xl border bg-white/90 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Score: {cycleDecisionClosingGrade.score}/{cycleDecisionClosingGrade.maxScore} correct</Badge>
                  <Badge variant="secondary">Attempts: 1</Badge>
                  <Badge variant="secondary">Submitted: 2026-03-20 09:44</Badge>
                  <Badge variant="outline">Equivalent rows: {cycleDecisionClosingEquivalentRows}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Accepted equivalent closing logic is called out here so teachers can see that the same accounting result was
                  reached even when the closing lines were entered in a different order.
                </p>
              </div>

              <JournalEntryTable
                title="Family L Entry Review"
                description="Read-only closing entry with row-level feedback and equivalent-order acceptance."
                availableAccounts={cycleDecisionClosingDefinition.availableAccounts}
                expectedLineCount={cycleDecisionClosingDefinition.expectedLineCount}
                defaultValue={cycleDecisionClosingStudentResponse.lines}
                readOnly
                teacherView
                rowFeedback={cycleDecisionClosingRowFeedback}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family P preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Merchandising entries</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Family P makes the timeline explicit before the journal table so students read the merchandise story in order,
              then translate that sequence into perpetual inventory entries.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Role: {merchandisingEntryDefinition.timeline.role}</Badge>
                <Badge variant="secondary">Method: {merchandisingEntryDefinition.timeline.discountMethod}</Badge>
                <Badge variant="secondary">Terms: {merchandisingEntryDefinition.timeline.paymentTiming}</Badge>
                <Badge variant="secondary">FOB: {merchandisingEntryDefinition.timeline.fobCondition}</Badge>
                <Badge variant="outline">Dates: {merchandisingEntryDefinition.scenario.dates.join(' • ')}</Badge>
              </div>

              <div className="grid gap-3 rounded-2xl border bg-white/90 p-4">
                <div className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                  <div className="text-sm text-slate-700">{merchandisingEntryDefinition.scenario.narrative}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to notice</div>
                  <div className="text-sm text-slate-700">{merchandisingEntryDefinition.scenario.focus}</div>
                </div>
              </div>

              <ol className="space-y-3">
                {merchandisingEntryDefinition.events.map((event, index) => (
                  <li key={event.id} className="rounded-2xl border bg-white/90 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <Badge variant="secondary">{event.kind.replace(/-/g, ' ')}</Badge>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{event.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{event.narrative}</p>
                  </li>
                ))}
              </ol>

              <JournalEntryTable
                title="Family P Guided Practice"
                description="Record the seller-side perpetual entries in chronological order."
                availableAccounts={merchandisingEntryDefinition.availableAccounts}
                expectedLineCount={merchandisingEntryDefinition.expectedLineCount}
                defaultValue={merchandisingEntrySolution}
              />
            </div>

            <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Score: {merchandisingEntryGrade.score}/{merchandisingEntryGrade.maxScore} correct</Badge>
                <Badge variant="secondary">Attempts: 1</Badge>
                <Badge variant="secondary">Submitted: 2026-03-20 09:48</Badge>
                <Badge variant="outline">Equivalent rows: {merchandisingEntryEquivalentRows}</Badge>
              </div>

              <div className="grid gap-3 rounded-2xl border bg-white/90 p-4">
                <div className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Teacher note</div>
                  <div className="text-sm text-slate-700">
                    The seller’s response is economically correct even though the first two journal rows were swapped, so the
                    review keeps the work readable and labels the accepted equivalent ordering.
                  </div>
                </div>
              </div>

              <JournalEntryTable
                title="Family P Teacher Review"
                description="Read-only perpetual inventory evidence with row-level feedback and equivalent-order acceptance."
                availableAccounts={merchandisingEntryDefinition.availableAccounts}
                expectedLineCount={merchandisingEntryDefinition.expectedLineCount}
                defaultValue={merchandisingEntryStudentResponse}
                readOnly
                teacherView
                rowFeedback={merchandisingEntryRowFeedback}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family B preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Accounting equation workbench</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Family B uses the mini-ledger snapshot to hide one term in the accounting equation and keeps the teacher review
              aligned with the same workbench.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AccountingEquationLayout
              title="Family B Guided Practice"
              description="Complete the hidden term using the equation workbench."
              facts={accountingEquationDefinition.facts}
              terms={accountingEquationDefinition.terms}
              mode="guided_practice"
              helperText={accountingEquationDefinition.scaffolding.helperText}
              defaultValues={{ equity: '' }}
            />

            <AccountingEquationLayout
              title="Family B Teacher Review"
              description="Read-only evidence with the submitted answer and a single review annotation."
              facts={accountingEquationDefinition.facts}
              terms={accountingEquationDefinition.terms}
              mode="assessment"
              values={{ equity: String(accountingEquationStudentResponse.equity) }}
              readOnly
              teacherView
              feedback={accountingEquationFeedback}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family I preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Posting balances workboard</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Family I keeps the posting sequence in a reference panel and asks for the ending balance on each account row.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <PostingBalanceList
              title="Family I Guided Practice"
              description="Use the posting trail and starting balance to compute each ending balance."
              referenceTitle={postingBalancesDefinition.scaffolding.referenceTitle}
              referenceLines={postingBalancesDefinition.postingLines}
              rows={postingBalancesRows}
              mode="guided_practice"
              defaultValues={Object.fromEntries(postingBalancesRows.map((row) => [row.id, '']))}
            />

            <PostingBalanceList
              title="Family I Teacher Review"
              description="Read-only evidence with row-level review feedback and posting tags."
              referenceTitle={postingBalancesDefinition.scaffolding.referenceTitle}
              referenceLines={postingBalancesDefinition.postingLines}
              rows={postingBalancesRows}
              mode="assessment"
              values={Object.fromEntries(
                postingBalancesDefinition.rows.map((row) => [row.id, String(postingBalancesStudentResponse[row.id] ?? '')]),
              )}
              readOnly
              teacherView
              rowFeedback={postingBalancesFeedback}
            />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <SelectionMatrix
            title="Selection Matrix"
            description="Classify the main ledger groups."
            rows={selectionRows}
            columns={[
              { id: 'assets', label: 'Assets' },
              { id: 'liabilities', label: 'Liabilities' },
              { id: 'equity', label: 'Equity' },
            ]}
            defaultValue={{ assets: 'assets', liabilities: 'liabilities', equity: 'equity' }}
            teacherView
            rowFeedback={{
              assets: { status: 'correct', scoreLabel: 'Correct' },
              liabilities: { status: 'correct', scoreLabel: 'Correct' },
              equity: { status: 'correct', scoreLabel: 'Correct' },
            }}
          />

          <StatementLayout
            title="Statement Layout"
            description="Editable blanks, computed totals, and teacher annotations."
            sections={statementSections}
            defaultValues={{
              revenue: String(miniLedger.totals.revenue),
              expenses: String(miniLedger.totals.expenses),
              'beginning-capital': String(miniLedger.totals.beginningCapital),
              dividends: String(miniLedger.totals.dividends),
            }}
            teacherView
            rowFeedback={{
              revenue: { status: 'correct', message: 'Revenue pulled from the snapshot.' },
              expenses: { status: 'correct', message: 'Expenses pulled from the snapshot.' },
            }}
          />
        </div>


        {(() => {
          const statementConstructionDefinition = statementConstructionFamily.generate(2026, {
            mode: 'guided_practice',
            statementKind: 'income-statement',
          });
          const statementConstructionSolution = statementConstructionFamily.solve(statementConstructionDefinition);
          const statementConstructionLabelPart =
            statementConstructionDefinition.parts.find((part) => part.details.expectedAnswerType === 'label') ??
            statementConstructionDefinition.parts[0];
          const statementConstructionAmountPart =
            statementConstructionDefinition.parts.find((part) => part.details.expectedAnswerType === 'number') ??
            statementConstructionDefinition.parts[1];
          const statementConstructionStudentResponse: StatementConstructionResponse = {
            ...statementConstructionSolution,
            ...(statementConstructionLabelPart
              ? {
                  [statementConstructionLabelPart.id]: 'Wrong Account',
                }
              : {}),
            ...(statementConstructionAmountPart
              ? {
                  [statementConstructionAmountPart.id]: Number(statementConstructionSolution[statementConstructionAmountPart.id] ?? 0) + 125,
                }
              : {}),
          };
          const statementConstructionGradeResult = statementConstructionFamily.grade(
            statementConstructionDefinition,
            statementConstructionStudentResponse,
          );
          const statementConstructionFeedback = buildStatementConstructionReviewFeedback(
            statementConstructionDefinition,
            statementConstructionStudentResponse,
            statementConstructionGradeResult,
          );
          const statementConstructionReviewCount = Object.values(statementConstructionFeedback).filter(
            (feedback) => feedback?.status !== 'correct',
          ).length;

          return (
            <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family E preview</p>
                <h2 className="text-2xl font-semibold tracking-tight">Statement construction workbook</h2>
                <p className="max-w-4xl text-sm text-slate-600">
                  Family E asks students to place the correct account names from a bank into a blank statement template and finish the totals.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <StatementLayout
                  title="Family E Guided Practice"
                  description="Type the account names in the left-side blanks and complete the subtotals on the right."
                  sections={statementConstructionDefinition.sections}
                  defaultValues={Object.fromEntries(statementConstructionDefinition.parts.map((part) => [part.id, '']))}
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span>{statementConstructionDefinition.scaffolding.bankLabel}</span>
                        <span>•</span>
                        <span>{statementConstructionDefinition.scaffolding.statementLabel}</span>
                        <span>•</span>
                        <span>Seed 2026</span>
                        <span>•</span>
                        <span>{statementConstructionDefinition.miniLedger.companyType}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {statementConstructionDefinition.accountBank.map((item) => (
                          <Badge
                            key={`${item.id}-${item.included ? 'included' : 'distractor'}`}
                            variant={item.included ? 'secondary' : 'outline'}
                            className="gap-1.5"
                          >
                            <span>{item.label}</span>
                            <span className="text-[11px] font-normal opacity-80">{formatAccountingAmount(item.amount)}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  }
                  scaffoldText={statementConstructionDefinition.scaffolding.guidance}
                />

                <StatementLayout
                  title="Family E Teacher Review"
                  description="Read-only evidence with row-level review feedback and the same bank of candidate accounts."
                  sections={statementConstructionDefinition.sections}
                  values={Object.fromEntries(
                    statementConstructionDefinition.rows.map((row) => [row.id, String(statementConstructionStudentResponse[row.id] ?? '')]),
                  )}
                  readOnly
                  teacherView
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span>{statementConstructionDefinition.scaffolding.bankLabel}</span>
                        <span>•</span>
                        <span>{statementConstructionDefinition.scaffolding.statementLabel}</span>
                        <span>•</span>
                        <span>Seed 2026</span>
                        <span>•</span>
                        <span>{statementConstructionDefinition.miniLedger.companyType}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {statementConstructionDefinition.accountBank.map((item) => (
                          <Badge
                            key={`${item.id}-${item.included ? 'included' : 'distractor'}`}
                            variant={item.included ? 'secondary' : 'outline'}
                            className="gap-1.5"
                          >
                            <span>{item.label}</span>
                            <span className="text-[11px] font-normal opacity-80">{formatAccountingAmount(item.amount)}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  }
                  scaffoldText={statementConstructionDefinition.scaffolding.guidance}
                  reviewSummary={[
                    { label: 'Attempt', value: '1' },
                    {
                      label: 'Score',
                      value: `${statementConstructionGradeResult.score}/${statementConstructionGradeResult.maxScore}`,
                    },
                    { label: 'Submitted', value: 'Preview sample' },
                    { label: 'Needs review', value: String(statementConstructionReviewCount) },
                  ]}
                  rowFeedback={statementConstructionFeedback}
                />
              </div>
            </section>
          );
        })()}

        {(() => {
          const statementSubtotalsDefinition = statementSubtotalsFamily.generate(2026, {
            mode: 'guided_practice',
            statementKind: 'income-statement',
          });
          const statementSubtotalsSolution = statementSubtotalsFamily.solve(statementSubtotalsDefinition);
          const statementSubtotalsFirstPart = statementSubtotalsDefinition.parts[0];
          const statementSubtotalsStudentResponse: StatementSubtotalsResponse = {
            ...statementSubtotalsSolution,
            ...(statementSubtotalsFirstPart
              ? {
                  [statementSubtotalsFirstPart.id]: Number(statementSubtotalsSolution[statementSubtotalsFirstPart.id] ?? 0) + 125,
                }
              : {}),
          };
          const statementSubtotalsGradeResult = statementSubtotalsFamily.grade(
            statementSubtotalsDefinition,
            statementSubtotalsStudentResponse,
          );
          const statementSubtotalsFeedback = buildStatementSubtotalsReviewFeedback(
            statementSubtotalsDefinition,
            statementSubtotalsStudentResponse,
            statementSubtotalsGradeResult,
          );
          const statementSubtotalsBlankCount = statementSubtotalsDefinition.parts.length;
          const statementSubtotalsReviewCount = Object.values(statementSubtotalsFeedback).filter(
            (feedback) => feedback?.status !== 'correct',
          ).length;

          return (
            <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family Q preview</p>
                <h2 className="text-2xl font-semibold tracking-tight">Statement subtotal worksheet</h2>
                <p className="max-w-4xl text-sm text-slate-600">
                  Family Q keeps the statement structure visible but focuses on the dependent subtotals that tie the sections together.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <StatementLayout
                  title="Family Q Guided Practice"
                  description="Complete the missing subtotal lines after reading the prefilled statement rows."
                  sections={statementSubtotalsDefinition.sections}
                  defaultValues={Object.fromEntries(statementSubtotalsDefinition.parts.map((part) => [part.id, '']))}
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Statement type</div>
                        <div className="text-sm text-slate-700">{statementSubtotalsDefinition.scaffolding.statementLabel}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Blanks</div>
                        <div className="text-sm text-slate-700">{statementSubtotalsBlankCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to notice</div>
                        <div className="text-sm text-slate-700">{statementSubtotalsDefinition.scaffolding.guidance}</div>
                      </div>
                    </div>
                  }
                  scaffoldText={statementSubtotalsDefinition.scaffolding.guidance}
                />

                <StatementLayout
                  title="Family Q Teacher Review"
                  description="Read-only evidence with row-level review feedback and the same subtotal relationships."
                  sections={statementSubtotalsDefinition.sections}
                  values={Object.fromEntries(
                    statementSubtotalsDefinition.rows
                      .filter((row) => row.kind === 'editable')
                      .map((row) => [row.id, String(statementSubtotalsStudentResponse[row.id] ?? '')]),
                  )}
                  readOnly
                  teacherView
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Statement type</div>
                        <div className="text-sm text-slate-700">{statementSubtotalsDefinition.scaffolding.statementLabel}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Blanks</div>
                        <div className="text-sm text-slate-700">{statementSubtotalsBlankCount}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to notice</div>
                        <div className="text-sm text-slate-700">{statementSubtotalsDefinition.scaffolding.guidance}</div>
                      </div>
                    </div>
                  }
                  scaffoldText={statementSubtotalsDefinition.scaffolding.guidance}
                  reviewSummary={[
                    { label: 'Attempt', value: '1' },
                    {
                      label: 'Score',
                      value: `${statementSubtotalsGradeResult.score}/${statementSubtotalsGradeResult.maxScore}`,
                    },
                    { label: 'Submitted', value: 'Preview sample' },
                    { label: 'Needs review', value: String(statementSubtotalsReviewCount) },
                  ]}
                  rowFeedback={statementSubtotalsFeedback}
                />
              </div>
            </section>
          );
        })()}

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family J preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Adjusting calculations</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Family J first asks for the adjustment amount, then shows the journal entry that records the same business fact.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <StatementLayout
                title="Family J Guided Practice"
                description="Compute the adjustment amount before recording the entry."
                sections={[
                  {
                    id: 'adjustment-targets',
                    label: 'Adjustment targets',
                    description: 'Read the facts, then compute the number you would record.',
                    rows: adjustingCalculationsNumericRows,
                  },
                ]}
                defaultValues={Object.fromEntries(adjustingCalculationsNumericRows.map((row) => [row.id, '']))}
                scenarioPanel={
                  <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                    <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                      <div className="text-sm text-slate-700">{adjustingCalculationsCalculationDefinition.scenario.stem}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Adjustment amount</div>
                      <div className="text-sm text-slate-700">{formatAccountingAmount(adjustingCalculationsCalculationDefinition.scenario.amount)}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Mode</div>
                      <div className="text-sm text-slate-700">{adjustingCalculationsCalculationDefinition.scaffolding.modeLabel}</div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{adjustingCalculationsCalculationDefinition.scaffolding.bridgeText}</p>
                  </div>
                }
                scaffoldText={adjustingCalculationsCalculationDefinition.scaffolding.bridgeText}
              />

              <StatementLayout
                title="Family J Teacher Review"
                description="Read-only evidence with the submitted calculation and a single review annotation."
                sections={[
                  {
                    id: 'adjustment-targets',
                    label: 'Adjustment targets',
                    description: 'The same calculation target appears in the teacher review.',
                    rows: adjustingCalculationsNumericRows,
                  },
                ]}
                values={Object.fromEntries(
                  adjustingCalculationsCalculationDefinition.parts.map((part) => [
                    part.id,
                    String(adjustingCalculationsCalculationStudentResponse[part.id] ?? ''),
                  ]),
                )}
                readOnly
                teacherView
                scenarioPanel={
                  <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                    <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                      <div className="text-sm text-slate-700">{adjustingCalculationsCalculationDefinition.scenario.stem}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Adjustment amount</div>
                      <div className="text-sm text-slate-700">{formatAccountingAmount(adjustingCalculationsCalculationDefinition.scenario.amount)}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Mode</div>
                      <div className="text-sm text-slate-700">{adjustingCalculationsCalculationDefinition.scaffolding.modeLabel}</div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{adjustingCalculationsCalculationDefinition.scaffolding.bridgeText}</p>
                  </div>
                }
                scaffoldText={adjustingCalculationsCalculationDefinition.scaffolding.bridgeText}
                reviewSummary={[
                  { label: 'Attempt', value: '1' },
                  {
                    label: 'Score',
                    value: `${adjustingCalculationsCalculationGrade.score}/${adjustingCalculationsCalculationGrade.maxScore}`,
                  },
                  { label: 'Needs review', value: String(Object.values(adjustingCalculationsCalculationFeedback).filter((item) => item.status !== 'correct').length) },
                  { label: 'Adjustment type', value: adjustingCalculationsCalculationDefinition.scenario.kind.replace(/-/g, ' ') },
                ]}
                rowFeedback={Object.fromEntries(
                  adjustingCalculationsCalculationDefinition.parts.map((part) => [
                    part.id,
                    {
                      status: (adjustingCalculationsCalculationFeedback[part.id]?.status ?? 'incorrect') as 'correct' | 'incorrect' | 'partial',
                      message: adjustingCalculationsCalculationFeedback[part.id]?.message,
                      misconceptionTags: adjustingCalculationsCalculationFeedback[part.id]?.misconceptionTags ?? [],
                    },
                  ]),
                )}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
                <JournalEntryTable
                  title="Family J Guided Entry"
                  description="Record the adjusting entry after computing the amount."
                  availableAccounts={adjustingCalculationsEntryDefinition.availableAccounts}
                  expectedLineCount={adjustingCalculationsEntryDefinition.entryLines.length}
                  defaultValue={Object.values(adjustingCalculationsEntrySolution)}
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Amount to record: {formatAccountingAmount(adjustingCalculationsEntryDefinition.scenario.amount)}</Badge>
                        <Badge variant="secondary">{adjustingCalculationsEntryDefinition.presentation}</Badge>
                        <Badge variant="outline">{adjustingCalculationsEntryDefinition.scenario.reportingDate}</Badge>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                        <div className="text-sm text-slate-700">{adjustingCalculationsEntryDefinition.scenario.stem}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bridge</div>
                        <div className="text-sm text-slate-700">{adjustingCalculationsEntryDefinition.scaffolding.bridgeText}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Mode</div>
                        <div className="text-sm text-slate-700">{adjustingCalculationsEntryDefinition.scaffolding.modeLabel}</div>
                      </div>
                    </div>
                  }
                />
              </div>

              <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Score: {adjustingCalculationsEntryGrade.score}/{adjustingCalculationsEntryGrade.maxScore}</Badge>
                  <Badge variant="secondary">Attempts: 1</Badge>
                  <Badge variant="outline">{adjustingCalculationsEntryDefinition.scenario.kind.replace(/-/g, ' ')}</Badge>
                </div>

                <Card>
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg">Teacher note</CardTitle>
                    <CardDescription>
                      The student computed the adjustment amount, but the journal entry memo was altered to surface the review state.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Adjustment amount</div>
                      <div className="text-sm text-slate-700">{formatAccountingAmount(adjustingCalculationsEntryDefinition.scenario.amount)}</div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bridge</div>
                      <div className="text-sm text-slate-700">{adjustingCalculationsEntryDefinition.scaffolding.bridgeText}</div>
                    </div>
                  </CardContent>
                </Card>

                <JournalEntryTable
                  title="Family J Teacher Review"
                  description="Read-only journal entry evidence with row-level feedback."
                  availableAccounts={adjustingCalculationsEntryDefinition.availableAccounts}
                  expectedLineCount={adjustingCalculationsEntryDefinition.entryLines.length}
                  defaultValue={Object.values(adjustingCalculationsEntryStudentResponse as Record<string, AdjustingCalculationsJournalLine>)}
                  readOnly
                  teacherView
                  rowFeedback={adjustingCalculationsEntryRowFeedback}
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Amount to record: {formatAccountingAmount(adjustingCalculationsEntryDefinition.scenario.amount)}</Badge>
                        <Badge variant="secondary">{adjustingCalculationsEntryDefinition.presentation}</Badge>
                        <Badge variant="outline">{adjustingCalculationsEntryDefinition.scenario.reportingDate}</Badge>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                        <div className="text-sm text-slate-700">{adjustingCalculationsEntryDefinition.scenario.stem}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bridge</div>
                        <div className="text-sm text-slate-700">{adjustingCalculationsEntryDefinition.scaffolding.bridgeText}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Mode</div>
                        <div className="text-sm text-slate-700">{adjustingCalculationsEntryDefinition.scaffolding.modeLabel}</div>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family N preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Depreciation presentation</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Family N keeps land as the contrast case and lets students present the depreciable asset net of accumulated depreciation.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
              <div className="grid gap-6 xl:grid-cols-2">
                <StatementLayout
                  title="Family N Guided Practice"
                  description="Present the PP&E section with the direct depreciation amount already given."
                  sections={depreciationPresentationDirectDefinition.sections}
                  defaultValues={Object.fromEntries(
                    depreciationPresentationDirectDefinition.rows.filter((row) => row.kind === 'editable').map((row) => [row.id, '']),
                  )}
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{depreciationPresentationDirectDefinition.layout}</Badge>
                        <Badge variant="secondary">{depreciationPresentationDirectDefinition.scenario.assetCategory}</Badge>
                        <Badge variant="outline">{depreciationPresentationDirectDefinition.scaffolding.sectionLabel}</Badge>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {depreciationPresentationDirectDefinition.assetRegister.map((item) => (
                          <div key={item.id} className="rounded-xl border bg-background/90 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                            <div className="mt-1 text-sm font-medium text-slate-800">{formatAccountingAmount(item.value)}</div>
                            {item.note && <div className="mt-1 text-xs text-slate-500">{item.note}</div>}
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-slate-700">{depreciationPresentationDirectDefinition.scaffolding.registerCue}</p>
                    </div>
                  }
                  scaffoldText={depreciationPresentationDirectDefinition.scaffolding.registerCue}
                />

                <StatementLayout
                  title="Family N Teacher Review"
                  description="Read-only PP&E presentation with the same direct depreciation facts."
                  sections={depreciationPresentationDirectDefinition.sections}
                  values={Object.fromEntries(
                    depreciationPresentationDirectDefinition.rows
                      .filter((row) => row.kind === 'editable')
                      .map((row) => [row.id, String(depreciationPresentationDirectStudentResponse[row.id] ?? '')]),
                  )}
                  readOnly
                  teacherView
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{depreciationPresentationDirectDefinition.layout}</Badge>
                        <Badge variant="secondary">{depreciationPresentationDirectDefinition.scenario.assetCategory}</Badge>
                        <Badge variant="outline">{depreciationPresentationDirectDefinition.scaffolding.sectionLabel}</Badge>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {depreciationPresentationDirectDefinition.assetRegister.map((item) => (
                          <div key={item.id} className="rounded-xl border bg-background/90 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                            <div className="mt-1 text-sm font-medium text-slate-800">{formatAccountingAmount(item.value)}</div>
                            {item.note && <div className="mt-1 text-xs text-slate-500">{item.note}</div>}
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-slate-700">{depreciationPresentationDirectDefinition.scaffolding.registerCue}</p>
                    </div>
                  }
                  scaffoldText={depreciationPresentationDirectDefinition.scaffolding.registerCue}
                  reviewSummary={[
                    { label: 'Attempt', value: '1' },
                    {
                      label: 'Score',
                      value: `${depreciationPresentationDirectGrade.score}/${depreciationPresentationDirectGrade.maxScore}`,
                    },
                    { label: 'Needs review', value: String(Object.values(depreciationPresentationDirectFeedback).filter((item) => item.status !== 'correct').length) },
                    { label: 'Variant', value: depreciationPresentationDirectDefinition.layout },
                  ]}
                  rowFeedback={Object.fromEntries(
                    depreciationPresentationDirectDefinition.parts.map((part) => [
                      part.id,
                      {
                        status: (depreciationPresentationDirectFeedback[part.id]?.status ?? 'incorrect') as 'correct' | 'incorrect' | 'partial',
                        message: depreciationPresentationDirectFeedback[part.id]?.message,
                        misconceptionTags: depreciationPresentationDirectFeedback[part.id]?.misconceptionTags ?? [],
                      },
                    ]),
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border bg-slate-50/80 p-4">
              <div className="grid gap-6 xl:grid-cols-2">
                <StatementLayout
                  title="Family N Guided Practice"
                  description="Use the cue block to present the PP&E section for the derived variant."
                  sections={depreciationPresentationDerivedDefinition.sections}
                  defaultValues={Object.fromEntries(
                    depreciationPresentationDerivedDefinition.rows.filter((row) => row.kind === 'editable').map((row) => [row.id, '']),
                  )}
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{depreciationPresentationDerivedDefinition.layout}</Badge>
                        <Badge variant="secondary">{depreciationPresentationDerivedDefinition.scenario.assetCategory}</Badge>
                        <Badge variant="outline">{depreciationPresentationDerivedDefinition.scaffolding.sectionLabel}</Badge>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {depreciationPresentationDerivedDefinition.assetRegister.map((item) => (
                          <div key={item.id} className="rounded-xl border bg-background/90 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                            <div className="mt-1 text-sm font-medium text-slate-800">{formatAccountingAmount(item.value)}</div>
                            {item.note && <div className="mt-1 text-xs text-slate-500">{item.note}</div>}
                          </div>
                        ))}
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Compute first</div>
                          <div className="mt-1 text-sm font-medium text-slate-800">Compute accumulated depreciation.</div>
                          <div className="mt-1 text-xs text-slate-500">Use that amount to present the asset at net book value.</div>
                        </div>
                      </div>
                    </div>
                  }
                  scaffoldText={depreciationPresentationDerivedDefinition.scaffolding.registerCue}
                />

                <StatementLayout
                  title="Family N Teacher Review"
                  description="Read-only evidence with the same cue block and net presentation."
                  sections={depreciationPresentationDerivedDefinition.sections}
                  values={Object.fromEntries(
                    depreciationPresentationDerivedDefinition.rows
                      .filter((row) => row.kind === 'editable')
                      .map((row) => [row.id, String(depreciationPresentationDerivedStudentResponse[row.id] ?? '')]),
                  )}
                  readOnly
                  teacherView
                  scenarioPanel={
                    <div className="rounded-2xl border bg-muted/15 px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{depreciationPresentationDerivedDefinition.layout}</Badge>
                        <Badge variant="secondary">{depreciationPresentationDerivedDefinition.scenario.assetCategory}</Badge>
                        <Badge variant="outline">{depreciationPresentationDerivedDefinition.scaffolding.sectionLabel}</Badge>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {depreciationPresentationDerivedDefinition.assetRegister.map((item) => (
                          <div key={item.id} className="rounded-xl border bg-background/90 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                            <div className="mt-1 text-sm font-medium text-slate-800">{formatAccountingAmount(item.value)}</div>
                            {item.note && <div className="mt-1 text-xs text-slate-500">{item.note}</div>}
                          </div>
                        ))}
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-3">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Compute first</div>
                          <div className="mt-1 text-sm font-medium text-slate-800">Compute accumulated depreciation.</div>
                          <div className="mt-1 text-xs text-slate-500">Use that amount to present the asset at net book value.</div>
                        </div>
                      </div>
                    </div>
                  }
                  scaffoldText={depreciationPresentationDerivedDefinition.scaffolding.registerCue}
                  reviewSummary={[
                    { label: 'Attempt', value: '1' },
                    {
                      label: 'Score',
                      value: `${depreciationPresentationDerivedGrade.score}/${depreciationPresentationDerivedGrade.maxScore}`,
                    },
                    { label: 'Needs review', value: String(Object.values(depreciationPresentationDerivedFeedback).filter((item) => item.status !== 'correct').length) },
                    { label: 'Variant', value: depreciationPresentationDerivedDefinition.layout },
                  ]}
                  rowFeedback={Object.fromEntries(
                    depreciationPresentationDerivedDefinition.parts.map((part) => [
                      part.id,
                      {
                        status: (depreciationPresentationDerivedFeedback[part.id]?.status ?? 'incorrect') as 'correct' | 'incorrect' | 'partial',
                        message: depreciationPresentationDerivedFeedback[part.id]?.message,
                        misconceptionTags: depreciationPresentationDerivedFeedback[part.id]?.misconceptionTags ?? [],
                      },
                    ]),
                  )}
                />
              </div>
            </div>
          </div>
        </section>


        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family R preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">CVP Analysis</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Break-even units variant with contribution margin and unit computations.
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Scenario</CardTitle>
              <CardDescription>{cvpDefinition.prompt.stem}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Variant</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{cvpDefinition.variant}</div>
              </div>
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Score</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{cvpGrade.score}/{cvpGrade.maxScore}</div>
              </div>
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Guidance</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{cvpDefinition.scaffolding.guidance}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guided Practice</CardTitle>
                <CardDescription>Compute the CVP values from the scenario data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {cvpDefinition.parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between rounded-xl border bg-background/90 p-3">
                    <div>
                      <div className="text-sm font-medium text-slate-800">{part.label}</div>
                      <div className="text-xs text-slate-500">{part.prompt}</div>
                    </div>
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-400">
                      enter value
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teacher Review</CardTitle>
                <CardDescription>Graded responses with feedback for each ratio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {cvpDefinition.parts.map((part) => {
                  const fb = cvpFeedback[part.id];
                  return (
                    <div key={part.id} className={`rounded-xl border p-3 ${fb?.status === 'correct' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-800">{part.label}</div>
                        <Badge variant={fb?.status === 'correct' ? 'default' : 'destructive'}>{fb?.status}</Badge>
                      </div>
                      <div className="mt-1 flex gap-4 text-xs text-slate-600">
                        <span>Student: {fb?.selectedLabel ?? '—'}</span>
                        <span>Expected: {fb?.expectedLabel ?? '—'}</span>
                      </div>
                      {fb?.message && <div className="mt-1 text-xs text-slate-500">{fb.message}</div>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family S preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Interest Schedules</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Compound interest variant with future value and total interest computations.
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Scenario</CardTitle>
              <CardDescription>{interestDefinition.prompt.stem}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Variant</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{interestDefinition.variant}</div>
              </div>
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Score</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{interestGrade.score}/{interestGrade.maxScore}</div>
              </div>
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Guidance</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{interestDefinition.scaffolding.guidance}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guided Practice</CardTitle>
                <CardDescription>Compute the interest values from the scenario data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {interestDefinition.parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between rounded-xl border bg-background/90 p-3">
                    <div>
                      <div className="text-sm font-medium text-slate-800">{part.label}</div>
                      <div className="text-xs text-slate-500">{part.prompt}</div>
                    </div>
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-400">
                      enter value
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teacher Review</CardTitle>
                <CardDescription>Graded responses with feedback for each computation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {interestDefinition.parts.map((part) => {
                  const fb = interestFeedback[part.id];
                  return (
                    <div key={part.id} className={`rounded-xl border p-3 ${fb?.status === 'correct' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-800">{part.label}</div>
                        <Badge variant={fb?.status === 'correct' ? 'default' : 'destructive'}>{fb?.status}</Badge>
                      </div>
                      <div className="mt-1 flex gap-4 text-xs text-slate-600">
                        <span>Student: {fb?.selectedLabel ?? '—'}</span>
                        <span>Expected: {fb?.expectedLabel ?? '—'}</span>
                      </div>
                      {fb?.message && <div className="mt-1 text-xs text-slate-500">{fb.message}</div>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family T preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Depreciation Schedules</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Double-declining balance method with depreciable base, year-1 depreciation, and book value computations.
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Scenario</CardTitle>
              <CardDescription>{depScheduleDefinition.prompt.stem}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Method</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{depScheduleDefinition.method}</div>
              </div>
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Score</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{depScheduleGrade.score}/{depScheduleGrade.maxScore}</div>
              </div>
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Guidance</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{depScheduleDefinition.scaffolding.guidance}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guided Practice</CardTitle>
                <CardDescription>Compute the depreciation values from the asset data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {depScheduleDefinition.parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between rounded-xl border bg-background/90 p-3">
                    <div>
                      <div className="text-sm font-medium text-slate-800">{part.label}</div>
                      <div className="text-xs text-slate-500">{part.prompt}</div>
                    </div>
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-400">
                      enter value
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teacher Review</CardTitle>
                <CardDescription>Graded responses with feedback for each computation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {depScheduleDefinition.parts.map((part) => {
                  const fb = depScheduleFeedback[part.id];
                  return (
                    <div key={part.id} className={`rounded-xl border p-3 ${fb?.status === 'correct' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-800">{part.label}</div>
                        <Badge variant={fb?.status === 'correct' ? 'default' : 'destructive'}>{fb?.status}</Badge>
                      </div>
                      <div className="mt-1 flex gap-4 text-xs text-slate-600">
                        <span>Student: {fb?.selectedLabel ?? '—'}</span>
                        <span>Expected: {fb?.expectedLabel ?? '—'}</span>
                      </div>
                      {fb?.message && <div className="mt-1 text-xs text-slate-500">{fb.message}</div>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Family U preview</p>
            <h2 className="text-2xl font-semibold tracking-tight">Financial Statement Analysis</h2>
            <p className="max-w-4xl text-sm text-slate-600">
              Profitability variant with profit margin and return on assets from mini-ledger data.
            </p>
          </div>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Scenario</CardTitle>
              <CardDescription>{finAnalysisDefinition.prompt.stem}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Variant</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{finAnalysisDefinition.variant}</div>
              </div>
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Score</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{finAnalysisGrade.score}/{finAnalysisGrade.maxScore}</div>
              </div>
              <div className="rounded-xl border bg-background/90 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Guidance</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{finAnalysisDefinition.scaffolding.guidance}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guided Practice</CardTitle>
                <CardDescription>Compute the financial ratios from the statement data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {finAnalysisDefinition.parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between rounded-xl border bg-background/90 p-3">
                    <div>
                      <div className="text-sm font-medium text-slate-800">{part.label}</div>
                      <div className="text-xs text-slate-500">{part.prompt}</div>
                    </div>
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-400">
                      enter value
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teacher Review</CardTitle>
                <CardDescription>Graded responses with feedback for each ratio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {finAnalysisDefinition.parts.map((part) => {
                  const fb = finAnalysisFeedback[part.id];
                  return (
                    <div key={part.id} className={`rounded-xl border p-3 ${fb?.status === 'correct' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-800">{part.label}</div>
                        <Badge variant={fb?.status === 'correct' ? 'default' : 'destructive'}>{fb?.status}</Badge>
                      </div>
                      <div className="mt-1 flex gap-4 text-xs text-slate-600">
                        <span>Student: {fb?.selectedLabel ?? '—'}</span>
                        <span>Expected: {fb?.expectedLabel ?? '—'}</span>
                      </div>
                      {fb?.message && <div className="mt-1 text-xs text-slate-500">{fb.message}</div>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <JournalEntryTable
            title="Journal Entry Table"
            description="Data-driven rows with balance validation."
            availableAccounts={miniLedger.accounts.map((account) => ({
              id: account.id,
              label: account.label,
            }))}
            expectedLineCount={4}
            defaultValue={journalLines}
            teacherView
            rowFeedback={{
              'line-1': { status: 'partial', message: 'Debit entry prepared.' },
              'line-2': { status: 'correct', message: 'Liability recorded.' },
            }}
          />

          <CategorizationList
            title="Categorization List"
            description="Read-only teacher review showing ledger groups."
            items={categorizationItems}
            zones={[
              { id: 'assets', label: 'Assets', description: 'Cash and other resources', emoji: '💼' },
              { id: 'liabilities', label: 'Liabilities', description: 'Debts and obligations', emoji: '🧾' },
              { id: 'equity', label: 'Equity', description: 'Owner claim', emoji: '🧭' },
              { id: 'revenue', label: 'Revenue', description: 'Inflow from operations', emoji: '📈' },
              { id: 'expenses', label: 'Expenses', description: 'Outflows and costs', emoji: '📉' },
            ]}
            readOnly
            mode="teaching"
            reviewPlacements={categorizationPlacements}
          />
        </div>
      </div>
    </main>
  );
}
