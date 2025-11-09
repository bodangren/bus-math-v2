/**
 * StartupJourney Component
 * 
 * DEVELOPER USAGE:
 * ================
 * Import and use this component in any React page or component:
 * 
 * ```tsx
 * import { StartupJourney } from '@/components/business-simulations/StartupJourney'
 * 
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <StartupJourney />
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
 * OBJECTIVE: Students experience the startup journey from idea to growth,
 * learning about funding decisions, burn rates, user acquisition, and strategic choices.
 * 
 * HOW STUDENTS INTERACT:
 * 1. **Monitor Startup Dashboard**: Students see current funding ($10,000 starting),
 *    monthly burn rate ($2,000), user count (100), revenue ($0), and current stage.
 * 
 * 2. **Make Strategic Decisions**: At each stage, students face critical choices:
 *    - FUNDING: Bootstrap vs Accelerator vs Angel investors
 *    - TEAM: Hire developers vs marketers vs business development
 *    - PRODUCT: Focus on features vs user feedback vs scaling
 *    - GROWTH: Marketing spend vs organic growth vs partnerships
 * 
 * 3. **Progress Through Stages**: 
 *    - IDEA: Initial concept and first funding decisions
 *    - PROTOTYPE: Build MVP and validate market fit
 *    - LAUNCH: Go to market and acquire first customers
 *    - GROWTH: Scale operations and user base
 *    - SUCCESS: Achieve profitability or exit opportunity
 * 
 * 4. **Manage Resources**: 
 *    - Track funding runway (months remaining at current burn)
 *    - Balance user growth with revenue generation
 *    - Make decisions that affect burn rate and growth
 * 
 * 5. **Experience Consequences**: Each decision impacts:
 *    - Monthly burn rate (operational costs)
 *    - User growth rate and retention
 *    - Revenue potential and monetization
 *    - Available funding and runway
 * 
 * 6. **Learn from Outcomes**: 
 *    - Successful decisions advance to next stage
 *    - Poor choices may require course correction
 *    - Random market events create additional challenges
 * 
 * KEY LEARNING OUTCOMES:
 * - Understanding startup funding lifecycle and sources
 * - Strategic decision-making under resource constraints
 * - Balancing growth, profitability, and sustainability
 * - Risk management and runway optimization
 * - Market dynamics and competitive positioning
 * - Performance metrics: CAC, LTV, burn rate, runway
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  type LucideIcon,
  DollarSign, 
  Calendar, 
  TrendingUp,
  Users,
  Rocket,
  Lightbulb,
  Target,
  ChartLine,
  CheckCircle,
  XCircle,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building,
  Code,
  Megaphone,
  Crown,
  Zap
} from 'lucide-react'

import type { Activity } from '@/lib/db/schema/validators'
import type { StartupJourneyActivityProps } from '@/lib/db/schema/activities'

export type StartupJourneyActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'startup-journey'
  props: StartupJourneyActivityProps
}

export interface StartupJourneyState {
  stage: string
  funding: number
  monthlyBurn: number
  users: number
  revenue: number
  month: number
  maxMonths: number
  decisions: string[]
  currentDecisionId: string | null
  userGrowthRate: number
  revenuePerUser: number
  gameStatus: 'playing' | 'won' | 'lost'
}

interface StartupJourneyProps {
  activity: StartupJourneyActivity
  initialState?: Partial<StartupJourneyState>
  onStateChange?: (state: StartupJourneyState) => void
}

const STAGE_ICONS: Record<string, LucideIcon> = {
  lightbulb: Lightbulb,
  code: Code,
  rocket: Rocket,
  'chart-line': ChartLine,
  crown: Crown,
  megaphone: Megaphone,
  building: Building,
  target: Target,
  zap: Zap
}

const cloneStateFromConfig = (state: StartupJourneyActivityProps['initialState']): StartupJourneyState => ({
  ...state,
  decisions: [...state.decisions],
  currentDecisionId: state.currentDecisionId ?? null
})

const mergeStartupState = (base: StartupJourneyState, override?: Partial<StartupJourneyState>): StartupJourneyState => {
  if (!override) {
    return {
      ...base,
      decisions: [...base.decisions]
    }
  }

  return {
    stage: override.stage ?? base.stage,
    funding: override.funding ?? base.funding,
    monthlyBurn: override.monthlyBurn ?? base.monthlyBurn,
    users: override.users ?? base.users,
    revenue: override.revenue ?? base.revenue,
    month: override.month ?? base.month,
    maxMonths: override.maxMonths ?? base.maxMonths,
    decisions: override.decisions ? [...override.decisions] : [...base.decisions],
    currentDecisionId: override.currentDecisionId ?? base.currentDecisionId,
    userGrowthRate: override.userGrowthRate ?? base.userGrowthRate,
    revenuePerUser: override.revenuePerUser ?? base.revenuePerUser,
    gameStatus: override.gameStatus ?? base.gameStatus
  }
}

export function StartupJourney({ activity, initialState, onStateChange }: StartupJourneyProps) {
  const baseState = useMemo(() => cloneStateFromConfig(activity.props.initialState), [activity.props.initialState])
  const [gameState, setGameState] = useState<StartupJourneyState>(() => mergeStartupState(baseState, initialState))
  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'warning' | 'error' | 'info'
  }>>([])
  const [showInstructions, setShowInstructions] = useState(false)
  const stageOrder = useMemo(() => activity.props.stages.map((stage) => stage.id), [activity.props.stages])
  const stageMap = useMemo(() => new Map(activity.props.stages.map((stage) => [stage.id, stage])), [activity.props.stages])
  const decisionMap = useMemo(() => new Map(activity.props.decisions.map((decision) => [decision.id, decision])), [activity.props.decisions])
  const decisionFlowMap = useMemo(
    () => new Map(activity.props.decisionFlow.map((flow) => [flow.stageId, flow.decisionIds])),
    [activity.props.decisionFlow]
  )
  const heroDescription = activity.description ?? activity.props.description
  const winConditions = activity.props.winConditions

  useEffect(() => {
    setGameState(mergeStartupState(baseState, initialState))
  }, [baseState, initialState])

  useEffect(() => {
    onStateChange?.(gameState)
  }, [gameState, onStateChange])

  const getStageBadgeClass = useCallback(
    (stageId: string) => stageMap.get(stageId)?.badgeClassName ?? 'bg-slate-100 text-slate-800 border-slate-300',
    [stageMap]
  )

  const advanceStage = useCallback(
    (currentStage: string) => {
      const index = stageOrder.indexOf(currentStage)
      if (index >= 0 && index < stageOrder.length - 1) {
        return stageOrder[index + 1]
      }
      return currentStage
    },
    [stageOrder]
  )

  const getNextDecisionId = useCallback(
    (stageId: string, completed: string[]) => {
      const flow = decisionFlowMap.get(stageId) ?? []
      return flow.find((decisionId) => !completed.includes(decisionId)) ?? null
    },
    [decisionFlowMap]
  )

  const calculateRunway = useCallback(() => {
    return gameState.monthlyBurn > 0 ? Math.floor(gameState.funding / gameState.monthlyBurn) : 999
  }, [gameState.funding, gameState.monthlyBurn])

  const currentDecision = gameState.currentDecisionId ? decisionMap.get(gameState.currentDecisionId) ?? null : null
  const stageInfo = stageMap.get(gameState.stage)
  const StageIconComponent = stageInfo ? STAGE_ICONS[stageInfo.icon] ?? Rocket : Rocket
  const stageBadgeClass = getStageBadgeClass(gameState.stage)
  const stageProgress = stageInfo?.progress ?? 0
  const successStageName = stageMap.get(winConditions.successStageId)?.name ?? winConditions.successStageId

  const addNotification = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const makeDecision = useCallback(
    (decisionId: string, optionId: string) => {
      const decision = decisionMap.get(decisionId)
      if (!decision) {
        return
      }

      const option = decision.options.find((opt) => opt.id === optionId)
      if (!option) {
        return
      }

      setGameState((prev) => {
        const newFunding = Math.max(0, prev.funding + (option.effects.funding ?? 0))
        const newBurn = Math.max(1000, prev.monthlyBurn + (option.effects.burn ?? 0))
        const newUsers = Math.max(0, prev.users + (option.effects.users ?? 0))
        const newRevenue = Math.max(0, prev.revenue + (option.effects.revenue ?? 0))
        const newGrowthRate = Math.max(0, prev.userGrowthRate + (option.effects.growth ?? 0))
        const newRevenuePerUser = Math.max(0, prev.revenuePerUser + (option.effects.revenuePerUser ?? 0))
        const updatedDecisions = prev.decisions.includes(decisionId) ? prev.decisions : [...prev.decisions, decisionId]

        let nextStage = prev.stage
        const stageFlow = decisionFlowMap.get(prev.stage) ?? []
        const completedStage = stageFlow.length === 0 || stageFlow.every((id) => updatedDecisions.includes(id))
        if (completedStage) {
          nextStage = advanceStage(prev.stage)
        }

        const nextDecisionId = getNextDecisionId(nextStage, updatedDecisions)

        return {
          ...prev,
          funding: newFunding,
          monthlyBurn: newBurn,
          users: newUsers,
          revenue: newRevenue,
          userGrowthRate: newGrowthRate,
          revenuePerUser: newRevenuePerUser,
          stage: nextStage,
          decisions: updatedDecisions,
          currentDecisionId: nextDecisionId
        }
      })

      addNotification(`Decision made: ${option.title}`, 'success')

      if (option.effects.funding) {
        addNotification(
          `Funding ${option.effects.funding > 0 ? 'increased' : 'decreased'} by $${Math.abs(option.effects.funding).toLocaleString()}`,
          option.effects.funding > 0 ? 'success' : 'warning'
        )
      }
      if (option.effects.users) {
        addNotification(
          `User base ${option.effects.users > 0 ? 'grew' : 'declined'} by ${Math.abs(option.effects.users)}`,
          option.effects.users > 0 ? 'success' : 'warning'
        )
      }
    },
    [advanceStage, addNotification, decisionFlowMap, decisionMap, getNextDecisionId]
  )

  const advanceMonth = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return

    setGameState((prev) => {
      const newMonth = prev.month + 1
      const userGrowth = Math.floor(prev.users * prev.userGrowthRate)
      const newUsers = prev.users + userGrowth
      const monthlyRevenue = Math.floor(newUsers * prev.revenuePerUser)
      const newRevenue = prev.revenue + monthlyRevenue
      const newFunding = Math.max(0, prev.funding - prev.monthlyBurn + monthlyRevenue)

      let newGameStatus = prev.gameStatus
      if (newFunding <= 0) {
        newGameStatus = 'lost'
        addNotification('Out of funding! Your startup has failed.', 'error')
      } else if (prev.stage === winConditions.successStageId || newRevenue >= winConditions.successRevenueTarget) {
        newGameStatus = 'won'
        addNotification('Congratulations! Your startup is successful!', 'success')
      } else {
        const timeLimit = Math.min(prev.maxMonths, winConditions.timeLimitMonths)
        if (newMonth >= timeLimit) {
          if (newRevenue >= winConditions.timeLimitRevenueTarget) {
            newGameStatus = 'won'
            addNotification("Time's up! Your startup achieved sustainable revenue!", 'success')
          } else {
            newGameStatus = 'lost'
            addNotification("Time's up! Your startup didn't achieve sufficient traction.", 'error')
          }
        }
      }

      if (userGrowth > 0) {
        addNotification(`User base grew by ${userGrowth} users`, 'success')
      }
      if (monthlyRevenue > 0) {
        addNotification(`Generated $${monthlyRevenue.toLocaleString()} in revenue`, 'success')
      }
      addNotification(`Monthly burn: $${prev.monthlyBurn.toLocaleString()}`, 'info')

      return {
        ...prev,
        month: newMonth,
        users: newUsers,
        revenue: newRevenue,
        funding: newFunding,
        gameStatus: newGameStatus
      }
    })
  }, [gameState.gameStatus, addNotification, winConditions])

  const resetGame = useCallback(() => {
    setGameState(cloneStateFromConfig(activity.props.initialState))
    setNotifications([])
    addNotification('Game reset successfully', 'info')
  }, [activity.props.initialState, addNotification])

  const runway = calculateRunway()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Rocket className="w-8 h-8 text-purple-600" />
            {activity.props.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {heroDescription}
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
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              {`How to Play ${activity.props.title}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objective */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">🎯 Objective</h4>
              <p className="text-purple-700">
                Build a successful tech startup over {winConditions.timeLimitMonths} months. Start with $
                {activity.props.initialState.funding.toLocaleString()} in funding, make strategic decisions to grow your user base,
                generate revenue, and manage your runway while progressing through each milestone.
              </p>
            </div>

            {/* Startup Stages */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">🚀 Startup Stages</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {activity.props.stages.map((stage) => {
                  const Icon = STAGE_ICONS[stage.icon] ?? Rocket
                  return (
                    <div key={stage.id} className="p-3 bg-white rounded-lg border text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5 text-purple-700" />
                      </div>
                      <h5 className="font-medium text-sm">{stage.name}</h5>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">📊 Key Metrics to Monitor</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded-lg border text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <h5 className="font-medium text-sm">Funding</h5>
                  <p className="text-xs text-gray-600">Cash available</p>
                </div>
                <div className="p-3 bg-white rounded-lg border text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                  </div>
                  <h5 className="font-medium text-sm">Burn Rate</h5>
                  <p className="text-xs text-gray-600">Monthly expenses</p>
                </div>
                <div className="p-3 bg-white rounded-lg border text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <h5 className="font-medium text-sm">Users</h5>
                  <p className="text-xs text-gray-600">Active user base</p>
                </div>
                <div className="p-3 bg-white rounded-lg border text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <h5 className="font-medium text-sm">Revenue</h5>
                  <p className="text-xs text-gray-600">Total generated</p>
                </div>
              </div>
            </div>

            {/* Decision Types */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">🎯 Strategic Decision Areas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-purple-700">Funding Decisions:</h5>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Bootstrap vs External investment</li>
                    <li>• Accelerator programs vs Angel investors</li>
                    <li>• Equity vs Debt financing</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-purple-700">Growth Strategies:</h5>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Team building and hiring priorities</li>
                    <li>• Product development vs Marketing focus</li>
                    <li>• Revenue models and monetization</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Success Conditions */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">🏆 Success Conditions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-800 mb-1">Victory Conditions</h5>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Reach &quot;{successStageName}&quot; stage</li>
                    <li>• Generate ${winConditions.successRevenueTarget.toLocaleString()}+ in total revenue</li>
                    <li>• Achieve ${winConditions.timeLimitRevenueTarget.toLocaleString()}+ revenue by month {winConditions.timeLimitMonths}</li>
                    <li>• Maintain positive cash flow</li>
                  </ul>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <h5 className="font-medium text-red-800 mb-1">Failure Conditions</h5>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Run out of funding (burn &gt; available cash)</li>
                    <li>• Fail to reach ${winConditions.timeLimitRevenueTarget.toLocaleString()} by month {winConditions.timeLimitMonths}</li>
                    <li>• Poor strategic decisions compound</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                {gameState.gameStatus === 'won' ? 'Startup Success!' : 'Startup Failed'}
              </h3>
            </div>
            <p className={`text-lg ${gameState.gameStatus === 'won' ? 'text-green-700' : 'text-red-700'}`}>
              {gameState.gameStatus === 'won' 
                ? `Congratulations! Your startup reached ${gameState.stage} stage with $${gameState.revenue.toLocaleString()} in revenue!`
                : `Your startup journey ended at ${gameState.stage} stage. Better luck next time!`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Startup Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-green-700 font-medium">Funding</p>
            <p className={`text-2xl font-bold ${gameState.funding >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              ${gameState.funding.toLocaleString()}
            </p>
            <p className="text-xs text-green-600">
              {runway} months runway
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm text-red-700 font-medium">Monthly Burn</p>
            <p className="text-2xl font-bold text-red-800">
              ${gameState.monthlyBurn.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700 font-medium">Users</p>
            <p className="text-2xl font-bold text-blue-800">
              {gameState.users.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600">
              +{(gameState.userGrowthRate * 100).toFixed(0)}% monthly
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-purple-700 font-medium">Revenue</p>
            <p className="text-2xl font-bold text-purple-800">
              ${gameState.revenue.toLocaleString()}
            </p>
            <p className="text-xs text-purple-600">
              ${gameState.revenuePerUser.toFixed(2)} per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Stage */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-full bg-white shadow-sm">
                <StageIconComponent className="w-6 h-6 text-purple-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                Current Stage: {stageInfo?.name ?? gameState.stage}
              </h3>
              <Badge className={stageBadgeClass}>
                Month {gameState.month}
              </Badge>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">Progress</span>
                <span className="text-sm text-slate-600">{stageProgress}%</span>
              </div>
              <Progress value={stageProgress} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Decision */}
      {currentDecision && gameState.gameStatus === 'playing' && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle role="heading" aria-level={3} className="text-xl text-blue-800 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Strategic Decision
            </CardTitle>
            <CardDescription className="text-blue-700">
              {currentDecision.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold text-blue-800 mb-4">{currentDecision.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentDecision.options.map((option) => (
                <Card key={option.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h5 className="font-medium text-slate-800 mb-2">{option.title}</h5>
                    <p className="text-sm text-slate-600 mb-4">{option.description}</p>
                    
                    {/* Effects Preview */}
                    <div className="space-y-1 mb-4">
                      {option.effects.funding && (
                        <div className="flex items-center gap-2 text-xs">
                          <DollarSign className="w-3 h-3" />
                          <span className={option.effects.funding > 0 ? 'text-green-600' : 'text-red-600'}>
                            {option.effects.funding > 0 ? '+' : ''}${option.effects.funding.toLocaleString()} funding
                          </span>
                        </div>
                      )}
                      {option.effects.burn && (
                        <div className="flex items-center gap-2 text-xs">
                          <TrendingUp className="w-3 h-3" />
                          <span className={option.effects.burn > 0 ? 'text-red-600' : 'text-green-600'}>
                            {option.effects.burn > 0 ? '+' : ''}${option.effects.burn.toLocaleString()} monthly burn
                          </span>
                        </div>
                      )}
                      {option.effects.users && (
                        <div className="flex items-center gap-2 text-xs">
                          <Users className="w-3 h-3" />
                          <span className={option.effects.users > 0 ? 'text-blue-600' : 'text-red-600'}>
                            {option.effects.users > 0 ? '+' : ''}{option.effects.users} users
                          </span>
                        </div>
                      )}
                      {option.effects.growth && (
                        <div className="flex items-center gap-2 text-xs">
                          <ChartLine className="w-3 h-3" />
                          <span className="text-purple-600">
                            {option.effects.growth > 0 ? '+' : ''}{(option.effects.growth * 100).toFixed(0)}% growth rate
                          </span>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => makeDecision(currentDecision.id, option.id)}
                      variant="outline"
                    >
                      Choose This Option
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={advanceMonth} 
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={gameState.gameStatus !== 'playing'}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Advance Month
        </Button>
        <Button 
          onClick={resetGame} 
          variant="outline" 
          size="lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Game
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
export default StartupJourney
