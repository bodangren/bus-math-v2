'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, RefreshCw, HelpCircle, Target, Calculator } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface BreakEvenProblem {
  id: string
  productName: string
  fixedCosts: number
  variableCostPerUnit: number
  sellingPricePerUnit: number
  correctBreakEvenUnits: number
  correctBreakEvenDollars: number
  distractors: {
    breakEvenUnits: number
    breakEvenDollars: number
    label: string
  }[]
}

const productPool = [
  { name: 'custom t-shirt', fixedRange: [500, 2000], variableRange: [3, 8], sellingRange: [15, 30] },
  { name: 'handmade candle', fixedRange: [200, 800], variableRange: [2, 5], sellingRange: [10, 20] },
  { name: 'art print', fixedRange: [300, 1200], variableRange: [1, 4], sellingRange: [8, 18] },
  { name: 'phone case', fixedRange: [800, 3000], variableRange: [2, 6], sellingRange: [12, 25] },
  { name: 'water bottle', fixedRange: [600, 2500], variableRange: [3, 7], sellingRange: [15, 28] },
  { name: 'notebook set', fixedRange: [400, 1500], variableRange: [2, 5], sellingRange: [10, 22] },
  { name: 'keychain', fixedRange: [150, 600], variableRange: [0.5, 2], sellingRange: [5, 12] },
  { name: 'sticker pack', fixedRange: [100, 500], variableRange: [0.3, 1.5], sellingRange: [4, 10] },
]

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateProblem(): BreakEvenProblem {
  const product = productPool[Math.floor(Math.random() * productPool.length)]
  const fixedCosts = randInt(product.fixedRange[0], product.fixedRange[1])
  const variableCostPerUnit = randInt(product.variableRange[0] * 100, product.variableRange[1] * 100) / 100
  const sellingPricePerUnit = randInt(product.sellingRange[0] * 100, product.sellingRange[1] * 100) / 100
  if (sellingPricePerUnit <= variableCostPerUnit) return generateProblem()

  const contributionMarginPerUnit = sellingPricePerUnit - variableCostPerUnit
  const correctBreakEvenUnits = Math.ceil(fixedCosts / contributionMarginPerUnit)
  const correctBreakEvenDollars = correctBreakEvenUnits * sellingPricePerUnit

  const wrongMethods: { breakEvenUnits: number; breakEvenDollars: number; label: string }[] = []

  const wrongUnits1 = Math.ceil(fixedCosts / sellingPricePerUnit)
  const wrongDollars1 = wrongUnits1 * sellingPricePerUnit
  wrongMethods.push({
    breakEvenUnits: wrongUnits1,
    breakEvenDollars: wrongDollars1,
    label: 'Forgot to subtract variable costs from selling price (used selling price instead of contribution margin)',
  })

  const wrongUnits2 = Math.ceil((fixedCosts + variableCostPerUnit) / sellingPricePerUnit)
  const wrongDollars2 = wrongUnits2 * sellingPricePerUnit
  wrongMethods.push({
    breakEvenUnits: wrongUnits2,
    breakEvenDollars: wrongDollars2,
    label: 'Treated variable cost as a one-time fixed cost instead of per-unit',
  })

  if (variableCostPerUnit > 0) {
    const wrongUnits3 = Math.ceil(fixedCosts / variableCostPerUnit)
    const wrongDollars3 = wrongUnits3 * sellingPricePerUnit
    wrongMethods.push({
      breakEvenUnits: wrongUnits3,
      breakEvenDollars: wrongDollars3,
      label: 'Mixed up variable cost and contribution margin entirely',
    })
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    productName: product.name,
    fixedCosts,
    variableCostPerUnit,
    sellingPricePerUnit,
    correctBreakEvenUnits,
    correctBreakEvenDollars,
    distractors: wrongMethods,
  }
}

export interface BreakEvenMasteryProps {
  activity: {
    id?: string
    props?: {
      masteryThreshold?: number
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function BreakEvenMastery({ activity, onSubmit, onComplete }: BreakEvenMasteryProps) {
  const masteryTarget = activity.props?.masteryThreshold ?? 5
  const [problem, setProblem] = useState<BreakEvenProblem>(generateProblem)
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
        label: `Break-Even: ${problem.correctBreakEvenUnits} units ($${problem.correctBreakEvenDollars.toFixed(2)})`,
        isCorrect: true,
      },
      ...problem.distractors.map((d, i) => ({
        label: `Break-Even: ${d.breakEvenUnits} units ($${d.breakEvenDollars.toFixed(2)})`,
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
        activityId: activity.id ?? 'break-even-mastery',
        mode: 'independent_practice',
        answers: {
          selectedAnswer: userAnswer,
          isCorrect,
          breakEvenUnits: problem.correctBreakEvenUnits,
          breakEvenDollars: problem.correctBreakEvenDollars,
        },
        parts: [
          createSimulationPart('break-even-units', problem.correctBreakEvenUnits, { isCorrect }),
          createSimulationPart('break-even-dollars', problem.correctBreakEvenDollars, { isCorrect }),
        ],
        artifact: {
          productName: problem.productName,
          fixedCosts: problem.fixedCosts,
          variableCostPerUnit: problem.variableCostPerUnit,
          sellingPricePerUnit: problem.sellingPricePerUnit,
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
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Break-Even Mastery
        </CardTitle>
        <CardDescription className="text-blue-600">
          Calculate break-even point in units and dollars. Target: {masteryTarget} consecutive correct answers.
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
              EcoPrint wants to sell {problem.productName}s.
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Fixed Costs</p>
                <p className="text-lg font-bold text-gray-800">${problem.fixedCosts.toFixed(2)}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-600 uppercase">Variable Cost/Unit</p>
                <p className="text-lg font-bold text-blue-800">${problem.variableCostPerUnit.toFixed(2)}</p>
              </div>
              <div className="bg-indigo-100 rounded-lg p-3">
                <p className="text-xs text-indigo-600 uppercase">Selling Price/Unit</p>
                <p className="text-lg font-bold text-indigo-800">${problem.sellingPricePerUnit.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded">
              <p className="text-sm text-indigo-800 font-medium">
                Calculate the break-even point in units and total dollars.
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
                    <strong>Contribution Margin per Unit:</strong> ${problem.sellingPricePerUnit.toFixed(2)} − ${problem.variableCostPerUnit.toFixed(2)} = ${(problem.sellingPricePerUnit - problem.variableCostPerUnit).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Break-Even Units:</strong> ${problem.fixedCosts.toFixed(2)} ÷ ${(problem.sellingPricePerUnit - problem.variableCostPerUnit).toFixed(2)} = {problem.correctBreakEvenUnits} units (rounded up)
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Break-Even Dollars:</strong> {problem.correctBreakEvenUnits} × ${problem.sellingPricePerUnit.toFixed(2)} = ${problem.correctBreakEvenDollars.toFixed(2)}
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
                    <strong>Contribution Margin per Unit:</strong> ${problem.sellingPricePerUnit.toFixed(2)} − ${problem.variableCostPerUnit.toFixed(2)} = ${(problem.sellingPricePerUnit - problem.variableCostPerUnit).toFixed(2)}
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Break-Even Units:</strong> ${problem.fixedCosts.toFixed(2)} ÷ ${(problem.sellingPricePerUnit - problem.variableCostPerUnit).toFixed(2)} = {problem.correctBreakEvenUnits} units (rounded up)
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Break-Even Dollars:</strong> {problem.correctBreakEvenUnits} × ${problem.sellingPricePerUnit.toFixed(2)} = ${problem.correctBreakEvenDollars.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showWorkedExample && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Break-Even Formula</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Step 1:</strong> Calculate contribution margin per unit = Selling Price − Variable Cost per Unit</p>
              <p><strong>Step 2:</strong> Break-Even Units = Fixed Costs ÷ Contribution Margin per Unit (round up if needed)</p>
              <p><strong>Step 3:</strong> Break-Even Dollars = Break-Even Units × Selling Price per Unit</p>
              <p className="pt-2 font-medium text-blue-800">
                Contribution margin covers fixed costs first, then becomes profit!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h4 className="font-semibold text-green-800 mb-1">Key Reminders</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Always calculate contribution margin first</li>
              <li>Break-even units use fixed costs as numerator</li>
              <li>Variable costs are per unit, not total</li>
            </ul>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <h4 className="font-semibold text-red-800 mb-1">Common Mistakes</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Forgetting to subtract variable costs from selling price</li>
              <li>Treating variable cost as a one-time fixed cost</li>
              <li>Mixing up variable cost and contribution margin entirely</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
