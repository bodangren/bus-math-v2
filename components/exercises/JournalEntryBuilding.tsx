/**
 * JournalEntryBuilding Component
 * 
 * DEVELOPER USAGE:
 * ================
 * Import and use this component in any React page or component:
 * 
 * ```tsx
 * import { JournalEntryBuilding } from '@/components/exercises/JournalEntryBuilding'
 * 
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <JournalEntryBuilding />
 *     </div>
 *   )
 * }
 * ```
 * 
 * The component is fully self-contained with its own state management.
 * No props are required - it initializes with default values.
 * 
 * STUDENT INTERACTION & LEARNING OBJECTIVES:
 * ==========================================
 * 
 * OBJECTIVE: Students learn to create proper journal entries for business transactions,
 * understanding the double-entry bookkeeping principle and account classifications.
 * 
 * HOW STUDENTS INTERACT:
 * 1. **Read Transaction Scenario**: Students analyze a business transaction description
 *    (e.g. "Your business receives $1,500 cash for consulting services provided to a client.")
 * 
 * 2. **Drag Account Names**: Students drag account names from the "Available Accounts" bank
 *    into the journal entry table (Account column)
 * 
 * 3. **Enter Amounts**: Students input monetary amounts in either the Debit or Credit columns:
 *    - Debit increases: Assets, Expenses, Dividends
 *    - Credit increases: Liabilities, Equity, Revenue
 * 
 * 4. **Monitor Balance**: Students see running totals for debits and credits:
 *    - Totals must be equal for a valid journal entry
 *    - Real-time feedback shows if entry balances
 * 
 * 5. **Submit Entry**: Click "Check Entry" to validate the journal entry:
 *    - Correct accounts for the transaction scenario
 *    - Proper debit/credit placement
 *    - Equal total debits and credits
 * 
 * 6. **Learn from Feedback**: Receive specific feedback on errors:
 *    - Wrong accounts used
 *    - Incorrect debit/credit sides
 *    - Unbalanced entries
 * 
 * KEY LEARNING OUTCOMES:
 * - Understanding double-entry bookkeeping fundamentals
 * - Proper account classification (Assets, Liabilities, Equity, Revenue, Expenses)
 * - Debit and credit rules for different account types
 * - Transaction analysis and recording skills
 * - Real-world application of accounting principles
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Calculator,
  FileText,
  TrendingUp,
  Building
} from 'lucide-react'

import { type JournalEntryActivityProps } from '@/lib/db/schema/activities'
import { type Activity } from '@/lib/db/schema/validators'

interface JournalEntry {
  account: string
  debit: number
  credit: number
}

export interface Scenario {
  id: string
  description: string
  correctEntry: JournalEntry[]
  explanation: string
}

interface DraggedAccount {
  account: string
  row: number
}

interface ExerciseState {
  currentScenario: Scenario
  journalEntries: JournalEntry[]
  draggedAccounts: DraggedAccount[]
  totalDebits: number
  totalCredits: number
  isBalanced: boolean
  feedback: string
  showFeedback: boolean
  attempts: number
  isCorrect: boolean
  completed: boolean
}

export type JournalEntryActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'journal-entry-building'
  props: JournalEntryActivityProps
}

interface JournalEntryBuildingProps {
  activity: JournalEntryActivity
  onSubmit?: (payload: {
    activityId: string
    scenarioId: string
    entries: JournalEntry[]
    attempts: number
    completedAt: Date
  }) => void
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
  'Owner\'s Equity',
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
    explanation: 'Cash (asset) increases with a debit, and Consulting Revenue increases with a credit. This follows the fundamental accounting equation: Assets = Liabilities + Equity.'
  },
  {
    id: 'scenario-2', 
    description: 'The business purchases office equipment for $2,500 on account (will pay later).',
    correctEntry: [
      { account: 'Equipment', debit: 2500, credit: 0 },
      { account: 'Accounts Payable', debit: 0, credit: 2500 }
    ],
    explanation: 'Equipment (asset) increases with a debit, and Accounts Payable (liability) increases with a credit. The business now owes money for the equipment purchased.'
  },
  {
    id: 'scenario-3',
    description: 'The business pays $800 cash for monthly rent expense.',
    correctEntry: [
      { account: 'Rent Expense', debit: 800, credit: 0 },
      { account: 'Cash', debit: 0, credit: 800 }
    ],
    explanation: 'Rent Expense increases with a debit (expenses reduce equity), and Cash (asset) decreases with a credit. This is a typical expense transaction.'
  },
  {
    id: 'scenario-4',
    description: 'A customer pays $1,200 cash for services that will be provided next month.',
    correctEntry: [
      { account: 'Cash', debit: 1200, credit: 0 },
      { account: 'Unearned Revenue', debit: 0, credit: 1200 }
    ],
    explanation: 'Cash (asset) increases with a debit, and Unearned Revenue (liability) increases with a credit. The business owes services to the customer.'
  },
  {
    id: 'scenario-5',
    description: 'The business pays $3,000 cash to reduce accounts payable from a previous purchase.',
    correctEntry: [
      { account: 'Accounts Payable', debit: 3000, credit: 0 },
      { account: 'Cash', debit: 0, credit: 3000 }
    ],
    explanation: 'Accounts Payable (liability) decreases with a debit, and Cash (asset) decreases with a credit. The business is paying off a debt.'
  }
]

export function JournalEntryBuilding({ activity, onSubmit }: JournalEntryBuildingProps) {
  const {
    props: {
      title: activityTitle,
      description: activityDescription,
      availableAccounts = [],
      scenarios,
      showInstructionsDefaultOpen = false
    }
  } = activity

  const accounts = useMemo(
    () => (availableAccounts.length ? availableAccounts : DEFAULT_AVAILABLE_ACCOUNTS),
    [availableAccounts]
  )
  const scenarioList = useMemo(
    () => (scenarios.length ? scenarios : DEFAULT_SCENARIOS),
    [scenarios]
  )

  const resolvedTitle = activityTitle ?? activity.displayName ?? 'Journal Entry Builder'
  const resolvedDescription =
    activityDescription ?? activity.description ?? 'Learn double-entry bookkeeping by creating journal entries for business transactions'

  const makeEmptyRows = useCallback(
    (scenario: Scenario) =>
      Array.from({ length: Math.max(2, scenario.correctEntry.length) }, () => ({ account: '', debit: 0, credit: 0 })),
    []
  )

  const initialScenario = scenarioList[0] ?? DEFAULT_SCENARIOS[0]

  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    currentScenario: initialScenario,
    journalEntries: makeEmptyRows(initialScenario),
    draggedAccounts: [],
    totalDebits: 0,
    totalCredits: 0,
    isBalanced: false,
    feedback: '',
    showFeedback: false,
    attempts: 0,
    isCorrect: false,
    completed: false
  })

  const [showInstructions, setShowInstructions] = useState(showInstructionsDefaultOpen)

  // Calculate totals whenever journal entries change
  useEffect(() => {
    const totalDebits = exerciseState.journalEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0)
    const totalCredits = exerciseState.journalEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0)
    const isBalanced = totalDebits === totalCredits && totalDebits > 0

    setExerciseState(prev => ({
      ...prev,
      totalDebits,
      totalCredits,
      isBalanced
    }))
  }, [exerciseState.journalEntries])

  const assignAccount = useCallback((rowIndex: number, account: string) => {
    setExerciseState(prev => ({
      ...prev,
      journalEntries: prev.journalEntries.map((entry, index) =>
        index === rowIndex ? { ...entry, account } : entry
      )
    }))
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, account: string) => {
    e.dataTransfer.setData('text/plain', account)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, rowIndex: number) => {
    e.preventDefault()
    const account = e.dataTransfer.getData('text/plain')

    if (account) {
      assignAccount(rowIndex, account)
    }
  }, [assignAccount])

  const handleAmountChange = useCallback((rowIndex: number, field: 'debit' | 'credit', value: string) => {
    const numValue = parseFloat(value) || 0
    
    setExerciseState(prev => ({
      ...prev,
      journalEntries: prev.journalEntries.map((entry, index) =>
        index === rowIndex 
          ? { 
              ...entry, 
              [field]: numValue,
              // Clear the opposite field when entering an amount
              [field === 'debit' ? 'credit' : 'debit']: numValue > 0 ? 0 : entry[field === 'debit' ? 'credit' : 'debit']
            }
          : entry
      )
    }))
  }, [])

  const checkEntry = useCallback(() => {
    const { currentScenario, journalEntries, totalDebits, totalCredits } = exerciseState
    let feedback = ''
    let isCorrect = false

    // Check if entry is balanced
    if (totalDebits !== totalCredits || totalDebits === 0) {
      feedback = `Entry is not balanced. Total debits: $${totalDebits.toFixed(2)}, Total credits: $${totalCredits.toFixed(2)}. Journal entries must have equal debits and credits.`
    }
    // Check if correct accounts are used
    else {
      const entryAccounts = journalEntries.map(entry => entry.account).filter(account => account !== '')
      const correctAccounts = currentScenario.correctEntry.map(entry => entry.account)
      
      const missingAccounts = correctAccounts.filter(account => !entryAccounts.includes(account))
      const extraAccounts = entryAccounts.filter(account => !correctAccounts.includes(account))
      
      if (missingAccounts.length > 0 || extraAccounts.length > 0) {
        feedback = `Incorrect accounts used. `
        if (missingAccounts.length > 0) {
          feedback += `Missing: ${missingAccounts.join(', ')}. `
        }
        if (extraAccounts.length > 0) {
          feedback += `Should not include: ${extraAccounts.join(', ')}. `
        }
      }
      // Check if amounts and sides are correct
      else {
        const amountErrors: string[] = []
        const sideErrors: string[] = []
        
        for (const correctEntry of currentScenario.correctEntry) {
          const studentEntry = journalEntries.find(entry => entry.account === correctEntry.account)
          if (studentEntry) {
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

    setExerciseState(prev => ({
      ...prev,
      feedback,
      showFeedback: true,
      attempts: prev.attempts + 1,
      isCorrect,
      completed: isCorrect
    }))

    if (isCorrect) {
      onSubmit?.({
        activityId: activity.id,
        scenarioId: currentScenario.id,
        entries: journalEntries,
        attempts: exerciseState.attempts + 1,
        completedAt: new Date()
      })
    }
  }, [activity.id, exerciseState, onSubmit])

  const resetEntry = useCallback(() => {
    setExerciseState(prev => ({
      ...prev,
      journalEntries: makeEmptyRows(prev.currentScenario),
      draggedAccounts: [],
      totalDebits: 0,
      totalCredits: 0,
      isBalanced: false,
      feedback: '',
      showFeedback: false,
      isCorrect: false,
      completed: false
    }))
  }, [makeEmptyRows])

  const nextScenario = useCallback(() => {
    const currentIndex = scenarioList.findIndex(s => s.id === exerciseState.currentScenario.id)
    const nextIndex = (currentIndex + 1) % scenarioList.length
    const next = scenarioList[nextIndex]
    
    setExerciseState(prev => ({
      ...prev,
      currentScenario: next,
      journalEntries: makeEmptyRows(next),
      draggedAccounts: [],
      totalDebits: 0,
      totalCredits: 0,
      isBalanced: false,
      feedback: '',
      showFeedback: false,
      attempts: 0,
      isCorrect: false,
      completed: false
    }))
  }, [exerciseState.currentScenario.id, makeEmptyRows, scenarioList])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            {resolvedTitle}
          </CardTitle>
          <CardDescription className="text-lg">
            {resolvedDescription}
          </CardDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              How to Play
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              How to Create Journal Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objective */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">🎯 Objective</h4>
              <p className="text-purple-700">
                Create correct journal entries for business transactions using double-entry bookkeeping principles. 
                Every transaction affects at least two accounts, and total debits must equal total credits.
              </p>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">📝 Step-by-Step Instructions</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h5 className="font-medium mb-1">Read the Transaction</h5>
                    <p className="text-sm text-gray-600">Carefully analyze the business transaction scenario provided</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h5 className="font-medium mb-1">Drag Account Names</h5>
                    <p className="text-sm text-gray-600">Drag the correct account names from the bank into the journal entry table</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h5 className="font-medium mb-1">Enter Amounts</h5>
                    <p className="text-sm text-gray-600">Input the monetary amounts in either the Debit or Credit column</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h5 className="font-medium mb-1">Check Balance</h5>
                    <p className="text-sm text-gray-600">Ensure total debits equal total credits before submitting</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Debit/Credit Rules */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">⚖️ Debit & Credit Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-800 mb-2">DEBIT Increases:</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Assets (Cash, Equipment, Inventory)</li>
                    <li>• Expenses (Rent, Salaries, Utilities)</li>
                    <li>• Dividends/Draws</li>
                  </ul>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-800 mb-2">CREDIT Increases:</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Liabilities (Accounts Payable, Notes Payable)</li>
                    <li>• Equity (Owner&apos;s Equity, Retained Earnings)</li>
                    <li>• Revenue (Sales, Service Revenue)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Account Categories */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">📊 Account Categories</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border">
                  <h6 className="font-medium text-green-600 mb-2">Assets</h6>
                  <p className="text-xs text-gray-600">Resources owned by the business (Cash, Equipment, Inventory)</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h6 className="font-medium text-red-600 mb-2">Liabilities</h6>
                  <p className="text-xs text-gray-600">Debts owed by the business (Accounts Payable, Notes Payable)</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h6 className="font-medium text-blue-600 mb-2">Equity</h6>
                  <p className="text-xs text-gray-600">Owner&apos;s investment and retained earnings</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h6 className="font-medium text-purple-600 mb-2">Revenue</h6>
                  <p className="text-xs text-gray-600">Income earned from business operations</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h6 className="font-medium text-orange-600 mb-2">Expenses</h6>
                  <p className="text-xs text-gray-600">Costs incurred to generate revenue</p>
                </div>
              </div>
            </div>

            {/* Success Tips */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">💡 Success Tips</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• <strong>Identify what the business receives and gives:</strong> Every transaction has two sides</li>
                <li>• <strong>Ask &ldquo;What increases?&rdquo;:</strong> Use debit/credit rules based on account type</li>
                <li>• <strong>Check your math:</strong> Total debits must always equal total credits</li>
                <li>• <strong>Think about account relationships:</strong> Cash and revenue often appear together</li>
                <li>• <strong>Consider the accounting equation:</strong> Assets = Liabilities + Equity</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Scenario */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Transaction Scenario {scenarioList.findIndex(s => s.id === exerciseState.currentScenario.id) + 1} of {scenarioList.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Business Transaction:</h4>
            <p className="text-blue-700 text-lg">{exerciseState.currentScenario.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Available Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Available Accounts
          </CardTitle>
          <CardDescription>Drag account names into the journal entry table below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {accounts.map((account) => (
              <div
                key={account}
                draggable
                onDragStart={(e) => handleDragStart(e, account)}
                className="p-2 bg-gray-50 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 hover:border-gray-300 transition-colors text-sm text-center font-medium"
              >
                {account}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Journal Entry Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Journal Entry
          </CardTitle>
          <CardDescription>Create your journal entry by dragging accounts and entering amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-4 text-left font-semibold">Account</th>
                  <th className="border border-gray-300 p-4 text-center font-semibold">Debit</th>
                  <th className="border border-gray-300 p-4 text-center font-semibold">Credit</th>
                </tr>
              </thead>
              <tbody>
                {exerciseState.journalEntries.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td 
                      className="border border-gray-300 p-4"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="min-h-[40px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-purple-400 hover:bg-purple-50 transition-colors">
                        {entry.account || <span className="text-gray-500">Drop account here</span>}
                      </div>
                      <label className="sr-only" htmlFor={`account-select-${index}`}>
                        Choose account for row {index + 1}
                      </label>
                      <select
                        id={`account-select-${index}`}
                        aria-label={`Select account for row ${index + 1}`}
                        value={entry.account}
                        onChange={(event) => assignAccount(index, event.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
                      >
                        <option value="">Choose account</option>
                        {accounts.map((accountName) => (
                          <option key={`${accountName}-${index}`} value={accountName}>
                            {accountName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300 p-4">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={entry.debit || ''}
                        onChange={(e) => handleAmountChange(index, 'debit', e.target.value)}
                        className="text-center"
                      />
                    </td>
                    <td className="border border-gray-300 p-4">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={entry.credit || ''}
                        onChange={(e) => handleAmountChange(index, 'credit', e.target.value)}
                        className="text-center"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 p-4 font-bold">TOTALS</td>
                  <td className="border border-gray-300 p-4 text-center font-bold">
                    ${exerciseState.totalDebits.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-4 text-center font-bold">
                    ${exerciseState.totalCredits.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Balance Status */}
          <div className="mt-4 p-3 rounded-lg border flex items-center justify-center gap-2">
            {exerciseState.totalDebits === 0 && exerciseState.totalCredits === 0 ? (
              <>
                <AlertTriangle className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Enter amounts to see balance status</span>
              </>
            ) : exerciseState.isBalanced ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-semibold">Entry is balanced! ✓</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-semibold">
                  Entry is not balanced - Difference: ${Math.abs(exerciseState.totalDebits - exerciseState.totalCredits).toFixed(2)}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Controls */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={checkEntry}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700"
          disabled={exerciseState.totalDebits === 0 && exerciseState.totalCredits === 0}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Check Entry
        </Button>
        <Button 
          onClick={resetEntry}
          variant="outline" 
          size="lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Entry
        </Button>
        {exerciseState.completed && (
          <Button 
            onClick={nextScenario}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Next Scenario
          </Button>
        )}
      </div>

      {/* Feedback */}
      {exerciseState.showFeedback && (
        <Card className={`border-2 ${exerciseState.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${exerciseState.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {exerciseState.isCorrect ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              {exerciseState.isCorrect ? 'Excellent Work!' : 'Try Again'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`${exerciseState.isCorrect ? 'text-green-700' : 'text-red-700'}`}
              data-testid="journal-feedback"
            >
              {exerciseState.feedback}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Attempts: {exerciseState.attempts}
              </Badge>
              {exerciseState.isCorrect && (
                <Badge variant="outline" className="text-sm bg-green-100 text-green-800">
                  ✓ Completed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default JournalEntryBuilding
