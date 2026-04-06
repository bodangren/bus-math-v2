'use client'

import { useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { buildPracticeSubmissionEnvelope, buildPracticeSubmissionParts, type PracticeSubmissionCallbackPayload } from '@/lib/practice/contract'
import {
  type LucideIcon,
  TrendingUp,
  User,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  ArrowRight,
  Rocket,
  Home,
  Megaphone,
  Wrench,
  Coffee,
  Heart
} from 'lucide-react'

// Types for the Growth Puzzle
export interface GrowthOption {
  id: string
  label: string
  amount: number
  type: 'reinvestment' | 'distribution'
  impact: string
  icon: string
}

export interface GrowthPuzzleProps {
  activity: {
    title?: string
    description?: string
    props: {
      totalProfit: number
      options: GrowthOption[]
      successMessage?: string
    }
  }
  onComplete?: (results: { selections: string[]; stats: { reinvestment: number; distribution: number } }) => void
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void
}

const ICON_MAP: Record<string, LucideIcon> = {
  rocket: Rocket,
  home: Home,
  megaphone: Megaphone,
  wrench: Wrench,
  coffee: Coffee,
  heart: Heart,
  trending: TrendingUp,
  user: User
}

export function GrowthPuzzle({ activity, onComplete, onSubmit }: GrowthPuzzleProps) {
  const { totalProfit, options, successMessage } = activity.props
  const [selections, setSelections] = useState<string[]>([])
  const [showInstructions, setShowInstructions] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const submittedRef = useRef(false)

  const remainingProfit = useMemo(() => {
    const spent = selections.reduce((sum, id) => {
      const option = options.find(o => o.id === id)
      return sum + (option?.amount || 0)
    }, 0)
    return totalProfit - spent
  }, [selections, options, totalProfit])

  const stats = useMemo(() => {
    let reinvestment = 0
    let distribution = 0
    selections.forEach(id => {
      const option = options.find(o => o.id === id)
      if (option?.type === 'reinvestment') reinvestment += option.amount
      else if (option?.type === 'distribution') distribution += option.amount
    })
    return { reinvestment, distribution }
  }, [selections, options])

  const handleToggleOption = (id: string) => {
    if (selections.includes(id)) {
      setSelections(prev => prev.filter(item => item !== id))
    } else {
      const option = options.find(o => o.id === id)
      if (option && option.amount <= remainingProfit) {
        setSelections(prev => [...prev, id])
      }
    }
  }

  const handleFinalize = () => {
    if (submittedRef.current) return
    submittedRef.current = true
    setIsComplete(true)
    onComplete?.({ selections, stats })

    if (onSubmit) {
      const answers: Record<string, unknown> = {
        totalProfit,
        reinvestment: stats.reinvestment,
        distribution: stats.distribution,
        selections: selections.join(', '),
        selectionCount: selections.length,
      }
      const parts = buildPracticeSubmissionParts(answers).map((part) => ({
        ...part,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }))
      const envelope = buildPracticeSubmissionEnvelope({
        activityId: 'growth-puzzle',
        mode: 'guided_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date(),
        answers,
        parts,
        artifact: {
          kind: 'growth_puzzle',
          title: activity.title ?? 'The Growth Puzzle',
          selections,
          stats,
          totalProfit,
          remainingProfit,
        },
        analytics: {
          reinvestmentRate: totalProfit > 0 ? stats.reinvestment / totalProfit : 0,
          distributionRate: totalProfit > 0 ? stats.distribution / totalProfit : 0,
          selectionCount: selections.length,
        },
      })
      onSubmit(envelope)
    }
  }

  const resetGame = () => {
    setSelections([])
    setIsComplete(false)
    submittedRef.current = false
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            {activity.title || 'The Growth Puzzle'}
          </CardTitle>
          <CardDescription className="text-lg">
            Sarah made <strong>${totalProfit.toLocaleString()}</strong> in profit this month. How should she use it?
          </CardDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Why this choice matters
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions */}
      {showInstructions && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-6 space-y-4">
            <p className="text-emerald-900 leading-relaxed font-medium text-lg">
              Profit is more than just &quot;extra cash.&quot; It is the fuel for a business.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
                <h4 className="font-bold text-emerald-700 flex items-center gap-2 mb-2">
                  <Rocket className="w-5 h-5" />
                  Option A: Reinvest
                </h4>
                <p className="text-sm text-slate-600">
                  Put money back into the business (better tools, more ads). This increases the **Business Value** (Equity).
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                <h4 className="font-bold text-blue-700 flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5" />
                  Option B: Distribute
                </h4>
                <p className="text-sm text-slate-600">
                  Sarah takes the money for personal needs (car repair, rent, a break). This is her reward for the risk she took.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profit Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-2 border-emerald-500 bg-emerald-600 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <TrendingUp className="w-24 h-24" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-80">Remaining Profit</p>
            <h3 className="text-5xl font-black mt-2">${remainingProfit.toLocaleString()}</h3>
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span>ALLOCATED</span>
                <span>{Math.round(((totalProfit - remainingProfit) / totalProfit) * 100)}%</span>
              </div>
              <Progress value={((totalProfit - remainingProfit) / totalProfit) * 100} className="h-3 bg-emerald-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-2 bg-slate-50 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase">Impact Visualization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <Rocket className="w-5 h-5" />
                  Business Value Growth
                </div>
                <div className="text-xl font-black text-emerald-600">+${stats.reinvestment.toLocaleString()}</div>
              </div>
              <Progress value={(stats.reinvestment / totalProfit) * 100} className="h-4 bg-slate-200" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2 font-bold text-blue-700">
                  <User className="w-5 h-5" />
                  Sarah&apos;s Personal Reward
                </div>
                <div className="text-xl font-black text-blue-600">+${stats.distribution.toLocaleString()}</div>
              </div>
              <Progress value={(stats.distribution / totalProfit) * 100} className="h-4 bg-slate-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          const Icon = ICON_MAP[option.icon] || HelpCircle
          const isSelected = selections.includes(option.id)
          const canAfford = isSelected || option.amount <= remainingProfit

          return (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                isSelected ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-md' : 
                !canAfford ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'
              }`}
              onClick={() => canAfford && handleToggleOption(option.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg ${option.type === 'reinvestment' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant={option.type === 'reinvestment' ? 'default' : 'secondary'} className={option.type === 'reinvestment' ? 'bg-emerald-600' : 'bg-blue-600'}>
                    ${option.amount.toLocaleString()}
                  </Badge>
                </div>
                <h4 className="font-black text-slate-900 text-lg mb-1">{option.label}</h4>
                <p className="text-xs text-slate-500 font-medium mb-4">{option.impact}</p>
                <div className="flex justify-end">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                    {isSelected && <Plus className="w-4 h-4 rotate-45" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col items-center gap-4 py-8 border-t">
        <Button 
          size="lg" 
          className="bg-emerald-600 hover:bg-emerald-700 px-12 h-16 text-xl font-black shadow-xl animate-bounce"
          disabled={selections.length === 0 || isComplete}
          onClick={handleFinalize}
        >
          Finalize Allocation
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
        <Button variant="ghost" onClick={resetGame} className="text-slate-400 underline uppercase tracking-widest text-[10px] font-bold">
          <RefreshCw className="w-3 h-3 mr-2" />
          Reset Profit
        </Button>
      </div>

      {/* Completion Overlay */}
      {isComplete && (
        <Card className="border-4 border-emerald-500 bg-white shadow-2xl animate-in zoom-in duration-300 fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-2xl mx-auto">
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-900">ALLOCATION COMPLETE!</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              {successMessage || "You've successfully allocated Sarah's profit. By choosing how to reinvest or distribute, you're directly impacting the company's Equity and Sarah's personal success. This is what 'Closing the Books' is all about!"}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase">Equity Gained</p>
                <p className="text-3xl font-black text-emerald-700">${stats.reinvestment.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase">Sarah&apos;s Reward</p>
                <p className="text-3xl font-black text-blue-700">${stats.distribution.toLocaleString()}</p>
              </div>
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
