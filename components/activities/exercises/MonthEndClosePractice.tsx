'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, RefreshCw, HelpCircle, Target, Calculator } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

type CloseScenarioKind = 'adjustments' | 'closing_revenue' | 'closing_expenses' | 'closing_income_summary' | 'closing_dividends'

interface CloseProblem {
  id: string
  kind: CloseScenarioKind
  scenarioLabel: string
  scenarioText: string
  correctAnswer: string
  distractors: {
    answer: string
    label: string
  }[]
}

const scenarioPool = [
  {
    kind: 'adjustments' as const,
    label: 'Step 1: Adjustments',
    scenarioText: 'TechStart has $600 in unrecorded accrued wages at month end. What is the first step in the month‑end close process?',
    correct: 'Record adjusting entries: Debit Wages Expense $600, Credit Wages Payable $600',
    distractors: [
      { answer: 'Close revenue accounts first', label: 'Skipped adjustments and went straight to closing' },
      { answer: 'Record closing entries before adjusting entries', label: 'Wrong order: closing before adjustments' },
      { answer: 'No entry needed', label: 'Forgot to adjust for accrued expenses' },
    ],
  },
  {
    kind: 'closing_revenue' as const,
    label: 'Step 2: Close Revenues',
    scenarioText: 'After adjusting entries are complete, TechStart has $8,000 in total revenue. What is the next step in the close process?',
    correct: 'Close revenue accounts: Debit (Total Revenues) $8,000, Credit Income Summary $8,000',
    distractors: [
      { answer: 'Close expense accounts first', label: 'Wrong order: expenses before revenues' },
      { answer: 'Close directly to Retained Earnings', label: 'Closed revenues directly to Retained Earnings' },
      { answer: 'Record dividends next', label: 'Skipped closing and went to dividends' },
    ],
  },
  {
    kind: 'closing_expenses' as const,
    label: 'Step 3: Close Expenses',
    scenarioText: 'Revenues are closed. TechStart has $5,200 in total expenses. What is the next step?',
    correct: 'Close expense accounts: Debit Income Summary $5,200, Credit (Total Expenses) $5,200',
    distractors: [
      { answer: 'Close Income Summary next', label: 'Skipped closing expenses' },
      { answer: 'Close expenses to Retained Earnings directly', label: 'Closed expenses directly to Retained Earnings' },
      { answer: 'Record adjustments again', label: 'Repeated adjustments instead of closing expenses' },
    ],
  },
  {
    kind: 'closing_income_summary' as const,
    label: 'Step 4: Close Income Summary',
    scenarioText: 'Revenues and expenses are closed. Income Summary has a $2,800 credit balance (net income). What is the next step?',
    correct: 'Close Income Summary: Debit Income Summary $2,800, Credit Retained Earnings $2,800',
    distractors: [
      { answer: 'Close Dividends next', label: 'Skipped closing Income Summary' },
      { answer: 'Debit Retained Earnings, Credit Income Summary', label: 'Swapped accounts for net income' },
      { answer: 'Close Income Summary to Dividends', label: 'Closed Income Summary to wrong account' },
    ],
  },
  {
    kind: 'closing_dividends' as const,
    label: 'Step 5: Close Dividends',
    scenarioText: 'Income Summary is closed. TechStart declared $800 in dividends. What is the final step?',
    correct: 'Close Dividends: Debit Retained Earnings $800, Credit Dividends $800',
    distractors: [
      { answer: 'Close Dividends to Income Summary', label: 'Closed Dividends to wrong account' },
      { answer: 'Debit Dividends, Credit Retained Earnings', label: 'Swapped debit and credit' },
      { answer: 'No entry needed', label: 'Forgot to close Dividends' },
    ],
  },
]

function generateProblem(): CloseProblem {
  const scenario = scenarioPool[Math.floor(Math.random() * scenarioPool.length)]
  return {
    id: Math.random().toString(36).substr(2, 9),
    kind: scenario.kind,
    scenarioLabel: scenario.label,
    scenarioText: scenario.scenarioText,
    correctAnswer: scenario.correct,
    distractors: scenario.distractors,
  }
}

export interface MonthEndClosePracticeProps {
  activity: {
    id?: string
    props?: {
      masteryThreshold?: number
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function MonthEndClosePractice({ activity, onSubmit, onComplete }: MonthEndClosePracticeProps) {
  const masteryTarget = activity.props?.masteryThreshold ?? 5
  const [problem, setProblem] = useState<CloseProblem>(generateProblem)
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [streak, setStreak] = useState(0)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [showWorkedExample, setShowWorkedExample] = useState(false)
  const [selectedDistractor, setSelectedDistractor] = useState<number | null>(null)
  const hasCompleted = useRef(false)
  const submittedRef = useRef(false)

  useEffect(() => {
    if (consecutiveCorrect >= masteryTarget && !hasCompleted.current) {
      hasCompleted.current = true
      onComplete?.()
    }
  }, [consecutiveCorrect, masteryTarget, onComplete])

  const shuffledOptions = useMemo(() => {
    const opts: {
      label: string
      isCorrect: boolean
      distractorIndex?: number
      distractorLabel?: string
    }[] = [
      {
        label: problem.correctAnswer,
        isCorrect: true,
      },
      ...problem.distractors.map((d, i) => ({
        label: d.answer,
        isCorrect: false,
        distractorIndex: i,
        distractorLabel: d.label,
      })),
    ]
    return opts.sort(() => Math.random() - 0.5)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.id])

  const handleSubmit = useCallback(() => {
    if (submittedRef.current) return
    const selectedOption = shuffledOptions.find(o => o.label === userAnswer)
    const isCorrect = selectedOption?.isCorrect ?? false
    if (!selectedOption) return

    submittedRef.current = true
    setCorrect(isCorrect)
    setSubmitted(true)
    if (selectedOption.distractorIndex !== undefined) {
      setSelectedDistractor(selectedOption.distractorIndex)
    }
    if (isCorrect) {
      setConsecutiveCorrect(prev => prev + 1)
      setStreak(prev => prev + 1)
    } else {
      setConsecutiveCorrect(0)
    }

    onSubmit?.(
      buildSimulationSubmissionEnvelope({
        activityId: activity.id ?? 'month-end-close-practice',
        mode: 'independent_practice',
        answers: {
          selectedAnswer: userAnswer,
          isCorrect,
          scenarioKind: problem.kind,
        },
        parts: [
          createSimulationPart('month-end-close', problem.correctAnswer, { isCorrect }),
        ],
        artifact: {
          scenarioText: problem.scenarioText,
          scenarioKind: problem.kind,
        },
      }),
    )
  }, [userAnswer, shuffledOptions, onSubmit, activity.id, problem])

  const handleNewProblem = useCallback(() => {
    setProblem(generateProblem())
    setUserAnswer('')
    setSubmitted(false)
    setCorrect(null)
    setShowWorkedExample(false)
    setSelectedDistractor(null)
    submittedRef.current = false
  }, [])

  const handleShowExample = useCallback(() => {
    setShowWorkedExample(true)
  }, [])

  const progressToMastery = (consecutiveCorrect / masteryTarget) * 100
  const selectedDistractorData = problem.distractors[selectedDistractor ?? -1]

  return (
    <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50">
      <CardHeader>
        <CardTitle className="text-xl text-cyan-800 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Month‑End Close Practice
        </CardTitle>
        <CardDescription className="text-cyan-600">
          Practice the full month‑end close cycle step‑by‑step. Target: {masteryTarget} consecutive correct answers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current streak: <strong>{streak}</strong></span>
            <span className="text-gray-600">Mastery progress: <strong>{Math.round(progressToMastery)}%</strong></span>
          </div>
          <Progress value={progressToMastery} className="h-2" />
          {consecutiveCorrect >= masteryTarget && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Mastery achieved! {masteryTarget} correct in a row.</span>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-cyan-200">
          <div className="space-y-4">
            <p className="text-lg text-gray-800 font-medium">
              {problem.scenarioText}
            </p>

            <div className="space-y-2">
              {shuffledOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserAnswer(option.label)}
                  disabled={submitted}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    userAnswer === option.label
                      ? submitted
                        ? option.isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <p className="text-sm text-gray-800">{option.label}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-2 justify-center pt-2">
              {!submitted ? (
                <>
                  <Button onClick={handleSubmit} disabled={!userAnswer} className="bg-cyan-600 hover:bg-cyan-700">
                    Check Answer
                  </Button>
                  <Button variant="outline" onClick={handleShowExample} className="border-cyan-300 text-cyan-700">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Show Example
                  </Button>
                </>
              ) : (
                <Button onClick={handleNewProblem} className="bg-green-600 hover:bg-green-700">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  New Scenario
                </Button>
              )}
            </div>
          </div>
        </div>

        {submitted && correct && (
          <div className="p-4 rounded-lg border-2 bg-green-50 border-green-400">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">Correct!</p>
                <div className="mt-2 bg-white p-3 rounded border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>Correct Step:</strong> {problem.correctAnswer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {submitted && !correct && (
          <div className="p-4 rounded-lg border-2 bg-red-50 border-red-400">
            <div className="flex items-start gap-3">
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-800">Not quite. Let us review the correct step.</p>
                {selectedDistractorData && (
                  <div className="mt-2 bg-white p-3 rounded border border-red-200">
                    <p className="font-medium text-red-800 flex items-center gap-1">
                      <Calculator className="h-4 w-4" />
                      Likely error: {selectedDistractorData.label}
                    </p>
                  </div>
                )}
                <div className="mt-2 bg-white p-3 rounded border border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>Correct Step:</strong> {problem.correctAnswer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showWorkedExample && (
          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
            <h4 className="font-semibold text-cyan-800 mb-2">Month‑End Close Steps</h4>
            <div className="text-sm text-cyan-700 space-y-2">
              <p><strong>1.</strong> Record adjusting entries</p>
              <p><strong>2.</strong> Close revenue accounts to Income Summary</p>
              <p><strong>3.</strong> Close expense accounts to Income Summary</p>
              <p><strong>4.</strong> Close Income Summary to Retained Earnings</p>
              <p><strong>5.</strong> Close Dividends to Retained Earnings</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h4 className="font-semibold text-green-800 mb-1">Key Order</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Adjustments first, then closing</li>
              <li>Revenues → Expenses → Income Summary → Dividends</li>
              <li>Only Income Summary touches Retained Earnings</li>
            </ul>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <h4 className="font-semibold text-red-800 mb-1">Common Mistakes</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Closing before adjusting</li>
              <li>Wrong order of closing steps</li>
              <li>Closing directly to Retained Earnings</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
