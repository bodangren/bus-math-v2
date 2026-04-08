'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

export interface ProfitCalculatorProps {
  activity: {
    id?: string
    props?: {
      initialRevenue?: number
      initialExpenses?: number
      allowNegative?: boolean
      currency?: string
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function ProfitCalculator({ activity, onSubmit, onComplete }: ProfitCalculatorProps) {
  const {
    initialRevenue = 100000,
    initialExpenses = 75000,
    currency = 'USD',
  } = activity.props || {}

  const [revenue, setRevenue] = useState<string>(initialRevenue.toString())
  const [expenses, setExpenses] = useState<string>(initialExpenses.toString())
  const [completed, setCompleted] = useState(false)
  const submittedRef = useRef(false)

  const numRevenue = parseFloat(revenue) || 0
  const numExpenses = parseFloat(expenses) || 0
  const profit = numRevenue - numExpenses
  const profitMargin = numRevenue > 0 ? (profit / numRevenue) * 100 : 0
  const isProfitable = profit > 0

  const handleComplete = useCallback(() => {
    if (submittedRef.current) return
    submittedRef.current = true
    setCompleted(true)
    onSubmit?.(
      buildSimulationSubmissionEnvelope({
        activityId: activity.id ?? 'profit-calculator',
        mode: 'independent_practice',
        answers: {
          revenue: numRevenue,
          expenses: numExpenses,
          profit,
          profitMargin,
          isProfitable,
        },
        parts: [
          createSimulationPart('revenue', numRevenue),
          createSimulationPart('expenses', numExpenses),
          createSimulationPart('profit', profit),
          createSimulationPart('profit-margin', profitMargin),
        ],
        artifact: {
          currency,
          initialRevenue,
          initialExpenses,
        },
      }),
    )
    onComplete?.()
  }, [numRevenue, numExpenses, profit, profitMargin, isProfitable, currency, initialRevenue, initialExpenses, onSubmit, onComplete, activity.id])

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardHeader>
          <CardTitle className="text-xl text-emerald-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Profit Calculator
          </CardTitle>
          <CardDescription className="text-emerald-600">
            Calculate profit and profit margin from revenue and expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="revenue">Total Revenue</Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <Input
                    id="revenue"
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    disabled={completed}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenses">Total Expenses</Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <Input
                    id="expenses"
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    disabled={completed}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-emerald-200">
                <p className="text-sm text-gray-500">Net Profit</p>
                <p className={`text-3xl font-bold flex items-center gap-2 ${isProfitable ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isProfitable ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                  ${profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-emerald-200">
                <p className="text-sm text-gray-500">Profit Margin</p>
                <p className={`text-3xl font-bold ${isProfitable ? 'text-emerald-700' : 'text-red-700'}`}>
                  {profitMargin.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button onClick={handleComplete} disabled={completed} className="bg-emerald-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Calculation
            </Button>
          </div>
          {completed && (
            <div className="mt-4 bg-green-50 p-3 rounded border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                Calculation complete!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-4 rounded border border-emerald-200">
          <h4 className="font-semibold text-emerald-800 mb-2">Key Formulas</h4>
          <ul className="text-sm text-emerald-700 space-y-1">
            <li><strong>Net Profit:</strong> Revenue − Expenses</li>
            <li><strong>Profit Margin:</strong> (Profit ÷ Revenue) × 100</li>
          </ul>
        </div>
        <div className="bg-slate-50 p-4 rounded border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-2">What This Means</h4>
          <p className="text-sm text-slate-700">
            {isProfitable
              ? 'Your business is making money! The profit margin shows how much of each revenue dollar remains as profit.'
              : 'Your expenses exceed your revenue. Consider increasing revenue or reducing expenses to achieve profitability.'}
          </p>
        </div>
      </div>
    </div>
  )
}
