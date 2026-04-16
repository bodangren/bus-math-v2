'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Clock,
  Wrench,
  TrendingDown,
  AlertTriangle,
  History,
  CheckCircle,
  Zap
} from 'lucide-react'

import type { Activity } from '@/lib/db/schema/validators'
import type { AssetTimeMachineActivityProps } from '@/types/activities'
import { buildPracticeSubmissionEnvelope, buildPracticeSubmissionParts, type PracticeSubmissionCallbackPayload } from '@/lib/practice/contract'

export type AssetTimeMachineActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'asset-time-machine'
  props: AssetTimeMachineActivityProps
}

export interface AssetYearScenario {
  year: number
  event: string
  repairCost: number
  upgradeCost: number
  impact: string
}

export interface AssetTimeMachineProps {
  activity: AssetTimeMachineActivity
  onComplete?: (results: AssetTimeMachineResult) => void
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void
}

interface AssetHistoryEntry {
  year: number
  action: 'repair' | 'upgrade' | 'ignore'
  cost: number
  value: number
}

interface AssetTimeMachineResult {
  totalExpenses: number
  finalValue: number
  history: AssetHistoryEntry[]
}

export function AssetTimeMachine({ activity, onComplete, onSubmit }: AssetTimeMachineProps) {
  const { assetName, initialCost, years, scenarios } = activity.props
  const [currentYear, setCurrentYear] = useState(0)
  const [currentValue, setCurrentValue] = useState(initialCost)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [history, setHistory] = useState<AssetHistoryEntry[]>([])
  const submittedRef = useRef(false)

  const currentScenario = scenarios.find(s => s.year === currentYear + 1)

  const handleAction = (type: 'repair' | 'upgrade' | 'ignore') => {
    if (submittedRef.current) return
    let cost = 0
    let valueImpact = -(currentValue * 0.2) // Natural aging

    if (type === 'repair' && currentScenario) {
      cost = currentScenario.repairCost
      valueImpact = -(currentValue * 0.05) // Repair slows decline
    } else if (type === 'upgrade' && currentScenario) {
      cost = currentScenario.upgradeCost
      valueImpact = currentValue * 0.1 // Upgrade boosts value
    } else if (type === 'ignore') {
      valueImpact = -(currentValue * 0.4) // Ignore accelerates decline
    }

    const nextValue = Math.max(0, currentValue + valueImpact)
    const nextYear = currentYear + 1

    const entry = {
      year: nextYear,
      action: type,
      cost,
      value: nextValue
    }

    const updatedTotalExpenses = totalExpenses + cost

    setHistory(prev => [...prev, entry])
    setTotalExpenses(updatedTotalExpenses)
    setCurrentValue(nextValue)
    
    if (nextYear >= years) {
      const result: AssetTimeMachineResult = { totalExpenses: updatedTotalExpenses, finalValue: nextValue, history: [...history, entry] }
      submittedRef.current = true
      setIsComplete(true)

      const answers = Object.fromEntries(
        result.history.map((h) => [h.year.toString(), h.action])
      )
      const parts = buildPracticeSubmissionParts(answers).map((part) => ({
        ...part,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }))

      const envelope = buildPracticeSubmissionEnvelope({
        activityId: activity.id ?? 'asset-time-machine',
        mode: 'guided_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date(),
        answers,
        parts,
        artifact: {
          kind: 'asset_time_machine',
          title: activity.props.title ?? 'The Asset Time-Machine',
          assetName: activity.props.assetName,
          initialCost: activity.props.initialCost,
          totalExpenses: result.totalExpenses,
          finalValue: result.finalValue,
          history: result.history,
        },
        analytics: {
          totalExpenses: result.totalExpenses,
          finalValue: result.finalValue,
          valueRetention: result.finalValue / activity.props.initialCost,
        },
      })

      try {
        onSubmit?.(envelope)
        onComplete?.(result)
      } catch (err) {
        console.error('AssetTimeMachine submission failed:', err)
        submittedRef.current = false
        setIsComplete(false)
      }
    } else {
      setCurrentYear(nextYear)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Clock className="w-8 h-8 text-blue-400" />
            {activity.props.title || 'The Asset Time-Machine'}
          </CardTitle>
          <CardDescription className="text-slate-400 text-lg">
            Sarah bought a <strong>{assetName}</strong> for <strong>${initialCost.toLocaleString()}</strong>. Let&apos;s see how it ages.
          </CardDescription>
        </CardHeader>
      </Card>

      {!isComplete && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-2 border-blue-500 bg-slate-50 shadow-inner">
            <CardContent className="p-6 text-center">
              <History className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Current Year</p>
              <h3 className="text-6xl font-black text-slate-900">{currentYear}</h3>
              <div className="mt-4">
                <Badge variant="outline" className="border-blue-200 text-blue-700">Timeline: {years} Years</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-2 border-emerald-500 bg-emerald-50">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-bold text-emerald-700 uppercase">Estimated Resale Value</p>
                <p className="text-4xl font-black text-emerald-600">${Math.round(currentValue).toLocaleString()}</p>
              </div>
              <Progress value={(currentValue / initialCost) * 100} className="h-4 bg-emerald-200" />
              <p className="mt-4 text-xs text-slate-500 italic">
                Value has dropped by ${Math.round(initialCost - currentValue).toLocaleString()} since purchase.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!isComplete && currentScenario && (
        <Card className="border-4 border-amber-400 bg-white animate-in slide-in-from-right duration-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Badge className="bg-amber-500">Year {currentYear + 1} Event</Badge>
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <CardTitle className="text-2xl mt-2">{currentScenario.event}</CardTitle>
            <CardDescription className="text-slate-600 italic">&quot;{currentScenario.impact}&quot;</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-1 border-2 border-blue-200 hover:bg-blue-50"
                onClick={() => handleAction('repair')}
              >
                <Wrench className="w-6 h-6 text-blue-500" />
                <span className="font-bold">Repair</span>
                <span className="text-xs text-slate-500">Cost: ${currentScenario.repairCost}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-1 border-2 border-emerald-200 hover:bg-emerald-50"
                onClick={() => handleAction('upgrade')}
              >
                <Zap className="w-6 h-6 text-emerald-500" />
                <span className="font-bold">Upgrade</span>
                <span className="text-xs text-slate-500">Cost: ${currentScenario.upgradeCost}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-1 border-2 border-red-200 hover:bg-red-50"
                onClick={() => handleAction('ignore')}
              >
                <TrendingDown className="w-6 h-6 text-red-500" />
                <span className="font-bold">Ignore</span>
                <span className="text-xs text-slate-500">Cost: $0</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isComplete && (
        <Card className="border-4 border-blue-600 bg-white shadow-2xl animate-in zoom-in duration-300">
          <CardContent className="p-10 text-center space-y-6">
            <CheckCircle className="w-20 h-20 text-blue-600 mx-auto" />
            <h2 className="text-4xl font-black text-slate-900">TIMELINE ENDED</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              After {years} years, Sarah&apos;s <strong>{assetName}</strong> is worth <strong>${Math.round(currentValue).toLocaleString()}</strong>.
              You spent a total of <strong>${totalExpenses.toLocaleString()}</strong> on maintenance.
            </p>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left">
              <h4 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-widest">Year-by-Year Breakdown</h4>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between text-sm border-b pb-1">
                    <span className="font-bold text-slate-500">Year {h.year}</span>
                    <span className="capitalize text-slate-700">{h.action} (${h.cost})</span>
                    <span className="font-black text-emerald-600">${Math.round(h.value).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-500 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <strong>The Accounting Lesson:</strong> Even if you didn&apos;t spend cash every year, the server &quot;cost&quot; Sarah money by losing value. 
              In accounting, we call this <strong>Depreciation</strong>—spreading the cost over the life of the asset.
            </p>

            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full h-14 text-xl" onClick={() => {
              submittedRef.current = false
              setIsComplete(false)
              setCurrentYear(0)
              setCurrentValue(initialCost)
              setTotalExpenses(0)
              setHistory([])
            }}>
              Back to Lesson
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
