'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, RefreshCw, HelpCircle, Target, Calculator } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

type CashFlowScenarioKind = 'operating' | 'investing' | 'financing' | 'net_cash' | 'cash_classification'

interface CashFlowProblem {
  id: string
  kind: CashFlowScenarioKind
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
    kind: 'operating' as const,
    label: 'Operating Cash Flow Calculation',
    scenarioText: 'A company had $100,000 in cash from sales and $60,000 in cash paid for expenses. What is net operating cash flow?',
    correct: '$40,000',
    distractors: [
      { answer: '$160,000', label: 'Added instead of subtracted' },
      { answer: '$60,000', label: 'Used expenses only' },
      { answer: '$100,000', label: 'Used sales only' },
    ],
  },
  {
    kind: 'investing' as const,
    label: 'Investing Cash Flow Classification',
    scenarioText: 'Which of the following is an investing activity?',
    correct: 'Purchase of equipment',
    distractors: [
      { answer: 'Payment of salaries', label: 'Confused with operating activity' },
      { answer: 'Issuance of stock', label: 'Confused with financing activity' },
      { answer: 'Collection from customers', label: 'Confused with operating activity' },
    ],
  },
  {
    kind: 'financing' as const,
    label: 'Financing Cash Flow Calculation',
    scenarioText: 'A company issued $50,000 in stock and paid $10,000 in dividends. What is net financing cash flow?',
    correct: '$40,000',
    distractors: [
      { answer: '$60,000', label: 'Added instead of subtracted' },
      { answer: '$10,000', label: 'Used dividends only' },
      { answer: '$50,000', label: 'Used stock issuance only' },
    ],
  },
  {
    kind: 'net_cash' as const,
    label: 'Net Cash Flow Calculation',
    scenarioText: 'Operating cash flow is $30,000, investing is -$10,000, and financing is $5,000. What is net change in cash?',
    correct: '$25,000',
    distractors: [
      { answer: '$45,000', label: 'Treated investing cash outflow as inflow' },
      { answer: '$15,000', label: 'Forgot to add financing' },
      { answer: '$30,000', label: 'Used only operating cash flow' },
    ],
  },
  {
    kind: 'cash_classification' as const,
    label: 'Cash Flow Classification',
    scenarioText: 'How is "cash paid for inventory" classified?',
    correct: 'Operating activity',
    distractors: [
      { answer: 'Investing activity', label: 'Confused with long‑term assets' },
      { answer: 'Financing activity', label: 'Confused with capital raising' },
      { answer: 'Non‑cash activity', label: 'Incorrectly identified as non‑cash' },
    ],
  },
]

function generateProblem(): CashFlowProblem {
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

export interface CashFlowPracticeProps {
  activity: {
    id?: string
    props?: {
      masteryThreshold?: number
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function CashFlowPractice({ activity, onSubmit, onComplete }: CashFlowPracticeProps) {
  const masteryTarget = activity.props?.masteryThreshold ?? 5
  const [problem, setProblem] = useState<CashFlowProblem>(generateProblem)
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

    try {
      onSubmit?.(
        buildSimulationSubmissionEnvelope({
          activityId: activity.id ?? 'cash-flow-practice',
          mode: 'independent_practice',
          answers: {
            selectedAnswer: userAnswer,
            isCorrect,
            scenarioKind: problem.kind,
          },
          parts: [
            createSimulationPart('cash-flow', problem.correctAnswer, { isCorrect }),
          ],
          artifact: {
            scenarioText: problem.scenarioText,
            scenarioKind: problem.kind,
          },
        }),
      )
    } catch (err) {
      console.error('CashFlowPractice submission failed:', err)
      submittedRef.current = false
      setSubmitted(false)
      setCorrect(null)
    }
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
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Cash Flow Practice
        </CardTitle>
        <CardDescription className="text-blue-600">
          Practice cash flow calculations and classifications. Target: {masteryTarget} consecutive correct answers.
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

        <div className="bg-white p-6 rounded-lg border border-blue-200">
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
                        : 'border-blue-500 bg-blue-50'
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
                  <Button onClick={handleSubmit} disabled={!userAnswer} className="bg-blue-600 hover:bg-blue-700">
                    Check Answer
                  </Button>
                  <Button variant="outline" onClick={handleShowExample} className="border-blue-300 text-blue-700">
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Cash Flow Statement Reminders</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Operating Activities:</strong> Day‑to‑day business operations (sales, expenses, inventory)</p>
              <p><strong>Investing Activities:</strong> Long‑term assets (equipment, investments)</p>
              <p><strong>Financing Activities:</strong> Capital structure (stock, debt, dividends)</p>
              <p><strong>Net Cash Flow:</strong> Operating + Investing + Financing</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h4 className="font-semibold text-green-800 mb-1">Key Reminders</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Operating = current operations</li>
              <li>Investing = long‑term assets</li>
              <li>Financing = capital & debt</li>
            </ul>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <h4 className="font-semibold text-red-800 mb-1">Common Mistakes</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Mixing activity categories</li>
              <li>Adding instead of subtracting outflows</li>
              <li>Forgetting sign conventions</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
