'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lightbulb, TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface FinancialState {
  revenue: number
  costOfGoodsSold: number
  operatingExpenses: number
  dividends: number
}

const initialState: FinancialState = {
  revenue: 500000,
  costOfGoodsSold: 200000,
  operatingExpenses: 150000,
  dividends: 50000,
}

function calculateStatements(state: FinancialState) {
  const grossProfit = state.revenue - state.costOfGoodsSold
  const operatingIncome = grossProfit - state.operatingExpenses
  const netIncome = operatingIncome
  const retainedEarnings = netIncome - state.dividends

  return {
    incomeStatement: {
      revenue: state.revenue,
      costOfGoodsSold: state.costOfGoodsSold,
      grossProfit,
      operatingExpenses: state.operatingExpenses,
      operatingIncome,
      netIncome,
    },
    balanceSheet: {
      retainedEarnings,
      totalAssets: state.revenue,
      totalLiabilities: state.costOfGoodsSold + state.operatingExpenses,
      totalEquity: retainedEarnings,
    },
  }
}

export interface ChartLinkingSimulatorProps {
  activity: {
    id?: string
    props?: {
      masteryThreshold?: number
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function ChartLinkingSimulator({ activity, onSubmit, onComplete }: ChartLinkingSimulatorProps) {
  const [financialState, setFinancialState] = useState<FinancialState>(initialState)
  const [insights, setInsights] = useState<string[]>([])
  const [currentInsight, setCurrentInsight] = useState('')
  const [completed, setCompleted] = useState(false)
  const submittedRef = useRef(false)

  const statements = calculateStatements(financialState)

  const handleUpdate = useCallback((field: keyof FinancialState, value: number) => {
    setFinancialState(prev => ({ ...prev, [field]: Math.max(0, value) }))
  }, [])

  const handleAddInsight = useCallback(() => {
    if (!currentInsight.trim()) return
    setInsights(prev => [...prev, currentInsight])
    setCurrentInsight('')
  }, [currentInsight])

  const handleComplete = useCallback(() => {
    if (submittedRef.current) return
    submittedRef.current = true
    setCompleted(true)
    onSubmit?.(
      buildSimulationSubmissionEnvelope({
        activityId: activity.id ?? 'chart-linking-simulator',
        mode: 'independent_practice',
        answers: {
          initialState,
          finalState: financialState,
          insights,
        },
        parts: [
          createSimulationPart('initial-statements', JSON.stringify(calculateStatements(initialState))),
          createSimulationPart('final-statements', JSON.stringify(statements)),
          ...insights.map((insight, i) => createSimulationPart(`insight-${i}`, insight)),
        ],
        artifact: {
          initialState,
          finalState: financialState,
          insightCount: insights.length,
        },
      }),
    )
    onComplete?.()
  }, [financialState, insights, onSubmit, onComplete, activity.id, statements])

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Statement Linking Simulator
          </CardTitle>
          <CardDescription className="text-blue-600">
            Explore how changes in one financial statement affect another. Adjust inputs and document your insights.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Adjust Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Revenue</label>
              <input
                type="number"
                value={financialState.revenue}
                onChange={(e) => handleUpdate('revenue', Number(e.target.value))}
                disabled={completed}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cost of Goods Sold</label>
              <input
                type="number"
                value={financialState.costOfGoodsSold}
                onChange={(e) => handleUpdate('costOfGoodsSold', Number(e.target.value))}
                disabled={completed}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Operating Expenses</label>
              <input
                type="number"
                value={financialState.operatingExpenses}
                onChange={(e) => handleUpdate('operatingExpenses', Number(e.target.value))}
                disabled={completed}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Dividends</label>
              <input
                type="number"
                value={financialState.dividends}
                onChange={(e) => handleUpdate('dividends', Number(e.target.value))}
                disabled={completed}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-200 bg-white">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Income Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-1">
              <span>Revenue</span>
              <span className="font-medium">${statements.incomeStatement.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-1 text-red-600">
              <span>Cost of Goods Sold</span>
              <span>(${statements.incomeStatement.costOfGoodsSold.toLocaleString()})</span>
            </div>
            <div className="flex justify-between border-b pb-1 font-semibold">
              <span>Gross Profit</span>
              <span>${statements.incomeStatement.grossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-1 text-red-600">
              <span>Operating Expenses</span>
              <span>(${statements.incomeStatement.operatingExpenses.toLocaleString()})</span>
            </div>
            <div className="flex justify-between border-b pb-1 font-semibold">
              <span>Operating Income</span>
              <span>${statements.incomeStatement.operatingIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-emerald-700">
              <span>Net Income</span>
              <span>${statements.incomeStatement.netIncome.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-white">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Balance Sheet (Simplified)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-1">
              <span>Total Assets</span>
              <span className="font-medium">${statements.balanceSheet.totalAssets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span>Total Liabilities</span>
              <span>${statements.balanceSheet.totalLiabilities.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-purple-700">
              <span>Retained Earnings</span>
              <span>${statements.balanceSheet.retainedEarnings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 font-semibold">
              <span>Total Equity</span>
              <span>${statements.balanceSheet.totalEquity.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Your Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full p-3 rounded border border-purple-200 text-sm"
            rows={3}
            placeholder="What did you learn about how financial statements link together?"
            value={currentInsight}
            onChange={(e) => setCurrentInsight(e.target.value)}
            disabled={completed}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddInsight} disabled={!currentInsight.trim() || completed} variant="outline">
              Add Insight
            </Button>
            <Button onClick={handleComplete} disabled={insights.length === 0 || completed} className="bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Analysis
            </Button>
          </div>
          {insights.length > 0 && (
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <div key={i} className="bg-white p-3 rounded border text-sm">
                  <p className="text-slate-700">{insight}</p>
                </div>
              ))}
            </div>
          )}
          {completed && (
            <div className="bg-green-50 p-3 rounded border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                Analysis complete! {insights.length} insight{insights.length !== 1 ? 's' : ''} documented.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
