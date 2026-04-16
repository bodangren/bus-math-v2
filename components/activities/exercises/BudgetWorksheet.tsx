'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, PieChart, DollarSign, AlertCircle } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

const defaultCategories = ['Marketing', 'Salaries', 'Rent', 'Supplies', 'Utilities', 'Other']

export interface BudgetWorksheetProps {
  activity: {
    id?: string
    props?: {
      categories?: string[]
      totalBudget?: number
      constraints?: Record<string, number>
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function BudgetWorksheet({ activity, onSubmit, onComplete }: BudgetWorksheetProps) {
  const {
    categories = defaultCategories,
    totalBudget = 100000,
  } = activity.props || {}

  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>(
    Object.fromEntries(categories.map(cat => [cat, '0']))
  )
  const [completed, setCompleted] = useState(false)
  const submittedRef = useRef(false)

  const numCategoryBudgets = Object.fromEntries(
    Object.entries(categoryBudgets).map(([cat, val]) => [cat, parseFloat(val) || 0])
  )
  const totalAllocated = Object.values(numCategoryBudgets).reduce((sum, val) => sum + val, 0)
  const remaining = totalBudget - totalAllocated
  const isOverBudget = remaining < 0
  const isUnderBudget = remaining > 0

  const handleCategoryChange = useCallback((category: string, value: string) => {
    setCategoryBudgets(prev => ({ ...prev, [category]: value }))
  }, [])

  const handleComplete = useCallback(() => {
    if (submittedRef.current) return
    submittedRef.current = true
    setCompleted(true)
    try {
      onSubmit?.(
        buildSimulationSubmissionEnvelope({
          activityId: activity.id ?? 'budget-worksheet',
          mode: 'independent_practice',
          answers: {
            totalBudget,
            categoryBudgets: numCategoryBudgets,
            totalAllocated,
            remaining,
            isOverBudget,
          },
          parts: [
            createSimulationPart('total-budget', totalBudget),
            createSimulationPart('total-allocated', totalAllocated),
            createSimulationPart('remaining', remaining),
            ...Object.entries(numCategoryBudgets).map(([cat, val]) =>
              createSimulationPart(`budget-${cat.toLowerCase().replace(/\s+/g, '-')}`, val)
            ),
          ],
          artifact: {
            categories,
          },
        }),
      )
      onComplete?.()
    } catch (err) {
      console.error('BudgetWorksheet submission failed:', err)
      submittedRef.current = false
      setCompleted(false)
    }
  }, [totalBudget, numCategoryBudgets, totalAllocated, remaining, isOverBudget, categories, onSubmit, onComplete, activity.id])

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Budget Worksheet
          </CardTitle>
          <CardDescription className="text-blue-600">
            Allocate your budget across categories and track how much you have left.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-bold text-blue-800">${totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Remaining</p>
                <p className={`text-2xl font-bold flex items-center gap-2 justify-end ${
                  isOverBudget ? 'text-red-700' : isUnderBudget ? 'text-emerald-700' : 'text-gray-700'
                }`}>
                  {isOverBudget ? <AlertCircle className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                  ${remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {categories.map((category) => (
              <div key={category} className="space-y-2">
                <Label htmlFor={`budget-${category}`}>{category}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <Input
                    id={`budget-${category}`}
                    type="number"
                    value={categoryBudgets[category]}
                    onChange={(e) => handleCategoryChange(category, e.target.value)}
                    disabled={completed}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button onClick={handleComplete} disabled={completed} className="bg-blue-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Budget
            </Button>
          </div>

          {completed && (
            <div className="mt-4 bg-green-50 p-3 rounded border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                Budget complete!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Budget Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Allocate funds to high-priority categories first</li>
            <li>Leave a buffer for unexpected expenses</li>
            <li>Review and adjust your budget regularly</li>
          </ul>
        </div>
        <div className="bg-slate-50 p-4 rounded border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-2">Status</h4>
          <p className="text-sm text-slate-700">
            {isOverBudget
              ? 'You are over budget! Consider reducing allocations in some categories.'
              : isUnderBudget
              ? 'You have money left to allocate. Consider adding to underfunded categories or building a reserve.'
              : 'Your budget is perfectly balanced!'}
          </p>
        </div>
      </div>
    </div>
  )
}
