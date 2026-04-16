'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Table2 } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface AssetScenario { id: string; name: string; cost: number; usefulLife: number; salvageValue: number }
interface ScheduleRow { year: number; slExpense: number; slAccumDep: number; slBookValue: number; ddbExpense: number; ddbAccumDep: number; ddbBookValue: number }

const scenarios: AssetScenario[] = [
  { id: 'A-001', name: 'Delivery Van', cost: 30000, usefulLife: 5, salvageValue: 5000 },
  { id: 'A-002', name: '3D Printer', cost: 15000, usefulLife: 4, salvageValue: 1500 },
  { id: 'A-003', name: 'Server Rack', cost: 8000, usefulLife: 3, salvageValue: 800 },
]

function calculateComparison(asset: AssetScenario): ScheduleRow[] {
  if (asset.usefulLife <= 0) return []
  const slAnnual = (asset.cost - asset.salvageValue) / asset.usefulLife
  const ddbRate = 2 / asset.usefulLife
  const rows: ScheduleRow[] = []
  let slAccum = 0, ddbAccum = 0, ddbBV = asset.cost
  for (let year = 1; year <= asset.usefulLife; year++) {
    slAccum += slAnnual
    let ddbExpense = ddbBV * ddbRate
    if (ddbBV - ddbExpense < asset.salvageValue) ddbExpense = ddbBV - asset.salvageValue
    ddbAccum += ddbExpense; ddbBV -= ddbExpense
    rows.push({ year, slExpense: Math.round(slAnnual * 100) / 100, slAccumDep: Math.round(slAccum * 100) / 100, slBookValue: Math.round((asset.cost - slAccum) * 100) / 100, ddbExpense: Math.round(ddbExpense * 100) / 100, ddbAccumDep: Math.round(ddbAccum * 100) / 100, ddbBookValue: Math.round(ddbBV * 100) / 100 })
  }
  return rows
}

export interface DepreciationMethodComparisonSimulatorProps {
  activity: { id?: string; props?: { scenarios?: AssetScenario[] } }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function DepreciationMethodComparisonSimulator({ activity, onSubmit, onComplete }: DepreciationMethodComparisonSimulatorProps) {
  const assetList = activity.props?.scenarios ?? scenarios
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [userYear1SL, setUserYear1SL] = useState('')
  const [userYear1DDB, setUserYear1DDB] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submittedRef = useRef(false)
  const [showReveal, setShowReveal] = useState(false)
  const [stage, setStage] = useState<'predict' | 'compare' | 'audit'>('predict')

  const asset = assetList[scenarioIndex]
  const schedule = calculateComparison(asset)
  const correctSL = schedule[0]?.slExpense ?? 0
  const correctDDB = schedule[0]?.ddbExpense ?? 0
  const slNum = parseFloat(userYear1SL)
  const ddbNum = parseFloat(userYear1DDB)
  const slCorrect = !isNaN(slNum) && Math.abs(slNum - correctSL) < 1
  const ddbCorrect = !isNaN(ddbNum) && Math.abs(ddbNum - correctDDB) < 1

  const handleReset = () => { setUserYear1SL(''); setUserYear1DDB(''); setSubmitted(false); submittedRef.current = false; setShowReveal(false) }
  const handleSubmit = useCallback(() => {
    if (submittedRef.current) return
    if (isNaN(slNum) || isNaN(ddbNum)) return
    submittedRef.current = true
    setSubmitted(true)
    try {
      onSubmit?.(
        buildSimulationSubmissionEnvelope({
          activityId: activity.id ?? 'depreciation-method-comparison',
          mode: 'independent_practice',
          answers: { slYear1: slNum, ddbYear1: ddbNum, slCorrect, ddbCorrect },
          parts: [createSimulationPart('sl-year1', slNum, { isCorrect: slCorrect }), createSimulationPart('ddb-year1', ddbNum, { isCorrect: ddbCorrect })],
          artifact: { assetName: asset.name, cost: asset.cost, salvageValue: asset.salvageValue, usefulLife: asset.usefulLife, schedule },
        }),
      )
    } catch (err) {
      console.error('DepreciationMethodComparisonSimulator submission failed:', err)
      submittedRef.current = false
      setSubmitted(false)
    }
  }, [slNum, ddbNum, slCorrect, ddbCorrect, onSubmit, activity.id, asset, schedule])

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2"><Table2 className="h-5 w-5" />Choose an Asset to Compare</CardTitle>
          <CardDescription className="text-blue-700">Pick an asset. You will compare SL and DDB depreciation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {assetList.map((a, i) => (
              <Button key={a.id} variant={i === scenarioIndex ? 'default' : 'outline'} onClick={() => { setScenarioIndex(i); handleReset() }} className={i === scenarioIndex ? 'bg-blue-700' : ''}>{a.name}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-slate-900">Asset Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><Label className="text-slate-500">Cost</Label><p className="font-semibold">${asset.cost.toLocaleString()}</p></div>
            <div><Label className="text-slate-500">Useful Life</Label><p className="font-semibold">{asset.usefulLife} years</p></div>
            <div><Label className="text-slate-500">Salvage Value</Label><p className="font-semibold">${asset.salvageValue.toLocaleString()}</p></div>
          </div>
        </CardContent>
      </Card>

      {stage === 'predict' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2"><Lightbulb className="h-5 w-5" />Predict Year 1 Expense for Both Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SL Year 1 Expense ($)</Label>
                <p className="text-xs text-slate-500">(Cost − Salvage) / Life</p>
                <Input type="number" placeholder="Enter prediction" value={userYear1SL} onChange={e => setUserYear1SL(e.target.value)} disabled={submitted} />
              </div>
              <div className="space-y-2">
                <Label>DDB Year 1 Expense ($)</Label>
                <p className="text-xs text-slate-500">Cost × (2 / Life)</p>
                <Input type="number" placeholder="Enter prediction" value={userYear1DDB} onChange={e => setUserYear1DDB(e.target.value)} disabled={submitted} />
              </div>
            </div>
            {!submitted ? (
              <Button onClick={handleSubmit} disabled={!userYear1SL || !userYear1DDB} className="bg-amber-700 hover:bg-amber-800">Submit Predictions</Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">{slCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}<span className={slCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>SL: {slCorrect ? 'Correct!' : `$${userYear1SL} → Correct: $${correctSL}`}</span></div>
                <div className="flex items-center gap-2">{ddbCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}<span className={ddbCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>DDB: {ddbCorrect ? 'Correct!' : `$${userYear1DDB} → Correct: $${correctDDB}`}</span></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset}>Try Again</Button>
                  <Button onClick={() => { setShowReveal(true); setStage('compare') }} className="bg-blue-700">See Full Comparison <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {stage === 'compare' && showReveal && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader><CardTitle className="text-green-900">Side-by-Side Comparison Schedule</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="bg-green-100"><th className="border p-2">Year</th><th className="border p-2 text-right">SL Expense</th><th className="border p-2 text-right">SL BV</th><th className="border p-2 text-right">DDB Expense</th><th className="border p-2 text-right">DDB BV</th></tr></thead>
                <tbody>{schedule.map(row => (<tr key={row.year}><td className="border p-2">{row.year}</td><td className="border p-2 text-right">${row.slExpense.toLocaleString()}</td><td className="border p-2 text-right">${row.slBookValue.toLocaleString()}</td><td className="border p-2 text-right">${row.ddbExpense.toLocaleString()}</td><td className="border p-2 text-right">${row.ddbBookValue.toLocaleString()}</td></tr>))}</tbody>
              </table>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => { setStage('predict'); handleReset() }}>Try Another</Button>
              <Button onClick={() => setStage('audit')} className="bg-purple-700">Audit Check <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {stage === 'audit' && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader><CardTitle className="text-purple-900">Audit Check — What Could Go Wrong?</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <ul className="list-disc list-inside space-y-1">
              <li>DDB can drive book value below salvage without a floor cap</li>
              <li>DDB applies rate to book value, not depreciable base</li>
              <li>Both methods must reach the same salvage value</li>
            </ul>
            <Button variant="outline" onClick={() => { setStage('predict'); handleReset(); onComplete?.() }}>Practice Another Asset</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
