import { notFound } from 'next/navigation';

import {
  CategorizationList,
  JournalEntryTable,
  SelectionMatrix,
  StatementLayout,
  type SelectionMatrixRowFeedback,
} from '@/components/activities/shared';
import { practiceAccounts } from '@/lib/practice/engine/accounts';
import {
  adjustmentEffectsFamily,
  buildAdjustmentEffectsReviewFeedback,
  type AdjustmentEffectsResponse,
} from '@/lib/practice/engine/families/adjustment-effects';
import { buildNormalBalanceReviewFeedback, normalBalanceFamily } from '@/lib/practice/engine/families/normal-balance';
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
