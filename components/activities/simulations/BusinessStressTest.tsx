'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  Zap,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Skull,
  Activity,
  DollarSign,
  ShieldCheck
} from 'lucide-react'

import { buildPracticeSubmissionEnvelope, buildPracticeSubmissionParts, type PracticeSubmissionCallbackPayload } from '@/lib/practice/contract'

export interface Disaster {
  id: string
  label: string
  impact: {
    revenue?: number
    expenses?: number
    cash?: number
  }
  message: string
}

export interface BusinessStressTestProps {
  activity: {
    id?: string
    title?: string
    description?: string
    props: {
      initialState: {
        cash: number
        revenue: number
        expenses: number
      }
      disasters: Disaster[]
    }
  }
  onComplete?: (results: { finalCash: number; roundsSurvived: number }) => void
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void
}

export function BusinessStressTest({ activity, onComplete, onSubmit }: BusinessStressTestProps) {
  const { initialState, disasters } = activity.props
  const [cash, setCash] = useState(initialState.cash)
  const [revenue, setRevenue] = useState(initialState.revenue)
  const [expenses, setExpenses] = useState(initialState.expenses)
  const [round, setRound] = useState(0)
  const [activeDisaster, setActiveDisaster] = useState<Disaster | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const profit = revenue - expenses

  const handleNextRound = () => {
    if (submitted) return
    if (round >= disasters.length) {
      setSubmitted(true)
      const finalCash = cash
      const roundsSurvived = round
      setIsComplete(true)

      const answers: Record<string, unknown> = {
        finalCash,
        roundsSurvived,
        survivedAll: roundsSurvived >= disasters.length,
      }
      const parts = buildPracticeSubmissionParts(answers).map((part) => ({
        ...part,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }))

      const envelope = buildPracticeSubmissionEnvelope({
        activityId: activity.id ?? 'business-stress-test',
        mode: 'guided_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date(),
        answers,
        parts,
        artifact: {
          kind: 'business_stress_test',
          title: activity.title ?? 'Business Stress Test',
          finalCash,
          roundsSurvived,
          totalRounds: disasters.length,
          survivedAll: roundsSurvived >= disasters.length,
        },
        analytics: {
          finalCash,
          roundsSurvived,
          survivalRate: roundsSurvived / disasters.length,
        },
      })

      onSubmit?.(envelope)
      onComplete?.({ finalCash, roundsSurvived })
      return
    }

    const disaster = disasters[round]
    setActiveDisaster(disaster)
    
    setCash(prev => prev + profit + (disaster.impact.cash || 0))
    setRevenue(prev => Math.max(0, prev + (disaster.impact.revenue || 0)))
    setExpenses(prev => Math.max(0, prev + (disaster.impact.expenses || 0)))
    
    setRound(prev => prev + 1)
  }

  const adjustStats = (type: 'price' | 'volume' | 'staff') => {
    if (type === 'price') {
      // Raising price increases revenue but might hurt volume later (simplified here)
      setRevenue(prev => prev * 1.1)
    } else if (type === 'volume') {
      // Selling more increases revenue but also some expenses
      setRevenue(prev => prev * 1.15)
      setExpenses(prev => prev * 1.05)
    } else if (type === 'staff') {
      // Cutting staff reduces expenses but hurts revenue capacity
      setExpenses(prev => prev * 0.8)
      setRevenue(prev => prev * 0.9)
    }
    setActiveDisaster(null)
  }

  useEffect(() => {
    if (cash <= 0 && !isGameOver && !submitted) {
      setIsGameOver(true)
      setSubmitted(true)

      const answers: Record<string, unknown> = {
        finalCash: 0,
        roundsSurvived: round,
        survivedAll: false,
      }
      const parts = buildPracticeSubmissionParts(answers).map((part) => ({
        ...part,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }))

      const envelope = buildPracticeSubmissionEnvelope({
        activityId: activity.id ?? 'business-stress-test',
        mode: 'guided_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date(),
        answers,
        parts,
        artifact: {
          kind: 'business_stress_test',
          title: activity.title ?? 'Business Stress Test',
          finalCash: 0,
          roundsSurvived: round,
          totalRounds: disasters.length,
          survivedAll: false,
        },
        analytics: {
          finalCash: 0,
          roundsSurvived: round,
          survivalRate: round / disasters.length,
        },
      })

      onSubmit?.(envelope)
      onComplete?.({ finalCash: 0, roundsSurvived: round })
    }
  }, [cash, isGameOver, submitted, round, activity, disasters.length, onSubmit, onComplete])

  const reset = () => {
    setCash(initialState.cash)
    setRevenue(initialState.revenue)
    setExpenses(initialState.expenses)
    setRound(0)
    setActiveDisaster(null)
    setIsGameOver(false)
    setIsComplete(false)
    setSubmitted(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <Card className="bg-gradient-to-r from-red-900 via-slate-900 to-red-900 text-white border-0 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <Activity className="w-full h-full" />
        </div>
        <CardHeader className="text-center relative z-10">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-yellow-400" />
            {activity.title || 'Business Stress-Test'}
          </CardTitle>
          <CardDescription className="text-red-200 text-lg font-bold uppercase tracking-tighter">
            Panic Mode: Can Sarah&apos;s Business Survive the Market?
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`border-2 ${cash < 1000 ? 'border-red-500 bg-red-50 animate-pulse' : 'border-slate-200 bg-slate-900 text-white'}`}>
          <CardContent className="p-6 text-center">
            <p className="text-xs font-black uppercase tracking-widest opacity-60">Cash Runway</p>
            <h3 className={`text-5xl font-black mt-2 ${cash < 1000 ? 'text-red-600' : 'text-emerald-400'}`}>
              ${Math.round(cash).toLocaleString()}
            </h3>
            {cash < 1000 && <Badge variant="destructive" className="mt-2">CRITICAL LOW</Badge>}
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 bg-white shadow-inner">
          <CardContent className="p-6 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly Revenue</p>
            <h3 className="text-4xl font-black text-slate-900 mt-2">${Math.round(revenue).toLocaleString()}</h3>
            <div className="flex justify-center mt-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 bg-white shadow-inner">
          <CardContent className="p-6 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly Expenses</p>
            <h3 className="text-4xl font-black text-slate-900 mt-2">${Math.round(expenses).toLocaleString()}</h3>
            <div className="flex justify-center mt-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {!isGameOver && !isComplete && (
        <div className="space-y-6">
          {!activeDisaster ? (
            <div className="text-center py-10">
              <Button 
                size="lg" 
                className="h-24 px-12 text-2xl font-black bg-slate-900 hover:bg-red-600 transition-colors shadow-2xl group"
                onClick={handleNextRound}
              >
                Trigger Next Crisis
                <AlertTriangle className="w-8 h-8 ml-4 group-hover:animate-bounce" />
              </Button>
              <p className="mt-4 text-slate-400 font-medium">Round {round + 1} of {disasters.length}</p>
            </div>
          ) : (
            <Card className="border-4 border-red-600 bg-white animate-in zoom-in duration-300">
              <CardHeader className="bg-red-600 text-white rounded-t-sm">
                <div className="flex justify-between items-center">
                  <Badge className="bg-white text-red-600 font-black">EMERGENCY</Badge>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl mt-2">{activeDisaster.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-xl font-medium text-slate-700 italic border-l-4 border-red-200 pl-4 mb-8">
                  &quot;{activeDisaster.message}&quot;
                </p>

                <h4 className="font-black text-slate-900 mb-4 uppercase tracking-tighter">Choose Your Response Lever:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                    onClick={() => adjustStats('price')}
                  >
                    <DollarSign className="w-6 h-6 mb-1 text-emerald-600" />
                    <span className="font-bold">Raise Prices</span>
                    <span className="text-[10px] uppercase opacity-60">+10% Revenue</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50"
                    onClick={() => adjustStats('volume')}
                  >
                    <TrendingUp className="w-6 h-6 mb-1 text-blue-600" />
                    <span className="font-bold">Aggressive Sales</span>
                    <span className="text-[10px] uppercase opacity-60">+15% Rev / +5% Exp</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50"
                    onClick={() => adjustStats('staff')}
                  >
                    <TrendingDown className="w-6 h-6 mb-1 text-orange-600" />
                    <span className="font-bold">Cut Overhead</span>
                    <span className="text-[10px] uppercase opacity-60">-20% Exp / -10% Rev</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isGameOver && (
        <Card className="border-4 border-black bg-slate-100 animate-in shake duration-500">
          <CardContent className="p-10 text-center space-y-6">
            <Skull className="w-20 h-20 text-slate-900 mx-auto" />
            <h2 className="text-4xl font-black text-slate-900">BANKRUPT!</h2>
            <p className="text-xl text-slate-600 max-w-xl mx-auto font-medium">
              Sarah&apos;s cash hit zero. In the real world, this is where the story ends.
              A linked financial model helps you see these disasters coming before they hit!
            </p>
            <Button size="lg" className="bg-slate-900 px-10 h-14 text-xl" onClick={reset}>
              <RotateCcw className="w-5 h-5 mr-2" />
              Restart Test
            </Button>
          </CardContent>
        </Card>
      )}

      {isComplete && (
        <Card className="border-4 border-emerald-500 bg-white shadow-2xl animate-in zoom-in duration-300">
          <CardContent className="p-10 text-center space-y-6">
            <ShieldCheck className="w-20 h-20 text-emerald-500 mx-auto" />
            <h2 className="text-4xl font-black text-slate-900">TEST PASSED!</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Sarah&apos;s business survived all {disasters.length} market crises with <strong>${Math.round(cash).toLocaleString()}</strong> in the bank.
              You proved that with the right levers, a business can weather almost any storm.
            </p>
            
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <p className="text-sm font-bold text-emerald-800 uppercase mb-2">The Integrated Model Lesson</p>
              <p className="text-sm text-emerald-700">
                You just experienced why we link everything. One change in <strong>Revenue</strong> ripples into <strong>Cash</strong>, 
                and one change in <strong>Expenses</strong> impacts <strong>Equity</strong>. This is the power of a fully integrated model.
              </p>
            </div>

            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 w-full h-14 text-xl" onClick={() => setIsComplete(false)}>
              Back to Lesson
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
