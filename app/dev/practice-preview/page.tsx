import { notFound } from 'next/navigation';

import { CategorizationList, JournalEntryTable, SelectionMatrix, StatementLayout } from '@/components/activities/shared';
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
