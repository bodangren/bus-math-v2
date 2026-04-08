'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, RefreshCw, HelpCircle, Target, Calculator } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

type BalanceSheetScenarioKind = 'assets' | 'liabilities' | 'equity' | 'accounting_equation' | 'classification'

interface BalanceSheetProblem {
  id: string
  kind: BalanceSheetScenarioKind
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
    kind: 'assets' as const,
    label: 'Asset Calculation',
    scenarioText: 'A company has $50,000 in cash, $30,000 in inventory, and $20,000 in equipment. What are total assets?',
    correct: '$100,000',
    distractors: [
      { answer: '$80,000', label: 'Forgot to include equipment' },
      { answer: '$50,000', label: 'Used only cash' },
      { answer: '$70,000', label: 'Forgot to include inventory' },
    ],
  },
  {
    kind: 'liabilities' as const,
    label: 'Liability Classification',
    scenarioText: 'Which of the following is a liability?',
    correct: 'Accounts Payable',
    distractors: [
      { answer: 'Accounts Receivable', label: 'Confused asset with liability' },
      { answer: 'Common Stock', label: 'Confused equity with liability' },
      { answer: 'Equipment', label: 'Confused asset with liability' },
    ],
  },
  {
    kind: 'equity' as const,
    label: 'Equity Calculation',
    scenarioText: 'Assets are $150,000 and liabilities are $60,000. What is total equity?',
    correct: '$90,000',
    distractors: [
      { answer: '$210,000', label: 'Added instead of subtracted' },
      { answer: '$60,000', label: 'Used liabilities only' },
      { answer: '$150,000', label: 'Used assets only' },
    ],
  },
  {
    kind: 'accounting_equation' as const,
    label: 'Accounting Equation',
    scenarioText: 'Which is the correct accounting equation?',
    correct: 'Assets = Liabilities + Equity',
    distractors: [
      { answer: 'Assets = Liabilities − Equity', label: 'Subtracted instead of adding' },
      { answer: 'Assets + Liabilities = Equity', label: 'Mixed up equation' },
      { answer: 'Liabilities = Assets + Equity', label: 'Incorrect equation structure' },
    ],
  },
  {
    kind: 'classification' as const,
    label: 'Account Classification',
    scenarioText: 'How is "Common Stock" classified on the balance sheet?',
    correct: 'Equity',
    distractors: [
      { answer: 'Asset', label: 'Confused equity with asset' },
      { answer: 'Liability', label: 'Confused equity with liability' },
      { answer: 'Revenue', label: 'Confused equity with revenue' },
    ],
  },
]

function generateProblem(): BalanceSheetProblem {
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

export interface BalanceSheetPracticeProps {
  activity: {
    id?: string
    props?: {
      masteryThreshold?: number
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function BalanceSheetPractice({ activity, onSubmit, onComplete }: BalanceSheetPracticeProps) {
  const masteryTarget = activity.props?.masteryThreshold ?? 5
  const [problem, setProblem] = useState<BalanceSheetProblem>(generateProblem)
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
        activityId: activity.id ?? 'balance-sheet-practice',
        mode: 'independent_practice',
        answers: {
          selectedAnswer: userAnswer,
          isCorrect,
          scenarioKind: problem.kind,
        },
        parts: [
          createSimulationPart('balance-sheet', problem.correctAnswer, { isCorrect }),
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
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="text-xl text-amber-800 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Balance Sheet Practice
        </CardTitle>
        <CardDescription className="text-amber-600">
          Practice balance sheet calculations and classifications. Target: {masteryTarget} consecutive correct answers.
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

        <div className="bg-white p-6 rounded-lg border border-amber-200">
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
                        : 'border-amber-500 bg-amber-50'
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
                  <Button onClick={handleSubmit} disabled={!userAnswer} className="bg-amber-600 hover:bg-amber-700">
                    Check Answer
                  </Button>
                  <Button variant="outline" onClick={handleShowExample} className="border-amber-300 text-amber-700">
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
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-2">Balance Sheet Reminders</h4>
            <div className="text-sm text-amber-700 space-y-2">
              <p><strong>Accounting Equation:</strong> Assets = Liabilities + Equity</p>
              <p><strong>Assets:</strong> Resources owned by the company (cash, inventory, equipment)</p>
              <p><strong>Liabilities:</strong> Obligations owed to others (accounts payable, loans)</p>
              <p><strong>Equity:</strong> Owner&apos;s claim on assets (common stock, retained earnings)</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h4 className="font-semibold text-green-800 mb-1">Key Reminders</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Always check the accounting equation</li>
              <li>Assets are on the left side</li>
              <li>Liabilities + Equity are on the right side</li>
            </ul>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <h4 className="font-semibold text-red-800 mb-1">Common Mistakes</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Mixing up debits and credits</li>
              <li>Confusing assets with liabilities</li>
              <li>Forgetting the accounting equation</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
