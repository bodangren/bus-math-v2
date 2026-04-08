'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, RefreshCw, HelpCircle, Target, Calculator } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

type IncomeStatementScenarioKind = 'revenue' | 'expense' | 'gross_profit' | 'operating_income' | 'net_income'

interface IncomeStatementProblem {
  id: string
  kind: IncomeStatementScenarioKind
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
    kind: 'revenue' as const,
    label: 'Revenue Calculation',
    scenarioText: 'A company sold 100 units at $50 each. What is the total revenue?',
    correct: '$5,000',
    distractors: [
      { answer: '$100', label: 'Forgot to multiply by price per unit' },
      { answer: '$50', label: 'Used price per unit instead of total' },
      { answer: '$2,500', label: 'Miscalculated units × price' },
    ],
  },
  {
    kind: 'gross_profit' as const,
    label: 'Gross Profit Calculation',
    scenarioText: 'Revenue is $10,000 and Cost of Goods Sold is $6,000. What is the gross profit?',
    correct: '$4,000',
    distractors: [
      { answer: '$16,000', label: 'Added instead of subtracted' },
      { answer: '$6,000', label: 'Used COGS instead of gross profit' },
      { answer: '$10,000', label: 'Used revenue instead of gross profit' },
    ],
  },
  {
    kind: 'net_income' as const,
    label: 'Net Income Calculation',
    scenarioText: 'Gross profit is $5,000 and operating expenses are $3,000. What is the net income?',
    correct: '$2,000',
    distractors: [
      { answer: '$8,000', label: 'Added instead of subtracted' },
      { answer: '$3,000', label: 'Used operating expenses instead of net income' },
      { answer: '$5,000', label: 'Used gross profit instead of net income' },
    ],
  },
  {
    kind: 'expense' as const,
    label: 'Expense Classification',
    scenarioText: 'Which of the following is an operating expense?',
    correct: 'Salaries Expense',
    distractors: [
      { answer: 'Cost of Goods Sold', label: 'Confused COGS with operating expense' },
      { answer: 'Accounts Payable', label: 'Used a liability account' },
      { answer: 'Sales Revenue', label: 'Used a revenue account' },
    ],
  },
  {
    kind: 'operating_income' as const,
    label: 'Operating Income Calculation',
    scenarioText: 'Gross profit is $8,000, operating expenses are $3,000, and interest expense is $500. What is the operating income?',
    correct: '$5,000',
    distractors: [
      { answer: '$4,500', label: 'Subtracted interest expense (not operating)' },
      { answer: '$11,000', label: 'Added instead of subtracted' },
      { answer: '$8,000', label: 'Used gross profit instead of operating income' },
    ],
  },
]

function generateProblem(): IncomeStatementProblem {
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

export interface IncomeStatementPracticeProps {
  activity: {
    id?: string
    props?: {
      masteryThreshold?: number
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function IncomeStatementPractice({ activity, onSubmit, onComplete }: IncomeStatementPracticeProps) {
  const masteryTarget = activity.props?.masteryThreshold ?? 5
  const [problem, setProblem] = useState<IncomeStatementProblem>(generateProblem)
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
        activityId: activity.id ?? 'income-statement-practice',
        mode: 'independent_practice',
        answers: {
          selectedAnswer: userAnswer,
          isCorrect,
          scenarioKind: problem.kind,
        },
        parts: [
          createSimulationPart('income-statement', problem.correctAnswer, { isCorrect }),
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
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardHeader>
        <CardTitle className="text-xl text-emerald-800 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Income Statement Practice
        </CardTitle>
        <CardDescription className="text-emerald-600">
          Practice income statement calculations. Target: {masteryTarget} consecutive correct answers.
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

        <div className="bg-white p-6 rounded-lg border border-emerald-200">
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
                        : 'border-emerald-500 bg-emerald-50'
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
                  <Button onClick={handleSubmit} disabled={!userAnswer} className="bg-emerald-600 hover:bg-emerald-700">
                    Check Answer
                  </Button>
                  <Button variant="outline" onClick={handleShowExample} className="border-emerald-300 text-emerald-700">
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
                    <strong>Correct Answer:</strong> {problem.correctAnswer}
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
                <p className="font-semibold text-red-800">Not quite. Let us work through the correct answer.</p>
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
                    <strong>Correct Answer:</strong> {problem.correctAnswer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showWorkedExample && (
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <h4 className="font-semibold text-emerald-800 mb-2">Income Statement Formula Reminders</h4>
            <div className="text-sm text-emerald-700 space-y-2">
              <p><strong>Revenue:</strong> Units sold × Price per unit</p>
              <p><strong>Gross Profit:</strong> Revenue − Cost of Goods Sold</p>
              <p><strong>Operating Income:</strong> Gross Profit − Operating Expenses</p>
              <p><strong>Net Income:</strong> Operating Income − Non‑operating Expenses</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h4 className="font-semibold text-green-800 mb-1">Key Reminders</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Start with revenue at the top</li>
              <li>Subtract COGS to get gross profit</li>
              <li>Subtract operating expenses for operating income</li>
            </ul>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <h4 className="font-semibold text-red-800 mb-1">Common Mistakes</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Adding instead of subtracting</li>
              <li>Confusing operating vs non‑operating items</li>
              <li>Using the wrong formula</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
