import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import {
  CategorizationList,
  JournalEntryTable,
  SelectionMatrix,
  StatementLayout,
  type JournalEntryRowFeedback,
  type SelectionMatrixRowFeedback,
} from '@/components/activities/shared';
import { practiceAccounts } from '@/lib/practice/engine/accounts';
import {
  adjustmentEffectsFamily,
  buildAdjustmentEffectsReviewFeedback,
  type AdjustmentEffectsResponse,
} from '@/lib/practice/engine/families/adjustment-effects';
import { buildNormalBalanceReviewFeedback, normalBalanceFamily } from '@/lib/practice/engine/families/normal-balance';
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
              showHintsByDefault={false}
            />

            <CategorizationList
              title="Family A Teacher Review"
              description="Read-only review with the same student artifact and annotated misconceptions."
              items={familyAItems.map((item) => ({ ...item }))}
              zones={familyACategories.map((category) => ({ ...category }))}
              readOnly
              teacherView
              reviewPlacements={familyATeacherPlacements}
              reviewFeedback={familyATeacherFeedback}
              submissionSummary={{
                scoreLabel: '4/6 correct',
                attempts: 1,
                submittedAt: '2026-03-20 09:15',
                misconceptionCount: 2,
              }}
              showHintsByDefault
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

          <div className="grid gap-4 rounded-2xl border bg-slate-50/80 p-4">
            <div className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
              <div className="text-sm text-slate-700">{adjustmentEffectsDefinition.scenario.scenario}</div>
            </div>
            <div className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What was missed</div>
              <div className="text-sm text-slate-700">{adjustmentEffectsDefinition.scenario.missedAdjustment}</div>
            </div>
            <div className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assumption</div>
              <div className="text-sm text-slate-700">{adjustmentEffectsDefinition.scenario.periodEndAssumption}</div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Think about what the correct adjustment would change first, then compare adjusted versus unadjusted statements.
          </p>

          <div className="grid gap-6 xl:grid-cols-2">
            <SelectionMatrix
              title="Family K Guided Practice"
              description={adjustmentEffectsDefinition.prompt.stem}
              rows={adjustmentEffectsDefinition.rows}
              columns={adjustmentEffectsDefinition.columns}
              defaultValue={adjustmentEffectsSolution}
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

              <div className="grid gap-4 rounded-2xl border bg-white/90 p-4">
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction</div>
                  <div className="text-sm text-slate-700">{transactionEffectsDefinition.event.narrative}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Amount</div>
                  <div className="text-sm text-slate-700">{formatAccountingAmount(transactionEffectsDefinition.event.amount)}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Why equity changes</div>
                  <div className="text-sm text-slate-700">{transactionEffectsDefinition.event.equityReason}</div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <SelectionMatrix
                  title="Family C Guided Practice"
                  description="Select how the affected accounts and summary categories change."
                  rows={transactionEffectsDefinition.rows}
                  columns={transactionEffectsDefinition.columns}
                  defaultValue={transactionEffectsMatrixValue}
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

              <div className="grid gap-4 rounded-2xl border bg-white/90 p-4">
                <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction</div>
                  <div className="text-sm text-slate-700">{transactionMatrixScenario.narrative}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Business context</div>
                  <div className="text-sm text-slate-700">
                    {transactionMatrixScenario.context} context • {transactionMatrixScenario.settlement ?? 'cash'}
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Source document clue</div>
                  <div className="text-sm text-slate-700">{transactionMatrixScenario.tags.join(' • ')}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to decide first</div>
                  <div className="text-sm text-slate-700">{transactionMatrixReason}</div>
                </div>
              </div>

              <SelectionMatrix
                title="Family F Guided Practice"
                description="Select the reasoning stage that matches each row."
                rows={transactionMatrixDefinition.rows}
                columns={transactionMatrixDefinition.columns}
                defaultValue={transactionMatrixMatrixValue}
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
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Expected lines: {journalEntryDefinition.expectedLineCount}</Badge>
                <Badge variant="secondary">Mode: Guided practice</Badge>
                <Badge variant="default">Balanced</Badge>
                <Badge variant="outline">Dates: {journalEntryDefinition.scenario.dates.join(' • ')}</Badge>
              </div>

              <div className="grid gap-2 rounded-2xl border bg-white/90 p-4">
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                  <div className="text-sm text-slate-700">{journalEntryDefinition.scenario.narrative}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What to notice</div>
                  <div className="text-sm text-slate-700">
                    The date column keeps the original sale, the return and allowance, and the final collection separate.
                  </div>
                </div>
              </div>

              <JournalEntryTable
                title="Family H Guided Practice"
                description="Record the journal lines in canonical order. The balance strip stays visible below the table."
                availableAccounts={journalEntryDefinition.availableAccounts}
                expectedLineCount={journalEntryDefinition.expectedLineCount}
                defaultValue={journalEntrySolution}
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
            reviewPlacements={categorizationPlacements}
            showHintsByDefault
          />
        </div>
      </div>
    </main>
  );
}
