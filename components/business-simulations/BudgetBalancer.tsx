/**
 * BudgetBalancer Component
 * 
 * DEVELOPER USAGE:
 * ================
 * Import and use this component in any React page or component:
 * 
 * ```tsx
 * import { BudgetBalancer } from '@/components/business-simulations/BudgetBalancer'
 * 
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <BudgetBalancer />
 *     </div>
 *   )
 * }
 * ```
 * 
 * The component is fully self-contained with its own state management.
 * No props are required - it initializes with default values.
 * 
 * STUDENT INTERACTION & LEARNING OBJECTIVES:
 * ==========================================
 * 
 * OBJECTIVE: Students learn personal finance management, budgeting skills, 
 * and the impact of spending decisions on financial health.
 * 
 * HOW STUDENTS INTERACT:
 * 1. **View Financial Dashboard**: Students see their monthly income ($5,000), 
 *    current month, total savings, and financial health score.
 * 
 * 2. **Manage Expenses**: Students can adjust monthly expenses in two categories:
 *    - REQUIRED expenses (rent, utilities, groceries, transportation) - must be paid
 *    - OPTIONAL expenses (entertainment, dining, shopping) - discretionary spending
 * 
 * 3. **Make Budget Decisions**: 
 *    - Enter amounts for each expense category
 *    - See real-time budget calculations and remaining budget
 *    - Get visual feedback when over/under budget
 * 
 * 4. **Advance Through Months**: Click "End Month" to progress and see results:
 *    - Savings accumulate from positive budget balance
 *    - Emergency fund grows automatically (10% of surplus)
 *    - Financial health score updates based on savings rate and spending habits
 * 
 * 5. **Learn From Consequences**:
 *    - Going over budget prevents month advancement
 *    - Low savings rate reduces financial health score
 *    - Students see long-term impact of spending decisions
 * 
 * KEY LEARNING OUTCOMES:
 * - Understanding fixed vs. variable expenses
 * - Importance of emergency funds and savings
 * - How spending decisions affect financial stability
 * - Real-time budget tracking and adjustment skills
 * - Long-term financial planning and health monitoring
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  type LucideIcon,
  DollarSign, 
  Calendar, 
  PiggyBank, 
  Heart,
  Home,
  Zap,
  ShoppingCart,
  Car,
  Coffee,
  Utensils,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

import type { Activity } from '@/lib/db/schema/validators'
import type { BudgetBalancerActivityProps } from '@/lib/db/schema/activities'

export type BudgetBalancerActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'budget-balancer'
  props: BudgetBalancerActivityProps
}

export interface BudgetBalancerExpense {
  amount: number
  required: boolean
  paid: boolean
  iconKey: string
  color: string
}

export interface BudgetBalancerState {
  monthlyIncome: number
  month: number
  totalSavings: number
  expenses: Record<string, BudgetBalancerExpense>
  emergencyFund: number
  financialHealth: number
}

interface BudgetBalancerProps {
  activity: BudgetBalancerActivity
  initialState?: Partial<BudgetBalancerState>
  onStateChange?: (state: BudgetBalancerState) => void
}

const EXPENSE_ICONS: Record<string, LucideIcon> = {
  home: Home,
  zap: Zap,
  'shopping-cart': ShoppingCart,
  car: Car,
  coffee: Coffee,
  utensils: Utensils,
  'shopping-bag': ShoppingBag
}

const buildExpenseState = (expenses: BudgetBalancerActivityProps['expenses']): Record<string, BudgetBalancerExpense> =>
  Object.fromEntries(
    expenses.map((expense) => [
      expense.id,
      {
        amount: expense.defaultAmount,
        required: expense.required,
        paid: false,
        iconKey: expense.icon,
        color: expense.color
      }
    ])
  )

const cloneExpenses = (expenses: Record<string, BudgetBalancerExpense>): Record<string, BudgetBalancerExpense> =>
  Object.fromEntries(
    Object.entries(expenses).map(([key, expense]) => [
      key,
      { ...expense }
    ])
  )

const cloneBudgetStateFromConfig = (
  state: BudgetBalancerActivityProps['initialState'],
  expenses: BudgetBalancerActivityProps['expenses']
): BudgetBalancerState => ({
  monthlyIncome: state.monthlyIncome,
  month: state.month,
  totalSavings: state.totalSavings,
  expenses: buildExpenseState(expenses),
  emergencyFund: state.emergencyFund,
  financialHealth: state.financialHealth
})

const mergeBudgetState = (
  base: BudgetBalancerState,
  override?: Partial<BudgetBalancerState>
): BudgetBalancerState => {
  const mergedExpenses = cloneExpenses(base.expenses)

  if (override?.expenses) {
    Object.entries(override.expenses).forEach(([key, expense]) => {
      mergedExpenses[key] = {
        ...(mergedExpenses[key] ?? {
          amount: 0,
          required: expense.required ?? false,
          paid: false,
          iconKey: expense.iconKey ?? 'home',
          color: expense.color ?? 'bg-gray-500'
        }),
        ...expense
      }
    })
  }

  return {
    monthlyIncome: override?.monthlyIncome ?? base.monthlyIncome,
    month: override?.month ?? base.month,
    totalSavings: override?.totalSavings ?? base.totalSavings,
    expenses: mergedExpenses,
    emergencyFund: override?.emergencyFund ?? base.emergencyFund,
    financialHealth: override?.financialHealth ?? base.financialHealth
  }
}

export function BudgetBalancer({ activity, initialState, onStateChange }: BudgetBalancerProps) {
  const baseState = useMemo(
    () => cloneBudgetStateFromConfig(activity.props.initialState, activity.props.expenses),
    [activity.props.initialState, activity.props.expenses]
  )
  const [gameState, setGameState] = useState<BudgetBalancerState>(() => mergeBudgetState(baseState, initialState))
  const [tempExpenses, setTempExpenses] = useState<Record<string, number>>(() =>
    Object.fromEntries(Object.entries(gameState.expenses).map(([key, expense]) => [key, expense.amount]))
  )

  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    const merged = mergeBudgetState(baseState, initialState)
    setGameState(merged)
    setTempExpenses(Object.fromEntries(Object.entries(merged.expenses).map(([key, expense]) => [key, expense.amount])))
  }, [baseState, initialState])

  useEffect(() => {
    onStateChange?.(gameState)
  }, [gameState, onStateChange])

  const totalExpenses = Object.values(gameState.expenses).reduce((sum, expense) => sum + expense.amount, 0)
  const remainingBudget = gameState.monthlyIncome - totalExpenses
  const requiredExpenses = Object.values(gameState.expenses)
    .filter(expense => expense.required)
    .reduce((sum, expense) => sum + expense.amount, 0)

  const updateExpense = (expenseKey: string, newAmount: number) => {
    setTempExpenses(prev => ({
      ...prev,
      [expenseKey]: Math.max(0, newAmount)
    }))
  }

  const applyExpenseChanges = () => {
    setGameState(prev => ({
      ...prev,
      expenses: Object.fromEntries(
        Object.entries(prev.expenses).map(([key, expense]) => [
          key, 
          { ...expense, amount: tempExpenses[key] || 0 }
        ])
      )
    }))
  }

  const advanceMonth = () => {
    const newRemaining = gameState.monthlyIncome - totalExpenses
    const newSavings = gameState.totalSavings + Math.max(0, newRemaining)
    
    // Calculate financial health based on savings rate and emergency fund
    const savingsRate = newRemaining / gameState.monthlyIncome
    const emergencyFundRatio = gameState.emergencyFund / gameState.monthlyIncome
    const { emergencyFundContributionRate, healthScoreBase, savingsMultiplier, emergencyMultiplier } =
      activity.props.savingsConfig
    const healthScore = Math.max(
      0,
      Math.min(100, healthScoreBase + savingsRate * savingsMultiplier + emergencyFundRatio * emergencyMultiplier)
    )
    const emergencyContribution = Math.max(0, newRemaining * emergencyFundContributionRate)

    setGameState(prev => ({
      ...prev,
      month: prev.month + 1,
      totalSavings: newSavings,
      emergencyFund: prev.emergencyFund + emergencyContribution,
      financialHealth: Math.round(healthScore),
      expenses: Object.fromEntries(
        Object.entries(prev.expenses).map(([key, expense]) => [
          key, 
          { ...expense, paid: false }
        ])
      )
    }))
  }

  const resetGame = () => {
    const resetState = cloneBudgetStateFromConfig(activity.props.initialState, activity.props.expenses)
    setGameState(resetState)
    setTempExpenses(Object.fromEntries(Object.entries(resetState.expenses).map(([key, expense]) => [key, expense.amount])))
  }

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600'
    if (health >= 60) return 'text-yellow-600'
    if (health >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            {activity.props.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {activity.description ?? activity.props.description}
          </CardDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              How to Play
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions Panel */}
      {showInstructions && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              {`How to Play ${activity.props.title}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objective */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Objective</h4>
              <p className="text-blue-700">
                Learn personal finance management by balancing your monthly budget. Start with $
                {activity.props.initialState.monthlyIncome.toLocaleString()} in monthly income 
                and make smart decisions about required and optional expenses to build savings and maintain financial health.
              </p>
            </div>

            {/* How to Play */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">🎮 How to Play</h4>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium mb-1">1. Monitor Your Dashboard</h5>
                  <p className="text-sm text-gray-600">
                    Track your monthly income (${activity.props.initialState.monthlyIncome.toLocaleString()}), current month, total savings, and financial health score (0-100%).
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium mb-1">2. Manage Monthly Expenses</h5>
                  <p className="text-sm text-gray-600">Adjust spending in two categories: <strong>Required</strong> expenses (rent, utilities, groceries, transportation) and <strong>Optional</strong> expenses (entertainment, dining, shopping).</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium mb-1">3. Make Budget Decisions</h5>
                  <p className="text-sm text-gray-600">Enter amounts for each expense category, see real-time budget calculations, and get visual feedback when over/under budget.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium mb-1">4. Advance Through Months</h5>
                  <p className="text-sm text-gray-600">
                    Click &quot;End Month&quot; to progress. Savings accumulate from positive budget balance, emergency fund grows (10% of surplus), and financial health updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Expense Categories */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">💰 Expense Categories</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h5 className="font-medium text-orange-800 mb-2">🏠 Required Expenses (Must Pay)</h5>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• <strong>Rent:</strong> $1,200 (housing)</li>
                    <li>• <strong>Utilities:</strong> $300 (electricity, water, internet)</li>
                    <li>• <strong>Groceries:</strong> $400 (food essentials)</li>
                    <li>• <strong>Transportation:</strong> $200 (car, gas, public transit)</li>
                  </ul>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2">🎉 Optional Expenses (Your Choice)</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Entertainment:</strong> Movies, games, subscriptions</li>
                    <li>• <strong>Dining Out:</strong> Restaurants, takeout, coffee</li>
                    <li>• <strong>Shopping:</strong> Clothes, gadgets, non-essentials</li>
                    <li>• <em>Start at $0 - you decide how much to spend!</em></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Financial Health */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">💚 Financial Health Score</h4>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-green-100 rounded text-center">
                  <div className="font-medium text-green-800">Excellent</div>
                  <div className="text-green-600">80-100%</div>
                </div>
                <div className="p-2 bg-yellow-100 rounded text-center">
                  <div className="font-medium text-yellow-800">Good</div>
                  <div className="text-yellow-600">60-79%</div>
                </div>
                <div className="p-2 bg-orange-100 rounded text-center">
                  <div className="font-medium text-orange-800">Fair</div>
                  <div className="text-orange-600">40-59%</div>
                </div>
                <div className="p-2 bg-red-100 rounded text-center">
                  <div className="font-medium text-red-800">Poor</div>
                  <div className="text-red-600">0-39%</div>
                </div>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                <strong>Health factors:</strong> Savings rate (50%), emergency fund ratio (25%), and baseline financial stability (25%)
              </p>
            </div>

            {/* Key Learning Goals */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🎓 Key Learning Goals</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Fixed vs. Variable Expenses:</strong> Understanding required vs. optional spending</li>
                <li>• <strong>Emergency Fund Building:</strong> 10% of surplus automatically goes to emergency savings</li>
                <li>• <strong>Budget Impact:</strong> See how spending decisions affect long-term financial stability</li>
                <li>• <strong>Real-time Tracking:</strong> Practice budget monitoring and adjustment skills</li>
                <li>• <strong>Financial Planning:</strong> Learn to balance current enjoyment with future security</li>
              </ul>
            </div>

            {/* Success Tips */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">💡 Success Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-800 mb-1">Conservative Strategy</h5>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Keep optional expenses low initially</li>
                    <li>• Focus on building emergency fund first</li>
                    <li>• Aim for 20%+ savings rate</li>
                    <li>• Gradually increase lifestyle spending</li>
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <h5 className="font-medium text-orange-800 mb-1">Balanced Approach</h5>
                  <ul className="text-xs text-orange-700 space-y-1">
                    <li>• Set moderate optional expense budgets</li>
                    <li>• Monitor financial health regularly</li>
                    <li>• Adjust spending based on health score</li>
                    <li>• Balance enjoyment with saving goals</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sample Budget */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">
                📊 Sample Monthly Budget (based on ${activity.props.initialState.monthlyIncome.toLocaleString()} income)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium mb-2">💰 Income & Required</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Income:</span>
                      <span className="text-green-600 font-medium">
                        +${activity.props.initialState.monthlyIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between"><span>Rent:</span><span className="text-red-600">-$1,200</span></div>
                    <div className="flex justify-between"><span>Utilities:</span><span className="text-red-600">-$300</span></div>
                    <div className="flex justify-between"><span>Groceries:</span><span className="text-red-600">-$400</span></div>
                    <div className="flex justify-between"><span>Transportation:</span><span className="text-red-600">-$200</span></div>
                    <hr className="my-1" />
                    <div className="flex justify-between font-medium"><span>After Required:</span><span className="text-blue-600">$2,900</span></div>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <h5 className="font-medium mb-2">🎯 Smart Optional Spending</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Entertainment:</span><span className="text-gray-600">-$200</span></div>
                    <div className="flex justify-between"><span>Dining Out:</span><span className="text-gray-600">-$300</span></div>
                    <div className="flex justify-between"><span>Shopping:</span><span className="text-gray-600">-$150</span></div>
                    <hr className="my-1" />
                    <div className="flex justify-between"><span>Total Optional:</span><span className="text-gray-600">-$650</span></div>
                    <div className="flex justify-between font-medium"><span>Monthly Savings:</span><span className="text-green-600">$2,250</span></div>
                    <div className="flex justify-between text-xs"><span>Emergency Fund:</span><span className="text-purple-600">+$225</span></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-green-700 font-medium">Income</p>
            <p className="text-2xl font-bold text-green-800">
              ${gameState.monthlyIncome.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700 font-medium">Month</p>
            <p className="text-2xl font-bold text-blue-800">{gameState.month}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <PiggyBank className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-purple-700 font-medium">Savings</p>
            <p className="text-2xl font-bold text-purple-800">
              ${gameState.totalSavings.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className={`w-6 h-6 ${getHealthColor(gameState.financialHealth)}`} />
            </div>
            <p className="text-sm text-pink-700 font-medium">Financial Health</p>
            <p className={`text-2xl font-bold ${getHealthColor(gameState.financialHealth)}`}>
              {gameState.financialHealth}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Monthly Income:</span>
            <span className="text-lg font-bold text-green-600">
              +${gameState.monthlyIncome.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Expenses:</span>
            <span className="text-lg font-bold text-red-600">
              -${totalExpenses.toLocaleString()}
            </span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Remaining Budget:</span>
            <span className={`text-lg font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${remainingBudget.toLocaleString()}
            </span>
          </div>

          {remainingBudget < 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">
                You&apos;re over budget! Reduce expenses or increase income.
              </span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Progress</span>
              <span>{Math.round((totalExpenses / gameState.monthlyIncome) * 100)}%</span>
            </div>
            <Progress 
              value={Math.min(100, (totalExpenses / gameState.monthlyIncome) * 100)}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Expense Management */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>
            Adjust your monthly expenses. Required expenses must be paid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(gameState.expenses).map(([key, expense]) => {
              const Icon = EXPENSE_ICONS[expense.iconKey] ?? DollarSign
              return (
                <Card key={key} className={`${expense.required ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${expense.color} text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                          <div className="flex items-center gap-2">
                            {expense.required && (
                              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                                Required
                              </Badge>
                            )}
                            {!expense.required && (
                              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                Optional
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">$</span>
                      <Input
                        type="number"
                        value={tempExpenses[key] || 0}
                        onChange={(e) => updateExpense(key, parseInt(e.target.value) || 0)}
                        min="0"
                        step="50"
                        className="flex-1"
                      />
                      <Button size="sm" onClick={applyExpenseChanges} variant="outline">
                        Update
                      </Button>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Current: ${expense.amount.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Financial Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className={`w-5 h-5 ${getHealthColor(gameState.financialHealth)}`} />
            Financial Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current Score:</span>
            <span className={`text-2xl font-bold ${getHealthColor(gameState.financialHealth)}`}>
              {gameState.financialHealth}%
            </span>
          </div>
          
          <Progress 
            value={gameState.financialHealth} 
            className="h-3"
          />
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Savings rate: {((remainingBudget / gameState.monthlyIncome) * 100).toFixed(1)}%</p>
            <p>• Emergency fund: ${gameState.emergencyFund.toFixed(0)}</p>
            <p>• Required expenses: ${requiredExpenses.toLocaleString()} ({((requiredExpenses / gameState.monthlyIncome) * 100).toFixed(1)}%)</p>
          </div>
        </CardContent>
      </Card>

      {/* Game Actions */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={advanceMonth} 
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={remainingBudget < 0}
        >
          <Calendar className="w-4 h-4 mr-2" />
          End Month
        </Button>
        <Button 
          onClick={resetGame} 
          variant="outline" 
          size="lg"
        >
          Reset Game
        </Button>
      </div>
    </div>
  )
}
export default BudgetBalancer
