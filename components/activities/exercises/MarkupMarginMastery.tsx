'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, RefreshCw, HelpCircle, Target, Calculator } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface MarkupMarginProblem {
  id: string
  productName: string
  costPrice: number
  sellingPrice: number
  correctMarkup: number
  correctMargin: number
  distractors: {
    markup: number
    margin: number
    label: string
  }[]
}

const productPool = [
  { name: 'laptop sleeve', costRange: [8, 15], sellingRange: [15, 30] },
  { name: 'custom notebook', costRange: [3, 7], sellingRange: [8, 18] },
  { name: 'coffee mug', costRange: [2, 5], sellingRange: [6, 12] },
  { name: 'desk lamp', costRange: [12, 25], sellingRange: [25, 50] },
  { name: 'wireless mouse', costRange: [6, 12], sellingRange: [15, 30] },
  { name: 'branded pen', costRange: [0.5, 2], sellingRange: [3, 8] },
  { name: 'USB drive', costRange: [4, 10], sellingRange: [10, 22] },
  { name: 'phone case', costRange: [3, 8], sellingRange: [10, 20] },
]

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function roundToNearestPercent(val: number): number {
  return Math.round(val * 100)
}

function generateProblem(): MarkupMarginProblem {
  const product = productPool[Math.floor(Math.random() * productPool.length)]
  const costPrice = randInt(product.costRange[0] * 100, product.costRange[1] * 100) / 100
  const sellingPrice = randInt(product.sellingRange[0] * 100, product.sellingRange[1] * 100) / 100
  if (sellingPrice <= costPrice) return generateProblem()

  const correctMarkup = roundToNearestPercent((sellingPrice - costPrice) / costPrice)
  const correctMargin = roundToNearestPercent((sellingPrice - costPrice) / sellingPrice)

  const wrongMethods: { markup: number; margin: number; label: string }[] = []

  const wrongMarkup1 = roundToNearestPercent((sellingPrice - costPrice) / sellingPrice)
  const wrongMargin1 = roundToNearestPercent((sellingPrice - costPrice) / costPrice)
  wrongMethods.push({
    markup: wrongMarkup1,
    margin: wrongMargin1,
    label: 'Confused markup with margin (swapped denominators)',
  })

  const wrongMarkup2 = roundToNearestPercent(sellingPrice / costPrice)
  const wrongMargin2 = roundToNearestPercent(costPrice / sellingPrice)
  wrongMethods.push({
    markup: wrongMarkup2,
    margin: wrongMargin2,
    label: 'Forgot to subtract cost from selling price first',
  })

  const wrongMarkup3 = roundToNearestPercent(costPrice / sellingPrice)
  const wrongMargin3 = roundToNearestPercent(sellingPrice / costPrice)
  wrongMethods.push({
    markup: wrongMarkup3,
    margin: wrongMargin3,
    label: 'Divided in the wrong direction entirely',
  })

  return {
    id: Math.random().toString(36).substr(2, 9),
    productName: product.name,
    costPrice,
    sellingPrice,
    correctMarkup,
    correctMargin,
    distractors: wrongMethods,
  }
}

export interface MarkupMarginMasteryProps {
  activity: {
    id?: string
    props?: {
      masteryThreshold?: number
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function MarkupMarginMastery({ activity, onSubmit, onComplete }: MarkupMarginMasteryProps) {
  const masteryTarget = activity.props?.masteryThreshold ?? 5
  const [problem, setProblem] = useState<MarkupMarginProblem>(generateProblem)
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
        label: `Markup: ${problem.correctMarkup}%, Margin: ${problem.correctMargin}%`,
        isCorrect: true,
      },
      ...problem.distractors.map((d, i) => ({
        label: `Markup: ${d.markup}%, Margin: ${d.margin}%`,
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
        activityId: activity.id ?? 'markup-margin-mastery',
        mode: 'independent_practice',
        answers: {
          selectedAnswer: userAnswer,
          isCorrect,
          markup: problem.correctMarkup,
          margin: problem.correctMargin,
        },
        parts: [
          createSimulationPart('markup-percentage', problem.correctMarkup, { isCorrect }),
          createSimulationPart('margin-percentage', problem.correctMargin, { isCorrect }),
        ],
        artifact: {
          productName: problem.productName,
          costPrice: problem.costPrice,
          sellingPrice: problem.sellingPrice,
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
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader>
        <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Markup & Margin Mastery
        </CardTitle>
        <CardDescription className="text-orange-600">
          Calculate markup percentage and margin percentage. Target: {masteryTarget} consecutive correct answers.
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

        <div className="bg-white p-6 rounded-lg border border-orange-200">
          <div className="space-y-4">
            <p className="text-lg text-gray-800 font-medium">
              TechStart sells a {problem.productName} for ${problem.sellingPrice.toFixed(2)}.
            </p>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Cost Price</p>
                <p className="text-lg font-bold text-gray-800">${problem.costPrice.toFixed(2)}</p>
              </div>
              <div className="bg-orange-100 rounded-lg p-3">
                <p className="text-xs text-orange-600 uppercase">Selling Price</p>
                <p className="text-lg font-bold text-orange-800">${problem.sellingPrice.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded">
              <p className="text-sm text-amber-800 font-medium">
                Calculate the markup percentage and margin percentage for this product.
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
                        : 'border-orange-500 bg-orange-50'
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
                  <Button onClick={handleSubmit} disabled={!userAnswer} className="bg-orange-600 hover:bg-orange-700">
                    Check Answer
                  </Button>
                  <Button variant="outline" onClick={handleShowExample} className="border-orange-300 text-orange-700">
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
                    <strong>Gross Profit:</strong> ${problem.sellingPrice.toFixed(2)} − ${problem.costPrice.toFixed(2)} = ${(problem.sellingPrice - problem.costPrice).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Markup:</strong> (${(problem.sellingPrice - problem.costPrice).toFixed(2)} ÷ ${problem.costPrice.toFixed(2)}) × 100 = {problem.correctMarkup}%
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Margin:</strong> (${(problem.sellingPrice - problem.costPrice).toFixed(2)} ÷ ${problem.sellingPrice.toFixed(2)}) × 100 = {problem.correctMargin}%
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
                    <strong>Gross Profit:</strong> ${problem.sellingPrice.toFixed(2)} − ${problem.costPrice.toFixed(2)} = ${(problem.sellingPrice - problem.costPrice).toFixed(2)}
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Markup:</strong> (${(problem.sellingPrice - problem.costPrice).toFixed(2)} ÷ ${problem.costPrice.toFixed(2)}) × 100 = {problem.correctMarkup}%
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Margin:</strong> (${(problem.sellingPrice - problem.costPrice).toFixed(2)} ÷ ${problem.sellingPrice.toFixed(2)}) × 100 = {problem.correctMargin}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showWorkedExample && (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Markup vs Margin Formulas</h4>
            <div className="text-sm text-orange-700 space-y-2">
              <p><strong>Step 1:</strong> Calculate gross profit = Selling Price − Cost Price</p>
              <p><strong>Step 2 (Markup):</strong> (Gross Profit ÷ Cost Price) × 100 (how much you add to cost)</p>
              <p><strong>Step 3 (Margin):</strong> (Gross Profit ÷ Selling Price) × 100 (how much of revenue is profit)</p>
              <p className="pt-2 font-medium text-orange-800">
                Markup is always higher than margin for the same product!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h4 className="font-semibold text-green-800 mb-1">Key Reminders</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Markup uses cost price as the denominator</li>
              <li>Margin uses selling price as the denominator</li>
              <li>Always subtract cost from selling price first</li>
            </ul>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <h4 className="font-semibold text-red-800 mb-1">Common Mistakes</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Confusing markup and margin (swapped denominators)</li>
              <li>Forgetting to subtract cost from selling price</li>
              <li>Dividing in the wrong direction entirely</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
