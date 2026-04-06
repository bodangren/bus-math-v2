'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, RefreshCw, HelpCircle, Target, Calculator } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface DepreciationProblem {
  id: string
  assetName: string
  cost: number
  salvageValue: number
  usefulLife: number
  yearToCalculate: number
  correctAnnualExpense: number
  correctAccumulated: number
  correctBookValue: number
  distractors: {
    annualExpense: number
    accumulated: number
    bookValue: number
    label: string
  }[]
}

const assetPool = [
  { name: 'delivery van', costRange: [28000, 45000], lifeRange: [5, 8], salvageRange: [3000, 8000] },
  { name: 'commercial oven', costRange: [12000, 25000], lifeRange: [7, 12], salvageRange: [1000, 3000] },
  { name: 'warehouse shelving system', costRange: [8000, 18000], lifeRange: [10, 15], salvageRange: [500, 1500] },
  { name: 'office building', costRange: [300000, 600000], lifeRange: [25, 40], salvageRange: [30000, 80000] },
  { name: 'CNC machining center', costRange: [50000, 100000], lifeRange: [10, 15], salvageRange: [5000, 15000] },
  { name: 'fleet of laptops', costRange: [5000, 12000], lifeRange: [3, 5], salvageRange: [500, 1500] },
  { name: 'commercial refrigerator', costRange: [6000, 14000], lifeRange: [8, 12], salvageRange: [500, 1000] },
  { name: 'packaging machine', costRange: [20000, 40000], lifeRange: [8, 12], salvageRange: [2000, 5000] },
]

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function roundToNearestDollar(val: number): number {
  return Math.round(val)
}

function generateProblem(): DepreciationProblem {
  const asset = assetPool[Math.floor(Math.random() * assetPool.length)]
  const cost = randInt(asset.costRange[0], asset.costRange[1])
  const usefulLife = randInt(asset.lifeRange[0], asset.lifeRange[1])
  const salvageValue = randInt(asset.salvageRange[0], asset.salvageRange[1])
  const yearToCalculate = randInt(1, usefulLife)

  const depreciableBase = cost - salvageValue
  const annualExpense = roundToNearestDollar(depreciableBase / usefulLife)
  const accumulated = annualExpense * yearToCalculate
  const bookValue = cost - accumulated

  const wrongMethods: { annualExpense: number; accumulated: number; bookValue: number; label: string }[] = []

  const wrongAnnual1 = roundToNearestDollar(cost / usefulLife)
  wrongMethods.push({
    annualExpense: wrongAnnual1,
    accumulated: wrongAnnual1 * yearToCalculate,
    bookValue: cost - wrongAnnual1 * yearToCalculate,
    label: 'Forgot to subtract salvage value',
  })

  const wrongAnnual2 = roundToNearestDollar(depreciableBase / (usefulLife + 1))
  wrongMethods.push({
    annualExpense: wrongAnnual2,
    accumulated: wrongAnnual2 * yearToCalculate,
    bookValue: cost - wrongAnnual2 * yearToCalculate,
    label: 'Added 1 to useful life by mistake',
  })

  const wrongAnnual3 = roundToNearestDollar((cost - salvageValue) / (yearToCalculate))
  wrongMethods.push({
    annualExpense: wrongAnnual3,
    accumulated: wrongAnnual3 * yearToCalculate,
    bookValue: cost - wrongAnnual3 * yearToCalculate,
    label: 'Divided by the year number instead of total useful life',
  })

  return {
    id: Math.random().toString(36).substr(2, 9),
    assetName: asset.name,
    cost,
    salvageValue,
    usefulLife,
    yearToCalculate,
    correctAnnualExpense: annualExpense,
    correctAccumulated: accumulated,
    correctBookValue: bookValue,
    distractors: wrongMethods,
  }
}

export interface StraightLineMasteryProps {
  activity: {
    id?: string
    props?: {
      masteryThreshold?: number
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function StraightLineMastery({ activity, onSubmit, onComplete }: StraightLineMasteryProps) {
  const masteryTarget = activity.props?.masteryThreshold ?? 5
  const [problem, setProblem] = useState<DepreciationProblem>(generateProblem)
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [streak, setStreak] = useState(0)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [showWorkedExample, setShowWorkedExample] = useState(false)
  const [selectedDistractor, setSelectedDistractor] = useState<number | null>(null)
  const hasCompleted = useRef(false)

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
        label: `Annual expense: $${problem.correctAnnualExpense.toLocaleString()}, ` +
          `Accumulated (Year ${problem.yearToCalculate}): $${problem.correctAccumulated.toLocaleString()}, ` +
          `Book value: $${problem.correctBookValue.toLocaleString()}`,
        isCorrect: true,
      },
      ...problem.distractors.map((d, i) => ({
        label: `Annual expense: $${d.annualExpense.toLocaleString()}, ` +
          `Accumulated (Year ${problem.yearToCalculate}): $${d.accumulated.toLocaleString()}, ` +
          `Book value: $${d.bookValue.toLocaleString()}`,
        isCorrect: false,
        distractorIndex: i,
        distractorLabel: d.label,
      })),
    ]
    return opts.sort(() => Math.random() - 0.5)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.id])

  const handleSubmit = useCallback(() => {
    const selectedOption = shuffledOptions.find(o => o.label === userAnswer)
    const isCorrect = selectedOption?.isCorrect ?? false
    if (!selectedOption) return

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
        activityId: activity.id ?? 'straight-line-mastery',
        mode: 'independent_practice',
        answers: {
          selectedAnswer: userAnswer,
          isCorrect,
          annualExpense: problem.correctAnnualExpense,
          accumulated: problem.correctAccumulated,
          bookValue: problem.correctBookValue,
        },
        parts: [
          createSimulationPart('annual-expense', problem.correctAnnualExpense, { isCorrect }),
          createSimulationPart('accumulated-depreciation', problem.correctAccumulated, { isCorrect }),
          createSimulationPart('book-value', problem.correctBookValue, { isCorrect }),
        ],
        artifact: {
          assetName: problem.assetName,
          cost: problem.cost,
          salvageValue: problem.salvageValue,
          usefulLife: problem.usefulLife,
          yearToCalculate: problem.yearToCalculate,
          method: 'straight-line',
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
  }, [])

  const handleShowExample = useCallback(() => {
    setShowWorkedExample(true)
  }, [])

  const progressToMastery = (consecutiveCorrect / masteryTarget) * 100
  const selectedDistractorData = problem.distractors[selectedDistractor ?? -1]

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Straight-Line Depreciation — Schedule Practice
        </CardTitle>
        <CardDescription className="text-blue-600">
          Calculate the annual expense, accumulated depreciation, and book value for a given year. Target: {masteryTarget} consecutive correct answers.
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
              TechStart purchased a {problem.assetName} for ${problem.cost.toLocaleString()}.
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Cost</p>
                <p className="text-lg font-bold text-gray-800">${problem.cost.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-600 uppercase">Useful Life</p>
                <p className="text-lg font-bold text-blue-800">{problem.usefulLife} yrs</p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <p className="text-xs text-green-600 uppercase">Salvage Value</p>
                <p className="text-lg font-bold text-green-800">${problem.salvageValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded">
              <p className="text-sm text-amber-800 font-medium">
                Calculate depreciation for Year {problem.yearToCalculate} using the straight-line method.
              </p>
            </div>

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
                  New Numbers
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
                <p className="font-semibold text-green-800">Correct! Here is the breakdown:</p>
                <div className="mt-2 bg-white p-3 rounded border border-green-200 space-y-1">
                  <p className="text-sm text-green-700">
                    <strong>Depreciable base:</strong> ${problem.cost.toLocaleString()} − ${problem.salvageValue.toLocaleString()} = ${(problem.cost - problem.salvageValue).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Annual expense:</strong> ${(problem.cost - problem.salvageValue).toLocaleString()} ÷ {problem.usefulLife} yrs = ${problem.correctAnnualExpense.toLocaleString()}/yr
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Accumulated (Year {problem.yearToCalculate}):</strong> ${problem.correctAnnualExpense.toLocaleString()} × {problem.yearToCalculate} = ${problem.correctAccumulated.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Book value:</strong> ${problem.cost.toLocaleString()} − ${problem.correctAccumulated.toLocaleString()} = ${problem.correctBookValue.toLocaleString()}
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
                <div className="mt-2 bg-white p-3 rounded border border-red-200 space-y-1">
                  <p className="text-sm text-red-700">
                    <strong>Depreciable base:</strong> ${problem.cost.toLocaleString()} − ${problem.salvageValue.toLocaleString()} = ${(problem.cost - problem.salvageValue).toLocaleString()}
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Annual expense:</strong> ${(problem.cost - problem.salvageValue).toLocaleString()} ÷ {problem.usefulLife} yrs = ${problem.correctAnnualExpense.toLocaleString()}/yr
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Accumulated (Year {problem.yearToCalculate}):</strong> ${problem.correctAnnualExpense.toLocaleString()} × {problem.yearToCalculate} = ${problem.correctAccumulated.toLocaleString()}
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Book value:</strong> ${problem.cost.toLocaleString()} − ${problem.correctAccumulated.toLocaleString()} = ${problem.correctBookValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showWorkedExample && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Straight-Line Formula</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Step 1:</strong> Find the depreciable base = Cost − Salvage Value</p>
              <p><strong>Step 2:</strong> Divide by useful life = Annual Depreciation Expense</p>
              <p><strong>Step 3:</strong> Multiply by the year number = Accumulated Depreciation</p>
              <p><strong>Step 4:</strong> Subtract accumulated from cost = Book Value</p>
              <p className="pt-2 font-medium text-blue-800">
                The annual expense stays the same every year under straight-line depreciation.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h4 className="font-semibold text-green-800 mb-1">Key Reminders</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Always subtract salvage value before dividing</li>
              <li>Annual expense is the same every year</li>
              <li>Accumulated depreciation grows each year</li>
              <li>Book value shrinks each year</li>
            </ul>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <h4 className="font-semibold text-red-800 mb-1">Common Mistakes</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Forgetting to subtract salvage value</li>
              <li>Dividing cost by the wrong number of years</li>
              <li>Confusing accumulated depreciation with book value</li>
              <li>Changing the annual expense each year</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
