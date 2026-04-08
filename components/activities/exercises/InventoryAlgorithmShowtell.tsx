'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lightbulb, TrendingUp, Package, DollarSign } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface InventoryLot {
  id: string
  purchaseDate: string
  quantity: number
  unitCost: number
}

interface InventoryMethod {
  id: string
  name: string
  description: string
  calculateCostOfGoodsSold: (lots: InventoryLot[], salesQuantity: number) => { cogs: number; endingInventory: number; explanation: string }
}

const sampleLots: InventoryLot[] = [
  { id: 'lot-1', purchaseDate: 'Jan 1', quantity: 100, unitCost: 10.00 },
  { id: 'lot-2', purchaseDate: 'Jan 15', quantity: 150, unitCost: 12.00 },
  { id: 'lot-3', purchaseDate: 'Feb 1', quantity: 120, unitCost: 14.00 },
]

const salesQuantity = 200

const fifoMethod: InventoryMethod = {
  id: 'fifo',
  name: 'FIFO (First-In, First-Out)',
  description: 'Assumes the oldest items are sold first.',
  calculateCostOfGoodsSold: (lots, salesQty) => {
    let remaining = salesQty
    let cogs = 0
    const steps: string[] = []

    for (const lot of lots) {
      if (remaining <= 0) break
      const used = Math.min(lot.quantity, remaining)
      cogs += used * lot.unitCost
      steps.push(`Sold ${used} units from ${lot.purchaseDate} lot at $${lot.unitCost.toFixed(2)} each`)
      remaining -= used
    }

    const totalCost = lots.reduce((sum, lot) => sum + lot.quantity * lot.unitCost, 0)
    const endingInventory = totalCost - cogs

    return {
      cogs,
      endingInventory,
      explanation: steps.join('; '),
    }
  },
}

const lifoMethod: InventoryMethod = {
  id: 'lifo',
  name: 'LIFO (Last-In, First-Out)',
  description: 'Assumes the newest items are sold first.',
  calculateCostOfGoodsSold: (lots, salesQty) => {
    let remaining = salesQty
    let cogs = 0
    const steps: string[] = []

    for (let i = lots.length - 1; i >= 0; i--) {
      const lot = lots[i]
      if (remaining <= 0) break
      const used = Math.min(lot.quantity, remaining)
      cogs += used * lot.unitCost
      steps.push(`Sold ${used} units from ${lot.purchaseDate} lot at $${lot.unitCost.toFixed(2)} each`)
      remaining -= used
    }

    const totalCost = lots.reduce((sum, lot) => sum + lot.quantity * lot.unitCost, 0)
    const endingInventory = totalCost - cogs

    return {
      cogs,
      endingInventory,
      explanation: steps.join('; '),
    }
  },
}

const weightedAverageMethod: InventoryMethod = {
  id: 'weighted-average',
  name: 'Weighted Average',
  description: 'Uses the average cost of all items available for sale.',
  calculateCostOfGoodsSold: (lots, salesQty) => {
    const totalUnits = lots.reduce((sum, lot) => sum + lot.quantity, 0)
    const totalCost = lots.reduce((sum, lot) => sum + lot.quantity * lot.unitCost, 0)
    const averageCost = totalUnits > 0 ? totalCost / totalUnits : 0
    const cogs = salesQty * averageCost
    const endingInventory = totalCost - cogs

    return {
      cogs,
      endingInventory,
      explanation: `Average cost: $${averageCost.toFixed(2)} per unit (total $${totalCost.toFixed(2)} for ${totalUnits} units)`,
    }
  },
}

const methods = [fifoMethod, lifoMethod, weightedAverageMethod]

export interface InventoryAlgorithmShowtellProps {
  activity: {
    id?: string
    props?: {
      masteryThreshold?: number
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function InventoryAlgorithmShowtell({ activity, onSubmit, onComplete }: InventoryAlgorithmShowtellProps) {
  const [activeMethodId, setActiveMethodId] = useState<string>(methods[0].id)
  const [insights, setInsights] = useState<string[]>([])
  const [currentInsight, setCurrentInsight] = useState('')
  const [completed, setCompleted] = useState(false)
  const submittedRef = useRef(false)

  const activeMethod = methods.find(m => m.id === activeMethodId) || methods[0]
  const result = activeMethod.calculateCostOfGoodsSold(sampleLots, salesQuantity)

  const handleAddInsight = useCallback(() => {
    if (!currentInsight.trim()) return
    setInsights(prev => [...prev, currentInsight])
    setCurrentInsight('')
  }, [currentInsight])

  const handleComplete = useCallback(() => {
    if (submittedRef.current) return
    submittedRef.current = true
    setCompleted(true)
    onSubmit?.(
      buildSimulationSubmissionEnvelope({
        activityId: activity.id ?? 'inventory-algorithm-showtell',
        mode: 'independent_practice',
        answers: {
          viewedMethods: methods.map(m => m.id),
          insights,
        },
        parts: [
          createSimulationPart('fifo-result', JSON.stringify(fifoMethod.calculateCostOfGoodsSold(sampleLots, salesQuantity))),
          createSimulationPart('lifo-result', JSON.stringify(lifoMethod.calculateCostOfGoodsSold(sampleLots, salesQuantity))),
          createSimulationPart('weighted-average-result', JSON.stringify(weightedAverageMethod.calculateCostOfGoodsSold(sampleLots, salesQuantity))),
          ...insights.map((insight, i) => createSimulationPart(`insight-${i}`, insight)),
        ],
        artifact: {
          sampleLots,
          salesQuantity,
          insightCount: insights.length,
        },
      }),
    )
    onComplete?.()
  }, [insights, onSubmit, onComplete, activity.id])

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardHeader>
          <CardTitle className="text-xl text-emerald-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Inventory Cost Flow Show & Tell
          </CardTitle>
          <CardDescription className="text-emerald-600">
            Explore FIFO, LIFO, and Weighted Average inventory costing methods. Compare results and document your insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {methods.map((method) => (
              <Button
                key={method.id}
                variant={method.id === activeMethodId ? 'default' : 'outline'}
                onClick={() => setActiveMethodId(method.id)}
                className={method.id === activeMethodId ? 'bg-emerald-700' : ''}
              >
                {method.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sample Inventory Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Purchase Date</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Unit Cost</th>
                  <th className="text-right p-2">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {sampleLots.map((lot) => (
                  <tr key={lot.id} className="border-b">
                    <td className="p-2">{lot.purchaseDate}</td>
                    <td className="text-right p-2">{lot.quantity}</td>
                    <td className="text-right p-2">${lot.unitCost.toFixed(2)}</td>
                    <td className="text-right p-2">${(lot.quantity * lot.unitCost).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="p-2">Total Available</td>
                  <td className="text-right p-2">{sampleLots.reduce((sum, lot) => sum + lot.quantity, 0)}</td>
                  <td className="text-right p-2">-</td>
                  <td className="text-right p-2">${sampleLots.reduce((sum, lot) => sum + lot.quantity * lot.unitCost, 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
            <p className="text-sm font-medium text-emerald-800">
              Sales Quantity: {salesQuantity} units
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-teal-200 bg-white">
        <CardHeader>
          <CardTitle className="text-teal-900">{activeMethod.name}</CardTitle>
          <CardDescription className="text-teal-600">{activeMethod.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-teal-50 p-4 rounded border border-teal-200">
              <p className="text-sm font-medium text-teal-800 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost of Goods Sold (COGS)
              </p>
              <p className="text-2xl font-bold text-teal-900">${result.cogs.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Ending Inventory
              </p>
              <p className="text-2xl font-bold text-slate-900">${result.endingInventory.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <p className="text-sm font-medium text-slate-800">Calculation Details</p>
            <p className="text-sm text-slate-600 mt-1">{result.explanation}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Your Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full p-3 rounded border border-purple-200 text-sm"
            rows={3}
            placeholder="What did you learn about these inventory costing methods?"
            value={currentInsight}
            onChange={(e) => setCurrentInsight(e.target.value)}
            disabled={completed}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddInsight} disabled={!currentInsight.trim() || completed} variant="outline">
              Add Insight
            </Button>
            <Button onClick={handleComplete} disabled={insights.length === 0 || completed} className="bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Analysis
            </Button>
          </div>
          {insights.length > 0 && (
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <div key={i} className="bg-white p-3 rounded border text-sm">
                  <p className="text-slate-700">{insight}</p>
                </div>
              ))}
            </div>
          )}
          {completed && (
            <div className="bg-green-50 p-3 rounded border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                Analysis complete! {insights.length} insight{insights.length !== 1 ? 's' : ''} documented.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
