'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, RefreshCw, HelpCircle, Target, Calculator } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface PurchaseScenario {
  id: string
  description: string
  cost: number
  usefulLife: number
  salvageValue: number
  isCapital: boolean
  reason: string
  distractorReason: string
}

const capitalItems = [
  { desc: 'commercial delivery van', costRange: [25000, 45000], lifeRange: [5, 10], salvageRange: [2000, 8000], reason: 'A vehicle provides value for many years and should be capitalized as a long-term asset.' },
  { desc: 'industrial oven for a bakery', costRange: [8000, 20000], lifeRange: [7, 15], salvageRange: [500, 2000], reason: 'Industrial equipment lasts for many years and should be capitalized.' },
  { desc: 'office building', costRange: [200000, 500000], lifeRange: [25, 40], salvageRange: [20000, 80000], reason: 'Real estate is a long-term asset that provides value for decades.' },
  { desc: 'commercial 3D printer', costRange: [10000, 30000], lifeRange: [5, 8], salvageRange: [1000, 5000], reason: 'Expensive equipment that lasts multiple years should be capitalized.' },
  { desc: 'warehouse shelving system', costRange: [5000, 15000], lifeRange: [10, 20], salvageRange: [200, 1000], reason: 'Shelving systems are long-term improvements that should be capitalized.' },
  { desc: 'company laptop computers', costRange: [1200, 3000], lifeRange: [3, 5], salvageRange: [100, 500], reason: 'Computers are long-term assets that provide value over multiple years.' },
]

const expenseItems = [
  { desc: 'monthly office rent', costRange: [1500, 5000], reason: 'Rent is a recurring operating expense that is used up within the period.' },
  { desc: 'printer paper and ink', costRange: [50, 200], reason: 'Office supplies are consumed quickly and should be expensed immediately.' },
  { desc: 'monthly internet service', costRange: [80, 200], reason: 'Utilities are period costs that are used up within the month.' },
  { desc: 'employee training workshop', costRange: [500, 2000], reason: 'Training costs are period expenses, not long-term assets.' },
  { desc: 'routine machine maintenance', costRange: [200, 1000], reason: 'Repairs and maintenance keep assets running but do not extend useful life — they are expensed.' },
  { desc: 'monthly software subscription', costRange: [30, 150], reason: 'Subscription fees are period expenses, not capital assets.' },
]

function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }

function generateScenario(): PurchaseScenario {
  const isCapital = Math.random() > 0.45
  if (isCapital) {
    const item = pickRandom(capitalItems)
    const cost = randInt(item.costRange[0], item.costRange[1])
    const usefulLife = randInt(item.lifeRange[0], item.lifeRange[1])
    const salvageValue = randInt(item.salvageRange[0], item.salvageRange[1])
    return {
      id: Math.random().toString(36).substr(2, 9),
      description: `TechStart purchases a ${item.desc} for $${cost.toLocaleString()}.`,
      cost, usefulLife, salvageValue, isCapital: true,
      reason: item.reason,
      distractorReason: `Some might think this should be expensed. But ${item.desc.toLowerCase()} provides value for ${item.lifeRange[0]}+ years, so it must be capitalized.`,
    }
  } else {
    const item = pickRandom(expenseItems)
    const cost = randInt(item.costRange[0], item.costRange[1])
    return {
      id: Math.random().toString(36).substr(2, 9),
      description: `TechStart pays $${cost.toLocaleString()} for ${item.desc}.`,
      cost, usefulLife: 0, salvageValue: 0, isCapital: false,
      reason: item.reason,
      distractorReason: `Some might think this should be capitalized. But ${item.desc.toLowerCase()} is used up within the current period, so it must be expensed.`,
    }
  }
}

export interface CapitalizationExpenseMasteryProps {
  activity: { id?: string; props?: { masteryThreshold?: number } }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function CapitalizationExpenseMastery({ activity, onSubmit, onComplete }: CapitalizationExpenseMasteryProps) {
  const masteryTarget = activity.props?.masteryThreshold ?? 5
  const [scenario, setScenario] = useState<PurchaseScenario>(generateScenario)
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
    const isCorrect = userAnswer === (scenario.isCapital ? 'capitalize' : 'expense')
    submittedRef.current = true
    setCorrect(isCorrect)
    setSubmitted(true)
    if (isCorrect) { setConsecutiveCorrect(p => p + 1); setStreak(p => p + 1) } else { setConsecutiveCorrect(0) }

    try {
      onSubmit?.(
        buildSimulationSubmissionEnvelope({
          activityId: activity.id ?? 'capitalization-expense-mastery',
          mode: 'independent_practice',
          answers: { selectedAnswer: userAnswer, isCorrect, correctClassification: scenario.isCapital ? 'capitalize' : 'expense' },
          parts: [createSimulationPart('classification', scenario.isCapital ? 'capitalize' : 'expense', { isCorrect })],
          artifact: { description: scenario.description, cost: scenario.cost, isCapital: scenario.isCapital, reason: scenario.reason },
        }),
      )
    } catch (err) {
      console.error('CapitalizationExpenseMastery submission failed:', err)
      submittedRef.current = false
      setSubmitted(false)
      setCorrect(null)
    }
  }, [userAnswer, scenario, onSubmit, activity.id])

  const handleNewScenario = useCallback(() => {
    setScenario(generateScenario()); setUserAnswer(''); setSubmitted(false); setCorrect(null); setShowWorkedExample(false); submittedRef.current = false
  }, [])

  const progressToMastery = (consecutiveCorrect / masteryTarget) * 100

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="text-xl text-amber-800 flex items-center gap-2">
          <Target className="h-5 w-5" />Capitalize or Expense? — Classification Practice
        </CardTitle>
        <CardDescription className="text-amber-600">
          Decide whether each purchase should be capitalized as an asset or expensed immediately. Target: {masteryTarget} consecutive correct answers.
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

        <div className="bg-white p-6 rounded-lg border border-amber-200 space-y-4">
          <p className="text-lg text-gray-800 font-medium">{scenario.description}</p>
          {scenario.isCapital && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-100 rounded-lg p-3"><p className="text-xs text-gray-500 uppercase">Cost</p><p className="text-lg font-bold">${scenario.cost.toLocaleString()}</p></div>
              <div className="bg-amber-100 rounded-lg p-3"><p className="text-xs text-amber-600 uppercase">Useful Life</p><p className="text-lg font-bold text-amber-800">{scenario.usefulLife} yrs</p></div>
              <div className="bg-green-100 rounded-lg p-3"><p className="text-xs text-green-600 uppercase">Salvage</p><p className="text-lg font-bold text-green-800">${scenario.salvageValue.toLocaleString()}</p></div>
            </div>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={() => setUserAnswer('capitalize')} variant={userAnswer === 'capitalize' ? 'default' : 'outline'}
              className={`min-w-[140px] ${userAnswer === 'capitalize' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700'}`} disabled={submitted}>Capitalize (Asset)</Button>
            <Button onClick={() => setUserAnswer('expense')} variant={userAnswer === 'expense' ? 'default' : 'outline'}
              className={`min-w-[140px] ${userAnswer === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'border-red-300 text-red-700'}`} disabled={submitted}>Expense Now</Button>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            {!submitted ? (
              <>
                <Button onClick={handleSubmit} disabled={!userAnswer} className="bg-amber-600 hover:bg-amber-700">Check Answer</Button>
                <Button variant="outline" onClick={() => setShowWorkedExample(true)} className="border-amber-300 text-amber-700"><HelpCircle className="h-4 w-4 mr-1" />Show Example</Button>
              </>
            ) : (
              <Button onClick={handleNewScenario} className="bg-green-600 hover:bg-green-700"><RefreshCw className="h-4 w-4 mr-1" />New Numbers</Button>
            )}
          </div>
        </div>

        {submitted && (
          <div className={`p-4 rounded-lg border-2 ${correct ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
            <div className="flex items-start gap-3">
              {correct ? <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" /> : <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />}
              <div className="flex-1">
                <p className={`font-semibold ${correct ? 'text-green-800' : 'text-red-800'}`}>
                  {correct ? `Correct! This should be ${scenario.isCapital ? 'capitalized' : 'expensed'}.` : `Not quite. This should be ${scenario.isCapital ? 'capitalized' : 'expensed'}.`}
                </p>
                <p className={`mt-2 text-sm ${correct ? 'text-green-700' : 'text-red-700'}`}>{scenario.reason}</p>
                {!correct && (
                  <div className="mt-3 bg-white p-3 rounded border border-red-200">
                    <p className="font-medium text-red-800 flex items-center gap-1"><Calculator className="h-4 w-4" />Why the confusion?</p>
                    <p className="mt-1 text-sm text-red-700">{scenario.distractorReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showWorkedExample && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">How to Decide</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Question 1:</strong> Will this purchase provide value for more than one year?</p>
              <p><strong>Question 2:</strong> Is the cost significant enough to track separately?</p>
              <p className="pt-2 font-medium text-blue-800">If YES to both → <strong>Capitalize</strong>. If NO to either → <strong>Expense</strong>.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h4 className="font-semibold text-green-800 mb-1">Capitalize When...</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Item lasts more than 1 year</li><li>Cost is significant</li><li>Equipment, vehicles, buildings</li>
            </ul>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <h4 className="font-semibold text-red-800 mb-1">Expense When...</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Used up within current period</li><li>Routine operating cost</li><li>Rent, utilities, supplies</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
