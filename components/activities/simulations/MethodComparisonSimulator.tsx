'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, ArrowRight, Lightbulb } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface ComparisonScenario { id: string; name: string; cost: number; usefulLife: number; salvageValue: number; unitCost?: number; totalUnits?: number; unitsYear1?: number }

const defaultScenarios: ComparisonScenario[] = [
  { id: 'M-001', name: 'Delivery Truck', cost: 40000, usefulLife: 5, salvageValue: 5000 },
  { id: 'M-002', name: 'Printing Press', cost: 25000, usefulLife: 8, salvageValue: 2500 },
  { id: 'M-003', name: 'Forklift', cost: 18000, usefulLife: 6, salvageValue: 3000, totalUnits: 20000, unitsYear1: 4500 },
]

function computeSL(cost: number, salvage: number, life: number) { if (life <= 0) return 0; return Math.round((cost - salvage) / life) }
function computeDDB(cost: number, salvage: number, life: number) { if (life <= 0) return 0; const bv = cost; const expense = Math.round(bv * (2 / life)); return Math.min(expense, cost - salvage) }
function computeUOP(cost: number, salvage: number, totalUnits: number, unitsYear1: number) { if (totalUnits <= 0) return 0; return Math.round(((cost - salvage) / totalUnits) * unitsYear1) }

export interface MethodComparisonSimulatorProps {
  activity: { id?: string; props?: { scenarios?: ComparisonScenario[] } }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function MethodComparisonSimulator({ activity, onSubmit, onComplete }: MethodComparisonSimulatorProps) {
  const scenarios = activity.props?.scenarios ?? defaultScenarios
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [userSL, setUserSL] = useState('')
  const [userDDB, setUserDDB] = useState('')
  const [userUOP, setUserUOP] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showReveal, setShowReveal] = useState(false)

  const asset = scenarios[scenarioIndex]
  const correctSL = computeSL(asset.cost, asset.salvageValue, asset.usefulLife)
  const correctDDB = computeDDB(asset.cost, asset.salvageValue, asset.usefulLife)
  const correctUOP = asset.totalUnits && asset.unitsYear1 ? computeUOP(asset.cost, asset.salvageValue, asset.totalUnits, asset.unitsYear1) : null
  const slNum = parseFloat(userSL)
  const ddbNum = parseFloat(userDDB)
  const uopNum = parseFloat(userUOP)
  const slCorrect = !isNaN(slNum) && Math.abs(slNum - correctSL) < 1
  const ddbCorrect = !isNaN(ddbNum) && Math.abs(ddbNum - correctDDB) < 1
  const uopCorrect = correctUOP !== null ? (!isNaN(uopNum) && Math.abs(uopNum - correctUOP) < 1) : true

  const handleReset = () => { setUserSL(''); setUserDDB(''); setUserUOP(''); setSubmitted(false); setShowReveal(false) }

  const handleSubmit = useCallback(() => {
    if (isNaN(slNum) || isNaN(ddbNum) || (correctUOP !== null && isNaN(uopNum))) return
    setSubmitted(true)
    onSubmit?.(
      buildSimulationSubmissionEnvelope({
        activityId: activity.id ?? 'method-comparison-simulator',
        mode: 'independent_practice',
        answers: { sl: slNum, ddb: ddbNum, uop: uopNum, slCorrect, ddbCorrect, uopCorrect },
        parts: [createSimulationPart('sl-year1', slNum, { isCorrect: slCorrect }), createSimulationPart('ddb-year1', ddbNum, { isCorrect: ddbCorrect })],
        artifact: { assetName: asset.name, cost: asset.cost, salvageValue: asset.salvageValue, usefulLife: asset.usefulLife, correctSL, correctDDB, correctUOP },
      }),
    )
  }, [slNum, ddbNum, uopNum, slCorrect, ddbCorrect, uopCorrect, onSubmit, activity.id, asset, correctSL, correctDDB, correctUOP])

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader><CardTitle className="text-blue-900">Method Comparison — Side-by-Side</CardTitle><CardDescription className="text-blue-700">Compare Year 1 depreciation expense under different methods.</CardDescription></CardHeader>
        <CardContent><div className="flex flex-wrap gap-2">{scenarios.map((a, i) => (<Button key={a.id} variant={i === scenarioIndex ? 'default' : 'outline'} onClick={() => { setScenarioIndex(i); handleReset() }}>{a.name}</Button>))}</div></CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-slate-900">{asset.name}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><Label className="text-slate-500">Cost</Label><p className="font-semibold">${asset.cost.toLocaleString()}</p></div>
            <div><Label className="text-slate-500">Life</Label><p className="font-semibold">{asset.usefulLife} years</p></div>
            <div><Label className="text-slate-500">Salvage</Label><p className="font-semibold">${asset.salvageValue.toLocaleString()}</p></div>
            {asset.totalUnits && <div><Label className="text-slate-500">Total Units</Label><p className="font-semibold">{asset.totalUnits.toLocaleString()}</p></div>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader><CardTitle className="text-amber-900 flex items-center gap-2"><Lightbulb className="h-5 w-5" />Predict Year 1 Expense</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>SL Year 1 ($)</Label><Input type="number" placeholder="SL" value={userSL} onChange={e => setUserSL(e.target.value)} disabled={submitted} /></div>
            <div className="space-y-2"><Label>DDB Year 1 ($)</Label><Input type="number" placeholder="DDB" value={userDDB} onChange={e => setUserDDB(e.target.value)} disabled={submitted} /></div>
            {correctUOP !== null && <div className="space-y-2"><Label>UOP Year 1 ($)</Label><Input type="number" placeholder="UOP" value={userUOP} onChange={e => setUserUOP(e.target.value)} disabled={submitted} /></div>}
          </div>
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={!userSL || !userDDB || (correctUOP !== null && !userUOP)} className="bg-amber-700 hover:bg-amber-800">Check Answers</Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">{slCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}<span className={slCorrect ? 'text-green-700' : 'text-red-700'}>SL: {slCorrect ? 'Correct!' : `$${userSL} → $${correctSL}`}</span></div>
              <div className="flex items-center gap-2">{ddbCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}<span className={ddbCorrect ? 'text-green-700' : 'text-red-700'}>DDB: {ddbCorrect ? 'Correct!' : `$${userDDB} → $${correctDDB}`}</span></div>
              {correctUOP !== null && <div className="flex items-center gap-2">{uopCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}<span className={uopCorrect ? 'text-green-700' : 'text-red-700'}>UOP: {uopCorrect ? 'Correct!' : `$${userUOP} → $${correctUOP}`}</span></div>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>Try Again</Button>
                <Button onClick={() => setShowReveal(true)} className="bg-blue-700">Why These Numbers? <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showReveal && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader><CardTitle className="text-green-900">Explanations</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>SL:</strong> (${asset.cost.toLocaleString()} − ${asset.salvageValue.toLocaleString()}) / {asset.usefulLife} = ${correctSL}/year</p>
            <p><strong>DDB:</strong> ${asset.cost.toLocaleString()} × (2 / {asset.usefulLife}) = ${correctDDB} in Year 1</p>
            {correctUOP !== null && <p><strong>UOP:</strong> ((${asset.cost.toLocaleString()} − ${asset.salvageValue.toLocaleString()}) / {asset.totalUnits}) × {asset.unitsYear1} = ${correctUOP}</p>}
            <Button variant="outline" className="mt-4" onClick={() => { handleReset(); onComplete?.() }}>Try Another Asset</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
