'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, RefreshCw, HelpCircle, Target } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface DDBProblem {
  id: string
  assetName: string
  cost: number
  salvageValue: number
  usefulLife: number
  yearToCalculate: number
  slRate: number
  ddbRate: number
  correctDDBExpense: number
  correctSLExpense: number
  correctBookValue: number
  correctAccumulated: number
  method: 'ddb' | 'sl' | 'compare'
  distractors: { label: string; isCorrect: boolean }[]
}

const assetPool = [
  { name: 'delivery van', costRange: [28000, 45000], lifeRange: [5, 8], salvageRange: [3000, 8000] },
  { name: 'CNC machining center', costRange: [50000, 100000], lifeRange: [10, 15], salvageRange: [5000, 15000] },
  { name: 'commercial oven', costRange: [12000, 25000], lifeRange: [7, 12], salvageRange: [1000, 3000] },
  { name: 'packaging machine', costRange: [20000, 40000], lifeRange: [8, 12], salvageRange: [2000, 5000] },
  { name: 'fleet of laptops', costRange: [5000, 12000], lifeRange: [3, 5], salvageRange: [500, 1500] },
]

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function computeDDBSchedule(cost: number, salvage: number, life: number) {
  if (life <= 0) return []
  const slRate = 1 / life
  const ddbRate = 2 * slRate
  const schedule: { year: number; expense: number; accumulated: number; bookValue: number }[] = []
  let bookValue = cost
  let accumulated = 0
  for (let year = 1; year <= life; year++) {
    let expense = Math.round(bookValue * ddbRate)
    if (bookValue - expense < salvage) {
      expense = Math.max(0, Math.round(bookValue - salvage))
    }
    accumulated += expense
    bookValue -= expense
    schedule.push({ year, expense, accumulated, bookValue })
  }
  return schedule
}

function computeSLSchedule(cost: number, salvage: number, life: number) {
  if (life <= 0) return []
  const annualExpense = Math.round((cost - salvage) / life)
  return Array.from({ length: life }, (_, i) => ({
    year: i + 1,
    expense: annualExpense,
    accumulated: annualExpense * (i + 1),
    bookValue: cost - annualExpense * (i + 1),
  }))
}

function generateProblem(): DDBProblem {
  const asset = assetPool[Math.floor(Math.random() * assetPool.length)]
  const cost = randInt(asset.costRange[0], asset.costRange[1])
  const usefulLife = randInt(asset.lifeRange[0], asset.lifeRange[1])
  const salvageValue = randInt(asset.salvageRange[0], asset.salvageRange[1])
  const yearToCalculate = randInt(1, usefulLife)

  const ddbSchedule = computeDDBSchedule(cost, salvageValue, usefulLife)
  const slSchedule = computeSLSchedule(cost, salvageValue, usefulLife)
  const ddbRow = ddbSchedule[yearToCalculate - 1]
  const slRow = slSchedule[yearToCalculate - 1]

  const methodRoll = Math.random()
  let method: 'ddb' | 'sl' | 'compare'
  let correctAnswer: string
  let distractors: { label: string; isCorrect: boolean }[]

  if (methodRoll < 0.4) {
    method = 'ddb'
    correctAnswer = `$${ddbRow.expense.toLocaleString()}`
    distractors = [
      { label: correctAnswer, isCorrect: true },
      { label: `$${slRow.expense.toLocaleString()} (straight-line amount)`, isCorrect: false },
      { label: `$${Math.round(cost / usefulLife).toLocaleString()} (cost ÷ life, ignoring salvage)`, isCorrect: false },
      { label: `$${Math.round((cost - salvageValue) / yearToCalculate).toLocaleString()} (divided by year number)`, isCorrect: false },
    ]
  } else if (methodRoll < 0.7) {
    method = 'compare'
    if (ddbRow.expense > slRow.expense) {
      correctAnswer = `DDB ($${ddbRow.expense.toLocaleString()}) is higher than SL ($${slRow.expense.toLocaleString()})`
    } else if (ddbRow.expense < slRow.expense) {
      correctAnswer = `SL ($${slRow.expense.toLocaleString()}) is higher than DDB ($${ddbRow.expense.toLocaleString()})`
    } else {
      correctAnswer = `Both methods record the same expense: $${ddbRow.expense.toLocaleString()}`
    }
    distractors = [
      { label: correctAnswer, isCorrect: true },
      { label: 'DDB is always higher in every year', isCorrect: false },
      { label: 'SL is always higher in every year', isCorrect: false },
      { label: 'Cannot determine without more information', isCorrect: false },
    ]
  } else {
    method = 'ddb'
    correctAnswer = `$${ddbRow.bookValue.toLocaleString()}`
    distractors = [
      { label: correctAnswer, isCorrect: true },
      { label: `$${slRow.bookValue.toLocaleString()} (straight-line book value)`, isCorrect: false },
      { label: `$${(cost - ddbRow.expense).toLocaleString()} (only one year of depreciation subtracted)`, isCorrect: false },
      { label: `$${ddbRow.accumulated.toLocaleString()} (this is accumulated, not book value)`, isCorrect: false },
    ]
  }

  distractors.sort(() => Math.random() - 0.5)

  return {
    id: Math.random().toString(36).substr(2, 9),
    assetName: asset.name, cost, salvageValue, usefulLife, yearToCalculate,
    slRate: 1 / usefulLife, ddbRate: 2 / usefulLife,
    correctDDBExpense: ddbRow.expense, correctSLExpense: slRow.expense,
    correctBookValue: ddbRow.bookValue, correctAccumulated: ddbRow.accumulated,
    method, distractors,
  }
}

export interface DDBComparisonMasteryProps {
  activity: { id?: string; props?: { masteryThreshold?: number } }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function DDBComparisonMastery({ activity, onSubmit, onComplete }: DDBComparisonMasteryProps) {
  const masteryTarget = activity.props?.masteryThreshold ?? 5
  const [problem, setProblem] = useState<DDBProblem>(generateProblem)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [streak, setStreak] = useState(0)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [showWorkedExample, setShowWorkedExample] = useState(false)
  const hasCompleted = useRef(false)
  const submittedRef = useRef(false)

  useEffect(() => {
    if (consecutiveCorrect >= masteryTarget && !hasCompleted.current) {
      hasCompleted.current = true
      onComplete?.()
    }
  }, [consecutiveCorrect, masteryTarget, onComplete])

  const handleSubmit = useCallback(() => {
    if (submittedRef.current) return
    const selectedOption = problem.distractors.find(o => o.label === userAnswer)
    const isCorrect = selectedOption?.isCorrect ?? false
    submittedRef.current = true
    setCorrect(isCorrect)
    setSubmitted(true)
    if (isCorrect) { setConsecutiveCorrect(p => p + 1); setStreak(p => p + 1) } else { setConsecutiveCorrect(0) }

    onSubmit?.(
      buildSimulationSubmissionEnvelope({
        activityId: activity.id ?? 'ddb-comparison-mastery',
        mode: 'independent_practice',
        answers: { selectedAnswer: userAnswer, isCorrect, ddbExpense: problem.correctDDBExpense, bookValue: problem.correctBookValue },
        parts: [createSimulationPart('ddb-expense', problem.correctDDBExpense, { isCorrect }), createSimulationPart('book-value', problem.correctBookValue, { isCorrect })],
        artifact: { assetName: problem.assetName, cost: problem.cost, salvageValue: problem.salvageValue, usefulLife: problem.usefulLife, year: problem.yearToCalculate, method: 'ddb' },
      }),
    )
  }, [userAnswer, problem, onSubmit, activity.id])

  const handleNewProblem = useCallback(() => {
    setProblem(generateProblem()); setUserAnswer(''); setSubmitted(false); setCorrect(null); setShowWorkedExample(false); submittedRef.current = false
  }, [])

  const ddbSchedule = useMemo(() => computeDDBSchedule(problem.cost, problem.salvageValue, problem.usefulLife), [problem.cost, problem.salvageValue, problem.usefulLife])
  const slSchedule = useMemo(() => computeSLSchedule(problem.cost, problem.salvageValue, problem.usefulLife), [problem.cost, problem.salvageValue, problem.usefulLife])
  const progressToMastery = (consecutiveCorrect / masteryTarget) * 100

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-orange-50">
      <CardHeader>
        <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
          <Target className="h-5 w-5" />DDB vs Straight-Line — Method Comparison Practice
        </CardTitle>
        <CardDescription className="text-purple-600">
          Calculate DDB depreciation and compare it with straight-line. Target: {masteryTarget} consecutive correct answers.
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
              <CheckCircle className="h-4 w-4" /><span className="font-medium">Mastery achieved!</span>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-purple-200 space-y-4">
          <p className="text-lg text-gray-800 font-medium">
            TechStart purchased a {problem.assetName} for ${problem.cost.toLocaleString()} with a {problem.usefulLife}-year life and ${problem.salvageValue.toLocaleString()} salvage value.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-100 rounded-lg p-3"><p className="text-xs text-gray-500 uppercase">Cost</p><p className="text-lg font-bold">${problem.cost.toLocaleString()}</p></div>
            <div className="bg-purple-100 rounded-lg p-3"><p className="text-xs text-purple-600 uppercase">Useful Life</p><p className="text-lg font-bold text-purple-800">{problem.usefulLife} yrs</p></div>
            <div className="bg-green-100 rounded-lg p-3"><p className="text-xs text-green-600 uppercase">Salvage</p><p className="text-lg font-bold text-green-800">${problem.salvageValue.toLocaleString()}</p></div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded">
            <p className="text-sm text-amber-800 font-medium">
              {problem.method === 'compare' ? `Compare Year ${problem.yearToCalculate} under both methods.` : `Calculate Year ${problem.yearToCalculate} using DDB.`}
            </p>
          </div>
          <div className="space-y-2">
            {problem.distractors.map((option, idx) => (
              <button key={idx} onClick={() => setUserAnswer(option.label)} disabled={submitted}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  userAnswer === option.label ? submitted ? option.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50' : 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                <p className="text-sm text-gray-800">{option.label}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-center pt-2">
            {!submitted ? (
              <>
                <Button onClick={handleSubmit} disabled={!userAnswer} className="bg-purple-600 hover:bg-purple-700">Check Answer</Button>
                <Button variant="outline" onClick={() => { setShowWorkedExample(true) }} className="border-purple-300 text-purple-700">
                  <HelpCircle className="h-4 w-4 mr-1" />Show Schedule
                </Button>
              </>
            ) : (
              <Button onClick={handleNewProblem} className="bg-green-600 hover:bg-green-700"><RefreshCw className="h-4 w-4 mr-1" />New Numbers</Button>
            )}
          </div>
        </div>

        {submitted && correct && (
          <div className="p-4 rounded-lg border-2 bg-green-50 border-green-400">
            <div className="flex items-start gap-3"><CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div><p className="font-semibold text-green-800">Correct!</p>
                <p className="text-sm text-green-700 mt-1">DDB Year {problem.yearToCalculate}: ${problem.correctDDBExpense.toLocaleString()} expense, ${problem.correctBookValue.toLocaleString()} book value</p>
              </div>
            </div>
          </div>
        )}

        {submitted && !correct && (
          <div className="p-4 rounded-lg border-2 bg-red-50 border-red-400">
            <div className="flex items-start gap-3"><XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <p className="font-semibold text-red-800">Not quite. Review the full schedule below.</p>
            </div>
          </div>
        )}

        {(showWorkedExample || (submitted && !correct)) && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">Full Schedule Comparison</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead><tr className="bg-gray-100"><th className="border p-2">Year</th><th className="border p-2">DDB Expense</th><th className="border p-2">DDB Book Value</th><th className="border p-2">SL Expense</th><th className="border p-2">SL Book Value</th></tr></thead>
                <tbody>
                  {ddbSchedule.map((row, i) => (
                    <tr key={row.year} className={row.year === problem.yearToCalculate ? 'bg-purple-100' : ''}>
                      <td className="border p-2 font-medium">Year {row.year}</td>
                      <td className="border p-2 text-right">${row.expense.toLocaleString()}</td>
                      <td className="border p-2 text-right">${row.bookValue.toLocaleString()}</td>
                      <td className="border p-2 text-right">${slSchedule[i].expense.toLocaleString()}</td>
                      <td className="border p-2 text-right">${slSchedule[i].bookValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-3 rounded border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-1">DDB Key Rules</h4>
            <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
              <li>Rate = 2 × (1 ÷ useful life)</li><li>Apply rate to beginning book value</li><li>Book value can never fall below salvage value</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-3 rounded border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-1">Common Mistakes</h4>
            <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
              <li>Subtracting salvage before applying DDB rate</li><li>Using straight-line rate instead of double rate</li><li>Letting book value fall below salvage</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
