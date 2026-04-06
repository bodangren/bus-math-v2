'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Table2 } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface AssetInput { id: string; name: string; cost: number; usefulLife: number; salvageValue: number; method: 'SL' | 'DDB' }
interface ScheduleRow { year: number; annualExpense: number; accumulatedDepreciation: number; bookValue: number }

const sampleAssets: AssetInput[] = [
  { id: 'A-001', name: 'Delivery Van', cost: 30000, usefulLife: 5, salvageValue: 5000, method: 'SL' },
  { id: 'A-002', name: '3D Printer', cost: 15000, usefulLife: 4, salvageValue: 1500, method: 'SL' },
  { id: 'A-003', name: 'Server Rack', cost: 8000, usefulLife: 3, salvageValue: 800, method: 'DDB' },
]

function calculateSL(cost: number, salvageValue: number, usefulLife: number): ScheduleRow[] {
  if (usefulLife <= 0) return []
  const annualExpense = (cost - salvageValue) / usefulLife
  const rows: ScheduleRow[] = []; let accum = 0
  for (let year = 1; year <= usefulLife; year++) { accum += annualExpense; rows.push({ year, annualExpense: Math.round(annualExpense * 100) / 100, accumulatedDepreciation: Math.round(accum * 100) / 100, bookValue: Math.round((cost - accum) * 100) / 100 }) }
  return rows
}

function calculateDDB(cost: number, salvageValue: number, usefulLife: number): ScheduleRow[] {
  if (usefulLife <= 0) return []
  const rate = 2 / usefulLife; const rows: ScheduleRow[] = []; let accum = 0; let bv = cost
  for (let year = 1; year <= usefulLife; year++) { let expense = bv * rate; if (bv - expense < salvageValue) expense = bv - salvageValue; accum += expense; bv -= expense; rows.push({ year, annualExpense: Math.round(expense * 100) / 100, accumulatedDepreciation: Math.round(accum * 100) / 100, bookValue: Math.round(bv * 100) / 100 }) }
  return rows
}

export interface AssetRegisterSimulatorProps {
  activity: { id?: string; props?: { assets?: AssetInput[] } }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function AssetRegisterSimulator({ activity, onSubmit, onComplete }: AssetRegisterSimulatorProps) {
  const assets = activity.props?.assets ?? sampleAssets
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0)
  const [userAnnualExpense, setUserAnnualExpense] = useState('')
  const [userYear3BV, setUserYear3BV] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  const [stage, setStage] = useState<'predict' | 'calculate' | 'audit'>('predict')

  const asset = assets[selectedAssetIndex]
  const correctSchedule = asset.method === 'SL' ? calculateSL(asset.cost, asset.salvageValue, asset.usefulLife) : calculateDDB(asset.cost, asset.salvageValue, asset.usefulLife)
  const correctAnnualExpense = correctSchedule[0]?.annualExpense ?? 0
  const correctYear3BV = correctSchedule[2]?.bookValue ?? 0
  const annualExpenseNum = parseFloat(userAnnualExpense)
  const year3BVNum = parseFloat(userYear3BV)
  const annualExpenseCorrect = !isNaN(annualExpenseNum) && Math.abs(annualExpenseNum - correctAnnualExpense) < 1
  const year3BVCorrect = !isNaN(year3BVNum) && Math.abs(year3BVNum - correctYear3BV) < 1

  const handleReset = () => { setUserAnnualExpense(''); setUserYear3BV(''); setSubmitted(false); setShowReveal(false) }

  const handleSubmit = useCallback(() => {
    if (isNaN(annualExpenseNum) || isNaN(year3BVNum)) return
    setSubmitted(true)
    onSubmit?.(
      buildSimulationSubmissionEnvelope({
        activityId: activity.id ?? 'asset-register-simulator',
        mode: 'independent_practice',
        answers: { annualExpense: annualExpenseNum, year3BV: year3BVNum, annualExpenseCorrect, year3BVCorrect },
        parts: [createSimulationPart('annual-expense', annualExpenseNum, { isCorrect: annualExpenseCorrect }), createSimulationPart('year3-bv', year3BVNum, { isCorrect: year3BVCorrect })],
        artifact: { assetName: asset.name, cost: asset.cost, method: asset.method, schedule: correctSchedule },
      }),
    )
  }, [annualExpenseNum, year3BVNum, annualExpenseCorrect, year3BVCorrect, onSubmit, activity.id, asset, correctSchedule])

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader><CardTitle className="text-blue-900 flex items-center gap-2"><Table2 className="h-5 w-5" />Choose an Asset</CardTitle></CardHeader>
        <CardContent><div className="flex flex-wrap gap-2">{assets.map((a, i) => (<Button key={a.id} variant={i === selectedAssetIndex ? 'default' : 'outline'} onClick={() => { setSelectedAssetIndex(i); handleReset() }} className={i === selectedAssetIndex ? 'bg-blue-700' : ''}>{a.name} ({a.method})</Button>))}</div></CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-slate-900">Asset Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div><Label className="text-slate-500">Cost</Label><p className="font-semibold">${asset.cost.toLocaleString()}</p></div>
            <div><Label className="text-slate-500">Useful Life</Label><p className="font-semibold">{asset.usefulLife} years</p></div>
            <div><Label className="text-slate-500">Salvage</Label><p className="font-semibold">${asset.salvageValue.toLocaleString()}</p></div>
            <div><Label className="text-slate-500">Method</Label><Badge>{asset.method === 'SL' ? 'Straight-Line' : 'DDB'}</Badge></div>
          </div>
        </CardContent>
      </Card>

      {stage === 'predict' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader><CardTitle className="text-amber-900 flex items-center gap-2"><Lightbulb className="h-5 w-5" />Predict Before You Build</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Year 1 Annual Expense ($)</Label><Input type="number" placeholder="Enter prediction" value={userAnnualExpense} onChange={e => setUserAnnualExpense(e.target.value)} disabled={submitted} /></div>
              <div className="space-y-2"><Label>End of Year 3 Book Value ($)</Label><Input type="number" placeholder="Enter prediction" value={userYear3BV} onChange={e => setUserYear3BV(e.target.value)} disabled={submitted} /></div>
            </div>
            {!submitted ? (
              <Button onClick={handleSubmit} disabled={!userAnnualExpense || !userYear3BV} className="bg-amber-700 hover:bg-amber-800">Submit Predictions</Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">{annualExpenseCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}<span className={annualExpenseCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>Expense: {annualExpenseCorrect ? 'Correct!' : `$${userAnnualExpense} → $${correctAnnualExpense}`}</span></div>
                <div className="flex items-center gap-2">{year3BVCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}<span className={year3BVCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>Yr 3 BV: {year3BVCorrect ? 'Correct!' : `$${userYear3BV} → $${correctYear3BV}`}</span></div>
                <div className="flex gap-2"><Button variant="outline" onClick={handleReset}>Try Again</Button><Button onClick={() => { setShowReveal(true); setStage('calculate') }} className="bg-blue-700">See Full Schedule <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {stage === 'calculate' && showReveal && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader><CardTitle className="text-green-900">Full Depreciation Schedule</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="bg-green-100"><th className="border p-2">Year</th><th className="border p-2 text-right">Expense</th><th className="border p-2 text-right">Accum Dep</th><th className="border p-2 text-right">Book Value</th></tr></thead>
                <tbody>{correctSchedule.map(row => (<tr key={row.year}><td className="border p-2">{row.year}</td><td className="border p-2 text-right">${row.annualExpense.toLocaleString()}</td><td className="border p-2 text-right">${row.accumulatedDepreciation.toLocaleString()}</td><td className="border p-2 text-right font-semibold">${row.bookValue.toLocaleString()}</td></tr>))}</tbody>
              </table>
            </div>
            <div className="mt-4 flex gap-2"><Button variant="outline" onClick={() => { setStage('predict'); handleReset() }}>Try Another</Button><Button onClick={() => setStage('audit')} className="bg-purple-700">Audit Check <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
          </CardContent>
        </Card>
      )}

      {stage === 'audit' && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader><CardTitle className="text-purple-900">Audit Check</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <ul className="list-disc list-inside space-y-1">
              <li>DDB needs a salvage value floor in the final year</li>
              <li>Use formulas, not hard-coded numbers</li>
              <li>BV = Cost − Accumulated Depreciation</li>
            </ul>
            <Button variant="outline" onClick={() => { setStage('predict'); handleReset(); onComplete?.() }}>Practice Another Asset</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
