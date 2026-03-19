'use client'

import { useCallback, useMemo, useState, type DragEvent } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Building,
  Calculator,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  RefreshCw,
  XCircle
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { type Activity } from '@/lib/db/schema/validators'
import { type JournalEntryActivityProps } from '@/types/activities'
import {
  buildPracticeSubmissionEnvelope,
  buildPracticeSubmissionParts,
  type PracticeSubmissionCallbackPayload
} from '@/lib/practice/contract'

interface JournalEntryRow {
  account: string
  debit: number
  credit: number
}

export interface Scenario {
  id: string
  description: string
  correctEntry: JournalEntryRow[]
  explanation: string
}

export type JournalEntryActivityData = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'journal-entry-building'
  props: JournalEntryActivityProps
}

export const JOURNAL_ENTRY_SUPPORTED_MODES = [
  'guided_practice',
  'independent_practice'
] as const
export type JournalEntryPracticeMode = (typeof JOURNAL_ENTRY_SUPPORTED_MODES)[number]

interface JournalEntryComponentProps {
  activity: JournalEntryActivityData
  className?: string
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void
}

type JournalEntryState = {
  currentScenario: Scenario
  journalEntries: JournalEntryRow[]
  feedback: string
  showFeedback: boolean
  attempts: number
  isCorrect: boolean
  completed: boolean
}

const DEFAULT_AVAILABLE_ACCOUNTS = [
  'Cash',
  'Accounts Receivable',
  'Equipment',
  'Inventory',
  'Supplies',
  'Land',
  'Buildings',
  'Accounts Payable',
  'Notes Payable',
  'Unearned Revenue',
  "Owner's Equity",
  'Retained Earnings',
  'Service Revenue',
  'Sales Revenue',
  'Consulting Revenue',
  'Rent Expense',
  'Salary Expense',
  'Advertising Expense',
  'Utilities Expense',
  'Insurance Expense',
  'Office Expense'
]

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: 'scenario-1',
    description: 'Your business receives $1,500 cash for consulting services provided to a client.',
    correctEntry: [
      { account: 'Cash', debit: 1500, credit: 0 },
      { account: 'Consulting Revenue', debit: 0, credit: 1500 }
    ],
    explanation:
      'Cash (asset) increases with a debit, and Consulting Revenue increases with a credit. This follows the fundamental accounting equation: Assets = Liabilities + Equity.'
  },
  {
    id: 'scenario-2',
    description: 'The business purchases office equipment for $2,500 on account (will pay later).',
    correctEntry: [
      { account: 'Equipment', debit: 2500, credit: 0 },
      { account: 'Accounts Payable', debit: 0, credit: 2500 }
    ],
    explanation:
      'Equipment (asset) increases with a debit, and Accounts Payable (liability) increases with a credit. The business now owes money for the equipment purchased.'
  },
  {
    id: 'scenario-3',
    description: 'The business pays $800 cash for monthly rent expense.',
    correctEntry: [
      { account: 'Rent Expense', debit: 800, credit: 0 },
      { account: 'Cash', debit: 0, credit: 800 }
    ],
    explanation:
      'Rent Expense increases with a debit (expenses reduce equity), and Cash (asset) decreases with a credit. This is a typical expense transaction.'
  }
]

function buildEmptyRows(scenario: Scenario): JournalEntryRow[] {
  return Array.from({ length: Math.max(2, scenario.correctEntry.length) }, () => ({
    account: '',
    debit: 0,
    credit: 0
  }))
}

function summarizeTotals(rows: JournalEntryRow[]) {
  const totalDebits = rows.reduce((sum, entry) => sum + (entry.debit || 0), 0)
  const totalCredits = rows.reduce((sum, entry) => sum + (entry.credit || 0), 0)
  return {
    totalDebits,
    totalCredits,
    isBalanced: totalDebits === totalCredits && totalDebits > 0
  }
}

function isRowComplete(row: JournalEntryRow) {
  return row.account.trim().length > 0 && (row.debit > 0 || row.credit > 0)
}

function resolveMode(showInstructionsDefaultOpen: boolean): JournalEntryPracticeMode {
  return showInstructionsDefaultOpen ? 'guided_practice' : 'independent_practice'
}

function buildSubmissionArtifact(args: {
  scenario: Scenario
  journalEntries: JournalEntryRow[]
  totals: ReturnType<typeof summarizeTotals>
  attempts: number
}) {
  return {
    kind: 'journal_entry',
    family: 'journal-entry-building',
    scenarioId: args.scenario.id,
    scenarioDescription: args.scenario.description,
    lines: args.journalEntries.map((entry, index) => ({
      rowNumber: index + 1,
      account: entry.account,
      debit: entry.debit,
      credit: entry.credit
    })),
    expectedEntry: args.scenario.correctEntry,
    totals: {
      debits: args.totals.totalDebits,
      credits: args.totals.totalCredits,
      difference: Math.abs(args.totals.totalDebits - args.totals.totalCredits)
    },
    balanced: args.totals.isBalanced,
    attempts: args.attempts
  }
}

function buildJournalEntrySubmission(args: {
  activity: JournalEntryActivityData
  scenario: Scenario
  journalEntries: JournalEntryRow[]
  attempts: number
  mode: JournalEntryPracticeMode
}) {
  const answers = Object.fromEntries(
    args.scenario.correctEntry.map((expectedEntry) => {
      const studentEntry = args.journalEntries.find((entry) => entry.account.trim() === expectedEntry.account)

      return [
        expectedEntry.account,
        {
          account: studentEntry?.account ?? '',
          debit: studentEntry?.debit ?? 0,
          credit: studentEntry?.credit ?? 0
        }
      ]
    })
  )

  const parts = buildPracticeSubmissionParts(answers).map((part, index) => {
    const expectedEntry = args.scenario.correctEntry[index]
    const studentEntry = args.journalEntries.find((entry) => entry.account.trim() === expectedEntry.account)
    const isCorrect = studentEntry !== undefined &&
      studentEntry.account.trim() === expectedEntry.account &&
      studentEntry.debit === expectedEntry.debit &&
      studentEntry.credit === expectedEntry.credit

    return {
      ...part,
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1
    }
  })

  const totals = summarizeTotals(args.journalEntries)

  return buildPracticeSubmissionEnvelope({
    activityId: args.activity.id,
    mode: args.mode,
    status: 'submitted',
    attemptNumber: args.attempts,
    submittedAt: new Date(),
    answers,
    parts,
    artifact: buildSubmissionArtifact({
      scenario: args.scenario,
      journalEntries: args.journalEntries,
      totals,
      attempts: args.attempts
    }),
    analytics: {
      scenarioId: args.scenario.id,
      lineCount: args.journalEntries.length,
      totalDebits: totals.totalDebits,
      totalCredits: totals.totalCredits,
      difference: Math.abs(totals.totalDebits - totals.totalCredits)
    },
    studentFeedback: args.scenario.explanation,
    teacherSummary: args.scenario.explanation
  })
}

export function JournalEntryActivity({ activity, className = '', onSubmit }: JournalEntryComponentProps) {
  const {
    props: {
      title: activityTitle,
      description: activityDescription,
      availableAccounts = [],
      scenarios,
      showInstructionsDefaultOpen = false
    }
  } = activity

  const practiceMode = resolveMode(showInstructionsDefaultOpen)
  const accounts = useMemo(
    () => (availableAccounts.length > 0 ? availableAccounts : DEFAULT_AVAILABLE_ACCOUNTS),
    [availableAccounts]
  )
  const scenarioList = useMemo(() => (scenarios.length > 0 ? scenarios : DEFAULT_SCENARIOS), [scenarios])

  const resolvedTitle = activityTitle ?? activity.displayName ?? 'Journal Entry Builder'
  const resolvedDescription =
    activityDescription ?? activity.description ?? 'Learn double-entry bookkeeping by creating journal entries for business transactions.'

  const [exerciseState, setExerciseState] = useState<JournalEntryState>(() => {
    const initialScenario = scenarioList[0] ?? DEFAULT_SCENARIOS[0]

    return {
      currentScenario: initialScenario,
      journalEntries: buildEmptyRows(initialScenario),
      feedback: '',
      showFeedback: false,
      attempts: 0,
      isCorrect: false,
      completed: false
    }
  })
  const [showInstructions, setShowInstructions] = useState(showInstructionsDefaultOpen)
  const [focusedRowIndex, setFocusedRowIndex] = useState(0)

  const totals = useMemo(
    () => summarizeTotals(exerciseState.journalEntries),
    [exerciseState.journalEntries]
  )

  const filledRows = useMemo(
    () => exerciseState.journalEntries.filter((row) => isRowComplete(row)).length,
    [exerciseState.journalEntries]
  )

  const firstIncompleteRowIndex = useMemo(
    () => exerciseState.journalEntries.findIndex((row) => !row.account.trim()),
    [exerciseState.journalEntries]
  )

  const hasAnyInput = exerciseState.journalEntries.some(
    (row) => row.account.trim().length > 0 || row.debit > 0 || row.credit > 0
  )

  const entryIsComplete = exerciseState.journalEntries.every((row) => isRowComplete(row))
  const balanceDifference = Math.abs(totals.totalDebits - totals.totalCredits)
  const balanceLabel = !hasAnyInput
    ? 'Start by choosing the first account.'
    : !entryIsComplete
      ? 'Incomplete'
      : !totals.isBalanced
        ? `Not balanced by $${balanceDifference.toFixed(2)}`
        : exerciseState.completed
          ? 'Submitted and balanced'
          : 'Balanced and ready to check'

  const balanceTone = !hasAnyInput
    ? 'border-slate-200 bg-slate-50 text-slate-700'
    : !entryIsComplete
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : !totals.isBalanced
        ? 'border-red-200 bg-red-50 text-red-800'
        : 'border-green-200 bg-green-50 text-green-800'

  const statusAnnouncement = exerciseState.showFeedback
    ? exerciseState.feedback
    : balanceLabel

  const currentAttempt = exerciseState.attempts + 1

  const assignAccount = useCallback((rowIndex: number, account: string) => {
    setExerciseState((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.map((entry, index) =>
        index === rowIndex ? { ...entry, account } : entry
      )
    }))
  }, [])

  const handleAccountInsert = useCallback((account: string) => {
    const targetRowIndex = focusedRowIndex >= 0
      ? focusedRowIndex
      : firstIncompleteRowIndex >= 0
        ? firstIncompleteRowIndex
        : 0

    assignAccount(targetRowIndex, account)
  }, [assignAccount, firstIncompleteRowIndex, focusedRowIndex])

  const handleDragStart = useCallback((event: DragEvent<HTMLButtonElement>, account: string) => {
    event.dataTransfer.setData('text/plain', account)
    event.dataTransfer.effectAllowed = 'copy'
  }, [])

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>, rowIndex: number) => {
    event.preventDefault()
    const account = event.dataTransfer.getData('text/plain')

    if (account) {
      assignAccount(rowIndex, account)
    }
  }, [assignAccount])

  const handleAmountChange = useCallback((
    rowIndex: number,
    field: 'debit' | 'credit',
    value: string
  ) => {
    const numericValue = Number.parseFloat(value) || 0

    setExerciseState((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.map((entry, index) => {
        if (index !== rowIndex) return entry

        const oppositeField = field === 'debit' ? 'credit' : 'debit'
        return {
          ...entry,
          [field]: numericValue,
          [oppositeField]: numericValue > 0 ? 0 : entry[oppositeField]
        }
      })
    }))
  }, [])

  const evaluateEntry = useCallback(() => {
    const { currentScenario, journalEntries } = exerciseState
    const attemptNumber = exerciseState.attempts + 1
    let feedback = ''
    let isCorrect = false

    if (totals.totalDebits !== totals.totalCredits || totals.totalDebits === 0) {
      feedback = `Entry is not balanced. Total debits: $${totals.totalDebits.toFixed(2)}, Total credits: $${totals.totalCredits.toFixed(2)}. Journal entries must have equal debits and credits.`
    } else {
      const entryAccounts = journalEntries.map((entry) => entry.account.trim()).filter(Boolean)
      const correctAccounts = currentScenario.correctEntry.map((entry) => entry.account)

      const missingAccounts = correctAccounts.filter((account) => !entryAccounts.includes(account))
      const extraAccounts = entryAccounts.filter((account) => !correctAccounts.includes(account))

      if (missingAccounts.length > 0 || extraAccounts.length > 0) {
        feedback = 'Incorrect accounts used. '
        if (missingAccounts.length > 0) {
          feedback += `Missing: ${missingAccounts.join(', ')}. `
        }
        if (extraAccounts.length > 0) {
          feedback += `Should not include: ${extraAccounts.join(', ')}. `
        }
      } else {
        const amountErrors: string[] = []
        const sideErrors: string[] = []

        for (const correctEntry of currentScenario.correctEntry) {
          const studentEntry = journalEntries.find((entry) => entry.account.trim() === correctEntry.account)
          if (!studentEntry) continue

          if (correctEntry.debit > 0 && studentEntry.debit !== correctEntry.debit) {
            amountErrors.push(`${correctEntry.account} should have debit of $${correctEntry.debit}`)
          }
          if (correctEntry.credit > 0 && studentEntry.credit !== correctEntry.credit) {
            amountErrors.push(`${correctEntry.account} should have credit of $${correctEntry.credit}`)
          }
          if (correctEntry.debit > 0 && studentEntry.credit > 0) {
            sideErrors.push(`${correctEntry.account} should be debited, not credited`)
          }
          if (correctEntry.credit > 0 && studentEntry.debit > 0) {
            sideErrors.push(`${correctEntry.account} should be credited, not debited`)
          }
        }

        if (sideErrors.length > 0) {
          feedback = `Incorrect debit/credit sides: ${sideErrors.join(', ')}.`
        } else if (amountErrors.length > 0) {
          feedback = `Incorrect amounts: ${amountErrors.join(', ')}.`
        } else {
          feedback = `Perfect! ${currentScenario.explanation}`
          isCorrect = true
        }
      }
    }

    setExerciseState((prev) => ({
      ...prev,
      feedback,
      showFeedback: true,
      attempts: attemptNumber,
      isCorrect,
      completed: isCorrect
    }))

    if (isCorrect) {
      onSubmit?.(
        buildJournalEntrySubmission({
          activity,
          scenario: currentScenario,
          journalEntries,
          attempts: attemptNumber,
          mode: practiceMode
        })
      )
    }
  }, [activity, exerciseState, onSubmit, practiceMode, totals.totalCredits, totals.totalDebits])

  const resetEntry = useCallback(() => {
    setExerciseState((prev) => ({
      ...prev,
      journalEntries: buildEmptyRows(prev.currentScenario),
      feedback: '',
      showFeedback: false,
      isCorrect: false,
      completed: false
    }))
    setFocusedRowIndex(0)
  }, [])

  const nextScenario = useCallback(() => {
    const currentIndex = scenarioList.findIndex((scenario) => scenario.id === exerciseState.currentScenario.id)
    const nextIndex = (currentIndex + 1) % scenarioList.length
    const nextScenarioValue = scenarioList[nextIndex]

    setExerciseState({
      currentScenario: nextScenarioValue,
      journalEntries: buildEmptyRows(nextScenarioValue),
      feedback: '',
      showFeedback: false,
      attempts: 0,
      isCorrect: false,
      completed: false
    })
    setFocusedRowIndex(0)
  }, [exerciseState.currentScenario.id, scenarioList])

  const scaffoldSteps = [
    'Read the transaction and identify the affected accounts.',
    'Choose debit or credit based on the account type.',
    'Enter the amount on one side only.',
    'Check the totals before submitting.'
  ]

  return (
    <div className={cn('mx-auto max-w-6xl space-y-6 p-4', className)}>
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="flex flex-wrap items-center gap-3 text-3xl">
                <BookOpen className="h-8 w-8 text-slate-700" />
                {resolvedTitle}
                <Badge variant="outline" className="uppercase tracking-wide">
                  {practiceMode.replace('_', ' ')}
                </Badge>
                {exerciseState.completed ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                ) : (
                  <Badge variant="secondary">Attempt {currentAttempt}</Badge>
                )}
              </CardTitle>
              <CardDescription className="max-w-3xl text-base text-slate-600">
                {resolvedDescription}
              </CardDescription>
            </div>

            <div className={cn('rounded-xl border px-4 py-3 shadow-sm', balanceTone)}>
              <div className="text-[11px] uppercase tracking-[0.2em] opacity-75">Current status</div>
              <div className="mt-1 text-sm font-semibold" data-testid="journal-status">
                {balanceLabel}
              </div>
              <p className="mt-1 text-xs opacity-80" aria-live="polite">
                {statusAnnouncement}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t pt-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>One scenario, one journal entry, one balance check</span>
            </div>
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span>Totals stay live while you fill the table</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>{filledRows}/{exerciseState.journalEntries.length} rows filled</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions((value) => !value)}
              className="ml-auto gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              {showInstructions ? 'Hide instructions' : 'Show instructions'}
              {showInstructions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showInstructions && (
        <Card className="border-slate-200 bg-slate-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">How to work the entry</CardTitle>
            <CardDescription>
              Keep the workbench focused: account, side, amount, then a balance check.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                'Read the scenario and identify the accounts that change.',
                'Use the account bank or dropdown to place the right accounts.',
                'Enter one amount per row on either debit or credit, never both.',
                'Check the balance rail before submitting and review the feedback after.'
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(320px,5fr)]">
        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/70">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
                <FileText className="h-5 w-5" />
                Transaction Scenario
              </CardTitle>
              <CardDescription className="text-blue-800/80">
                Read the stem, then build the entry below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-medium uppercase tracking-wide text-blue-700">Business transaction</div>
                <p className="mt-2 text-lg leading-relaxed text-slate-800">
                  {exerciseState.currentScenario.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {practiceMode === 'guided_practice' && (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Guided Scaffold</CardTitle>
                <CardDescription>
                  Use this step-through flow to structure the entry before you submit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {scaffoldSteps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm text-blue-900">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building className="h-5 w-5" />
                Account Bank
              </CardTitle>
              <CardDescription>
                Click an account to place it in the focused row. Drag and drop still works as a bonus.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {accounts.map((account) => (
                  <button
                    key={account}
                    type="button"
                    draggable
                    onDragStart={(event) => handleDragStart(event, account)}
                    onClick={() => handleAccountInsert(account)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Insert ${account} into the focused journal row`}
                  >
                    {account}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calculator className="h-5 w-5" />
                Journal Entry Workspace
              </CardTitle>
              <CardDescription>
                Use the dropdown or bank chips to fill each line. Debit and credit are mutually exclusive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-5">Account</div>
                  <div className="col-span-3 text-right">Debit</div>
                  <div className="col-span-3 text-right">Credit</div>
                </div>

                <div className="divide-y divide-slate-200">
                  {exerciseState.journalEntries.map((entry, index) => {
                    const isFocused = focusedRowIndex === index

                    return (
                      <div
                        key={`row-${index}`}
                        className={cn(
                          'grid grid-cols-12 gap-3 px-4 py-4 transition',
                          isFocused && 'bg-blue-50/50'
                        )}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(event, index)}
                      >
                        <div className="col-span-1 flex items-start justify-center pt-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                            {index + 1}
                          </div>
                        </div>

                        <div className="col-span-5 space-y-2">
                          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 transition hover:border-blue-300 hover:bg-blue-50">
                            <div className="text-xs uppercase tracking-wide text-slate-500">Account cell</div>
                            <div className="mt-2 min-h-10 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm">
                              {entry.account || 'Choose an account'}
                            </div>
                          </div>
                          <label className="sr-only" htmlFor={`account-select-${index}`}>
                            Select account for row {index + 1}
                          </label>
                          <select
                            id={`account-select-${index}`}
                            aria-label={`Select account for row ${index + 1}`}
                            value={entry.account}
                            onFocus={() => setFocusedRowIndex(index)}
                            onChange={(event) => assignAccount(index, event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Choose account</option>
                            {accounts.map((account) => (
                              <option key={`${account}-${index}`} value={account}>
                                {account}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-3">
                          <label className="sr-only" htmlFor={`debit-${index}`}>
                            Debit amount for row {index + 1}
                          </label>
                          <Input
                            id={`debit-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={entry.debit || ''}
                            onFocus={() => setFocusedRowIndex(index)}
                            onChange={(event) => handleAmountChange(index, 'debit', event.target.value)}
                            className="h-11 text-right font-mono tabular-nums"
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="sr-only" htmlFor={`credit-${index}`}>
                            Credit amount for row {index + 1}
                          </label>
                          <Input
                            id={`credit-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={entry.credit || ''}
                            onFocus={() => setFocusedRowIndex(index)}
                            onChange={(event) => handleAmountChange(index, 'credit', event.target.value)}
                            className="h-11 text-right font-mono tabular-nums"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-12 gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="col-span-1" />
                  <div className="col-span-5 text-sm font-semibold uppercase tracking-wide text-slate-700">
                    Totals
                  </div>
                  <div className={cn('col-span-3 text-right font-mono text-lg font-semibold', totals.isBalanced ? 'text-slate-900' : 'text-red-700')}>
                    ${totals.totalDebits.toFixed(2)}
                  </div>
                  <div className={cn('col-span-3 text-right font-mono text-lg font-semibold', totals.isBalanced ? 'text-slate-900' : 'text-red-700')}>
                    ${totals.totalCredits.toFixed(2)}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium',
                  balanceTone
                )}
                aria-live="polite"
              >
                {totals.totalDebits === 0 && totals.totalCredits === 0 ? (
                  <>
                    <AlertTriangle className="h-5 w-5" />
                    <span>Enter amounts to see balance status.</span>
                  </>
                ) : totals.isBalanced ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Entry is balanced.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span>Difference: ${balanceDifference.toFixed(2)}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <HelpCircle className="h-5 w-5" />
                Status Rail
              </CardTitle>
              <CardDescription>Keep your eye on structure, balance, and the next action.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Balance state</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{balanceLabel}</div>
                <p className="mt-2 text-sm text-slate-600" aria-live="polite">
                  {statusAnnouncement}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Attempts used</div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">{exerciseState.attempts}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Filled rows</div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">
                    {filledRows}/{exerciseState.journalEntries.length}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={evaluateEntry}
                  className="h-12 w-full bg-slate-900 text-white hover:bg-slate-800"
                  disabled={totals.totalDebits === 0 && totals.totalCredits === 0}
                >
                  Check Entry
                </Button>
                <Button onClick={resetEntry} variant="outline" className="h-12 w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset Entry
                </Button>
                {exerciseState.completed && (
                  <Button onClick={nextScenario} className="h-12 w-full gap-2 bg-green-600 hover:bg-green-700">
                    Next Scenario
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {exerciseState.showFeedback && (
            <Card
              className={cn(
                'border-2 shadow-sm',
                exerciseState.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle
                  className={cn(
                    'flex items-center gap-2 text-lg',
                    exerciseState.isCorrect ? 'text-green-900' : 'text-red-900'
                  )}
                >
                  {exerciseState.isCorrect ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  {exerciseState.isCorrect ? 'Excellent work' : 'Try again'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    exerciseState.isCorrect ? 'text-green-800' : 'text-red-800'
                  )}
                  data-testid="journal-feedback"
                >
                  {exerciseState.feedback}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Attempts: {exerciseState.attempts}</Badge>
                  {exerciseState.completed && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}

export default JournalEntryActivity
