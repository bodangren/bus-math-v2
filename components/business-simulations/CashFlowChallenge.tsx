/**
 * CashFlowChallenge Component (v2 - Database-driven)
 *
 * Migrated from v1 to work with Supabase activity props.
 * Game configurations come from database instead of hardcoded constants.
 */

'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Phone,
  FileText,
  Building2,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Wallet,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { CashFlowChallengeActivityProps } from '@/lib/db/schema/activities'

interface CashFlow {
  id: string
  description: string
  amount: number
  daysLeft: number
  type: 'incoming' | 'outgoing'
  canModify: boolean
}

interface GameState {
  cashPosition: number
  day: number
  maxDays: number
  incomingFlows: CashFlow[]
  outgoingFlows: CashFlow[]
  lineOfCredit: number
  creditUsed: number
  creditInterestRate: number
  actionsUsed: {
    requestPayment: number
    negotiateTerms: number
    lineOfCredit: number
    delayExpense: number
  }
  gameStatus: 'playing' | 'won' | 'lost'
}

interface CashFlowChallengeProps {
  activity: CashFlowChallengeActivityProps
  onSubmit?: (data: GameState & { finalProfit: number; actionsLog: string[] }) => void
}

export function CashFlowChallenge({ activity, onSubmit }: CashFlowChallengeProps) {
  const [gameState, setGameState] = useState<GameState>({
    cashPosition: activity.initialState.cashPosition,
    day: activity.initialState.day,
    maxDays: activity.initialState.maxDays,
    incomingFlows: activity.incomingFlows.map((flow, index) => ({
      ...flow,
      id: flow.id || `incoming-${index}`
    })),
    outgoingFlows: activity.outgoingFlows.map((flow, index) => ({
      ...flow,
      id: flow.id || `outgoing-${index}`
    })),
    lineOfCredit: activity.initialState.lineOfCredit,
    creditUsed: activity.initialState.creditUsed,
    creditInterestRate: activity.initialState.creditInterestRate,
    actionsUsed: activity.initialState.actionsUsed,
    gameStatus: activity.initialState.gameStatus
  })

  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'warning' | 'error' | 'info'
  }>>([])

  const [showInstructions, setShowInstructions] = useState(false)
  const [actionsLog, setActionsLog] = useState<string[]>([])

  const addNotification = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const getCashHealthStatus = (cash: number) => {
    if (cash >= 20000) return { status: 'Healthy', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (cash >= 10000) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    if (cash >= 5000) return { status: 'Tight', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    if (cash >= 0) return { status: 'Critical', color: 'text-orange-600', bgColor: 'bg-orange-50' }
    return { status: 'Bankrupt', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  const advanceDay = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return

    setGameState(prev => {
      const newDay = prev.day + 1
      let cashChange = 0
      const dayNotifications: string[] = []

      // Process incoming flows
      const newIncomingFlows = prev.incomingFlows.map(flow => {
        const newFlow = { ...flow, daysLeft: Math.max(0, flow.daysLeft - 1) }
        if (flow.daysLeft === 1) {
          cashChange += flow.amount
          dayNotifications.push(`Received ${flow.description}: +$${flow.amount.toLocaleString()}`)
          return { ...newFlow, daysLeft: -1 }
        }
        return newFlow
      }).filter(flow => flow.daysLeft !== -1)

      // Process outgoing flows
      const newOutgoingFlows = prev.outgoingFlows.map(flow => {
        const newFlow = { ...flow, daysLeft: Math.max(0, flow.daysLeft - 1) }
        if (flow.daysLeft === 1) {
          cashChange -= flow.amount
          dayNotifications.push(`Paid ${flow.description}: -$${flow.amount.toLocaleString()}`)
          return { ...newFlow, daysLeft: -1 }
        }
        return newFlow
      }).filter(flow => flow.daysLeft !== -1)

      // Apply daily interest on credit used
      const dailyInterest = prev.creditUsed * (prev.creditInterestRate / 365)
      cashChange -= dailyInterest

      const newCashPosition = prev.cashPosition + cashChange

      // Determine game status
      let newGameStatus = prev.gameStatus
      if (newCashPosition < 0) {
        newGameStatus = 'lost'
      } else if (newDay > prev.maxDays) {
        newGameStatus = 'won'
      }

      // Show notifications
      dayNotifications.forEach(msg => {
        if (msg.includes('+$')) {
          addNotification(msg, 'success')
        } else {
          addNotification(msg, 'info')
        }
      })

      if (dailyInterest > 0) {
        addNotification(`Credit interest: -$${dailyInterest.toFixed(2)}`, 'warning')
      }

      return {
        ...prev,
        day: newDay,
        cashPosition: newCashPosition,
        incomingFlows: newIncomingFlows,
        outgoingFlows: newOutgoingFlows,
        gameStatus: newGameStatus
      }
    })
  }, [gameState.gameStatus, addNotification])

  const requestPayment = useCallback(() => {
    const availableFlows = gameState.incomingFlows.filter(flow =>
      flow.canModify && flow.daysLeft > 2
    )

    if (availableFlows.length === 0) {
      addNotification('No payments available to expedite', 'warning')
      return
    }

    const flowToModify = availableFlows[0]
    const cost = Math.round(flowToModify.amount * 0.05) // 5% fee

    setGameState(prev => ({
      ...prev,
      cashPosition: prev.cashPosition - cost,
      incomingFlows: prev.incomingFlows.map(flow =>
        flow.id === flowToModify.id
          ? { ...flow, daysLeft: Math.min(flow.daysLeft, 2), canModify: false }
          : flow
      ),
      actionsUsed: {
        ...prev.actionsUsed,
        requestPayment: prev.actionsUsed.requestPayment + 1
      }
    }))

    const action = `Day ${gameState.day}: Called ${flowToModify.description} - payment expedited for $${cost.toLocaleString()} fee`
    setActionsLog(prev => [...prev, action])
    addNotification(action, 'success')
  }, [gameState, addNotification])

  const negotiateTerms = useCallback(() => {
    const availableFlows = gameState.outgoingFlows.filter(flow =>
      flow.canModify && flow.daysLeft <= 5
    )

    if (availableFlows.length === 0) {
      addNotification('No urgent payments available to negotiate', 'warning')
      return
    }

    const flowToModify = availableFlows[0]
    const extension = 7 // Extend by 7 days
    const penalty = Math.round(flowToModify.amount * 0.02) // 2% penalty

    setGameState(prev => ({
      ...prev,
      outgoingFlows: prev.outgoingFlows.map(flow =>
        flow.id === flowToModify.id
          ? {
              ...flow,
              daysLeft: flow.daysLeft + extension,
              amount: flow.amount + penalty,
              canModify: false
            }
          : flow
      ),
      actionsUsed: {
        ...prev.actionsUsed,
        negotiateTerms: prev.actionsUsed.negotiateTerms + 1
      }
    }))

    const action = `Day ${gameState.day}: Negotiated ${flowToModify.description} - extended by ${extension} days with $${penalty.toLocaleString()} penalty`
    setActionsLog(prev => [...prev, action])
    addNotification(action, 'info')
  }, [gameState, addNotification])

  const getLineOfCredit = useCallback(() => {
    if (gameState.lineOfCredit > 0) {
      addNotification('Line of credit already established', 'warning')
      return
    }

    const creditAmount = 15000
    const setupFee = 500

    setGameState(prev => ({
      ...prev,
      cashPosition: prev.cashPosition - setupFee,
      lineOfCredit: creditAmount,
      actionsUsed: {
        ...prev.actionsUsed,
        lineOfCredit: prev.actionsUsed.lineOfCredit + 1
      }
    }))

    const action = `Day ${gameState.day}: Line of credit established: $${creditAmount.toLocaleString()} available (Setup fee: $${setupFee})`
    setActionsLog(prev => [...prev, action])
    addNotification(action, 'success')
  }, [gameState, addNotification])

  const drawCredit = useCallback((amount: number) => {
    const available = gameState.lineOfCredit - gameState.creditUsed
    const amountToUse = Math.min(amount, available)

    if (amountToUse <= 0) {
      addNotification('No credit available', 'warning')
      return
    }

    setGameState(prev => ({
      ...prev,
      cashPosition: prev.cashPosition + amountToUse,
      creditUsed: prev.creditUsed + amountToUse
    }))

    addNotification(`Used $${amountToUse.toLocaleString()} from line of credit`, 'info')
  }, [gameState, addNotification])

  const delayExpense = useCallback(() => {
    const availableFlows = gameState.outgoingFlows.filter(flow =>
      flow.canModify && flow.daysLeft <= 7 && flow.description !== 'Payroll'
    )

    if (availableFlows.length === 0) {
      addNotification('No expenses available to delay', 'warning')
      return
    }

    const flowToModify = availableFlows[0]
    const delay = 5 // Delay by 5 days
    const penalty = Math.round(flowToModify.amount * 0.03) // 3% penalty

    setGameState(prev => ({
      ...prev,
      outgoingFlows: prev.outgoingFlows.map(flow =>
        flow.id === flowToModify.id
          ? {
              ...flow,
              daysLeft: flow.daysLeft + delay,
              amount: flow.amount + penalty,
              canModify: false
            }
          : flow
      ),
      actionsUsed: {
        ...prev.actionsUsed,
        delayExpense: prev.actionsUsed.delayExpense + 1
      }
    }))

    const action = `Day ${gameState.day}: Delayed ${flowToModify.description} by ${delay} days with $${penalty.toLocaleString()} penalty`
    setActionsLog(prev => [...prev, action])
    addNotification(action, 'warning')
  }, [gameState, addNotification])

  const resetGame = useCallback(() => {
    setGameState({
      cashPosition: activity.initialState.cashPosition,
      day: activity.initialState.day,
      maxDays: activity.initialState.maxDays,
      incomingFlows: activity.incomingFlows.map((flow, index) => ({
        ...flow,
        id: flow.id || `incoming-${index}`
      })),
      outgoingFlows: activity.outgoingFlows.map((flow, index) => ({
        ...flow,
        id: flow.id || `outgoing-${index}`
      })),
      lineOfCredit: activity.initialState.lineOfCredit,
      creditUsed: activity.initialState.creditUsed,
      creditInterestRate: activity.initialState.creditInterestRate,
      actionsUsed: activity.initialState.actionsUsed,
      gameStatus: activity.initialState.gameStatus
    })
    setNotifications([])
    setActionsLog([])
    addNotification('Game reset successfully', 'info')
  }, [activity, addNotification])

  const handleSubmit = useCallback(() => {
    if (onSubmit && gameState.gameStatus !== 'playing') {
      const initialCash = activity.initialState.cashPosition
      const finalProfit = gameState.cashPosition - initialCash
      onSubmit({
        ...gameState,
        finalProfit,
        actionsLog
      })
      addNotification('Results submitted successfully!', 'success')
    }
  }, [gameState, actionsLog, onSubmit, activity, addNotification])

  const healthStatus = getCashHealthStatus(gameState.cashPosition)
  const totalIncoming = gameState.incomingFlows.reduce((sum, flow) => sum + flow.amount, 0)
  const totalOutgoing = gameState.outgoingFlows.reduce((sum, flow) => sum + flow.amount, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Wallet className="w-8 h-8 text-blue-600" />
            {activity.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {activity.description}
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

      {/* Game Status */}
      {gameState.gameStatus !== 'playing' && (
        <Card className={`border-2 ${gameState.gameStatus === 'won' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {gameState.gameStatus === 'won' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <h3 className={`text-2xl font-bold ${gameState.gameStatus === 'won' ? 'text-green-800' : 'text-red-800'}`}>
                {gameState.gameStatus === 'won' ? 'Challenge Complete!' : 'Game Over'}
              </h3>
            </div>
            <p className={`text-lg ${gameState.gameStatus === 'won' ? 'text-green-700' : 'text-red-700'}`}>
              {gameState.gameStatus === 'won'
                ? `Successfully managed cash flow for ${gameState.maxDays} days with $${gameState.cashPosition.toLocaleString()} remaining!`
                : 'Ran out of cash! Better luck next time.'
              }
            </p>
            {onSubmit && (
              <Button onClick={handleSubmit} className="mt-4" size="lg">
                Submit Results
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cash Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${healthStatus.bgColor} border-2`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className={`w-6 h-6 ${healthStatus.color}`} />
            </div>
            <p className="text-sm font-medium">Cash Position</p>
            <p className={`text-2xl font-bold ${healthStatus.color}`}>
              ${gameState.cashPosition.toLocaleString()}
            </p>
            <Badge variant="outline" className={`mt-1 ${healthStatus.color}`}>
              {healthStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-purple-700 font-medium">Day</p>
            <p className="text-2xl font-bold text-purple-800">
              {gameState.day} / {gameState.maxDays}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-green-700 font-medium">Incoming</p>
            <p className="text-2xl font-bold text-green-800">
              ${totalIncoming.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm text-red-700 font-medium">Outgoing</p>
            <p className="text-2xl font-bold text-red-800">
              ${totalOutgoing.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incoming Flows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="w-5 h-5" />
              Incoming Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gameState.incomingFlows.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending incoming payments</p>
            ) : (
              gameState.incomingFlows.map((flow) => (
                <div key={flow.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div>
                    <p className="font-medium text-green-800">{flow.description}</p>
                    <p className="text-sm text-green-600">
                      {flow.daysLeft === 0 ? 'Due today' : `${flow.daysLeft} days left`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">+${flow.amount.toLocaleString()}</p>
                    {!flow.canModify && (
                      <Badge variant="outline" className="text-xs">Modified</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Outgoing Flows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <TrendingDown className="w-5 h-5" />
              Outgoing Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gameState.outgoingFlows.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending outgoing payments</p>
            ) : (
              gameState.outgoingFlows.map((flow) => (
                <div key={flow.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="font-medium text-red-800">{flow.description}</p>
                    <p className="text-sm text-red-600">
                      {flow.daysLeft === 0 ? 'Due today' : `${flow.daysLeft} days left`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-700">-${flow.amount.toLocaleString()}</p>
                    {!flow.canModify && (
                      <Badge variant="outline" className="text-xs">Modified</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Actions</CardTitle>
          <CardDescription>
            Take actions to manage your cash flow. Each action has costs and limitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={requestPayment}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              disabled={gameState.gameStatus !== 'playing'}
            >
              <Phone className="w-6 h-6 text-blue-600" />
              <div className="text-center">
                <p className="font-medium">Request Payment</p>
                <p className="text-xs text-gray-500">Expedite customer payment (5% fee)</p>
                <Badge variant="secondary" className="mt-1">
                  Used: {gameState.actionsUsed.requestPayment}
                </Badge>
              </div>
            </Button>

            <Button
              onClick={negotiateTerms}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              disabled={gameState.gameStatus !== 'playing'}
            >
              <FileText className="w-6 h-6 text-purple-600" />
              <div className="text-center">
                <p className="font-medium">Negotiate Terms</p>
                <p className="text-xs text-gray-500">Extend payment terms (2% penalty)</p>
                <Badge variant="secondary" className="mt-1">
                  Used: {gameState.actionsUsed.negotiateTerms}
                </Badge>
              </div>
            </Button>

            <Button
              onClick={getLineOfCredit}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              disabled={gameState.gameStatus !== 'playing' || gameState.lineOfCredit > 0}
            >
              <Building2 className="w-6 h-6 text-green-600" />
              <div className="text-center">
                <p className="font-medium">Line of Credit</p>
                <p className="text-xs text-gray-500">Get $15k credit ($500 setup)</p>
                {gameState.lineOfCredit > 0 && (
                  <Badge variant="secondary" className="mt-1">
                    Available: ${(gameState.lineOfCredit - gameState.creditUsed).toLocaleString()}
                  </Badge>
                )}
              </div>
            </Button>

            <Button
              onClick={delayExpense}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              disabled={gameState.gameStatus !== 'playing'}
            >
              <Clock className="w-6 h-6 text-orange-600" />
              <div className="text-center">
                <p className="font-medium">Delay Expense</p>
                <p className="text-xs text-gray-500">Delay payment (3% penalty)</p>
                <Badge variant="secondary" className="mt-1">
                  Used: {gameState.actionsUsed.delayExpense}
                </Badge>
              </div>
            </Button>
          </div>

          {gameState.lineOfCredit > 0 && gameState.creditUsed < gameState.lineOfCredit && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Emergency Credit Available</h4>
              <div className="flex items-center gap-4">
                <p className="text-sm text-blue-700">
                  Available: ${(gameState.lineOfCredit - gameState.creditUsed).toLocaleString()}
                </p>
                <Button
                  onClick={() => { drawCredit(5000) }}
                  size="sm"
                  disabled={gameState.gameStatus !== 'playing'}
                >
                  Use $5,000
                </Button>
                <Button
                  onClick={() => { drawCredit(gameState.lineOfCredit - gameState.creditUsed) }}
                  size="sm"
                  variant="outline"
                  disabled={gameState.gameStatus !== 'playing'}
                >
                  Use All
                </Button>
              </div>
              {gameState.creditUsed > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  Daily interest: ${(gameState.creditUsed * gameState.creditInterestRate / 365).toFixed(2)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={advanceDay}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={gameState.gameStatus !== 'playing'}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Advance Day
        </Button>
        <Button
          onClick={resetGame}
          variant="outline"
          size="lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Challenge
        </Button>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`
              max-w-sm border-l-4 ${
                notification.type === 'success' ? 'border-l-green-500 bg-green-50' :
                notification.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                notification.type === 'error' ? 'border-l-red-500 bg-red-50' :
                'border-l-blue-500 bg-blue-50'
              }
            `}>
              <CardContent className="p-3">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' :
                  notification.type === 'warning' ? 'text-yellow-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default CashFlowChallenge
