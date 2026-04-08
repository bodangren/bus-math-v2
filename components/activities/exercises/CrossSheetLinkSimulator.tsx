'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lightbulb, FileSpreadsheet, Link2, Table2 } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface CellValue {
  value: string
  formula: string | null
}

interface SheetState {
  cells: Record<string, CellValue>
}

const initialSheet1: SheetState = {
  cells: {
    A1: { value: 'Product', formula: null },
    B1: { value: 'Revenue', formula: null },
    A2: { value: 'Lemonade', formula: null },
    B2: { value: '300', formula: null },
    A3: { value: 'Snacks', formula: null },
    B3: { value: '200', formula: null },
    A4: { value: 'Total', formula: null },
    B4: { value: '500', formula: '=B2+B3' },
  },
}

const initialSheet2: SheetState = {
  cells: {
    A1: { value: 'Category', formula: null },
    B1: { value: 'Amount', formula: null },
    A2: { value: 'Total Revenue', formula: null },
    B2: { value: '500', formula: '=Sheet1!B4' },
    A3: { value: 'Expenses', formula: null },
    B3: { value: '150', formula: null },
    A4: { value: 'Profit', formula: null },
    B4: { value: '350', formula: '=B2-B3' },
  },
}

export interface CrossSheetLinkSimulatorProps {
  activity: {
    id?: string
    props?: {
      masteryThreshold?: number
    }
  }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function CrossSheetLinkSimulator({ activity, onSubmit, onComplete }: CrossSheetLinkSimulatorProps) {
  const [sheet1, setSheet1] = useState<SheetState>(initialSheet1)
  const [sheet2, setSheet2] = useState<SheetState>(initialSheet2)
  const [insights, setInsights] = useState<string[]>([])
  const [currentInsight, setCurrentInsight] = useState('')
  const [completed, setCompleted] = useState(false)
  const submittedRef = useRef(false)

  const calculateSheet2 = useCallback((newSheet1: SheetState) => {
    const sheet1B4 = newSheet1.cells.B4?.value ?? '0'
    const sheet1B4Num = parseFloat(sheet1B4) || 0
    const expensesNum = parseFloat(sheet2.cells.B3?.value ?? '0') || 0
    const profitNum = sheet1B4Num - expensesNum

    return {
      ...sheet2,
      cells: {
        ...sheet2.cells,
        B2: { value: sheet1B4Num.toString(), formula: '=Sheet1!B4' },
        B4: { value: profitNum.toString(), formula: '=B2-B3' },
      },
    }
  }, [sheet2])

  const handleSheet1CellChange = useCallback((cellKey: string, value: string) => {
    const newSheet1 = {
      ...sheet1,
      cells: {
        ...sheet1.cells,
        [cellKey]: { value, formula: sheet1.cells[cellKey]?.formula ?? null },
      },
    }

    if (cellKey === 'B2' || cellKey === 'B3') {
      const b2 = parseFloat(newSheet1.cells.B2?.value ?? '0') || 0
      const b3 = parseFloat(newSheet1.cells.B3?.value ?? '0') || 0
      newSheet1.cells.B4 = { value: (b2 + b3).toString(), formula: '=B2+B3' }
    }

    setSheet1(newSheet1)
    setSheet2(calculateSheet2(newSheet1))
  }, [sheet1, calculateSheet2])

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
        activityId: activity.id ?? 'cross-sheet-link-simulator',
        mode: 'independent_practice',
        answers: {
          initialSheet1,
          initialSheet2,
          finalSheet1: sheet1,
          finalSheet2: sheet2,
          insights,
        },
        parts: [
          createSimulationPart('initial-sheet1', JSON.stringify(initialSheet1)),
          createSimulationPart('initial-sheet2', JSON.stringify(initialSheet2)),
          createSimulationPart('final-sheet1', JSON.stringify(sheet1)),
          createSimulationPart('final-sheet2', JSON.stringify(sheet2)),
          ...insights.map((insight, i) => createSimulationPart(`insight-${i}`, insight)),
        ],
        artifact: {
          initialSheet1,
          initialSheet2,
          finalSheet1,
          finalSheet2,
          insightCount: insights.length,
        },
      }),
    )
    onComplete?.()
  }, [sheet1, sheet2, insights, onSubmit, onComplete, activity.id])

  const renderSheet = (sheet: SheetState, sheetName: string, onCellChange?: (key: string, value: string) => void) => {
    const cells = [
      ['A1', 'B1'],
      ['A2', 'B2'],
      ['A3', 'B3'],
      ['A4', 'B4'],
    ]

    return (
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {sheetName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {cells.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cellKey) => (
                      <td key={cellKey} className="border border-slate-300 p-2">
                        {onCellChange && (cellKey === 'B2' || cellKey === 'B3') ? (
                          <input
                            type="text"
                            value={sheet.cells[cellKey]?.value ?? ''}
                            onChange={(e) => onCellChange(cellKey, e.target.value)}
                            disabled={completed}
                            className="w-full p-1 border rounded text-sm"
                          />
                        ) : (
                          <div className="text-sm">
                            <span className="font-medium">{sheet.cells[cellKey]?.value ?? ''}</span>
                            {sheet.cells[cellKey]?.formula && (
                              <span className="text-xs text-slate-500 ml-2">
                                {sheet.cells[cellKey]?.formula}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Cross-Sheet Linking Simulator
          </CardTitle>
          <CardDescription className="text-blue-600">
            Explore how cells in one spreadsheet can reference cells in another.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSheet(sheet1, 'Sheet 1: Revenue', handleSheet1CellChange)}
        {renderSheet(sheet2, 'Sheet 2: Profit Summary')}
      </div>

      <Card className="border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Table2 className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>• Sheet1!B4 is the total revenue from Sheet1</p>
          <p>• Sheet2!B2 links to Sheet1!B4 using the formula <code className="bg-slate-200 px-1 rounded">=Sheet1!B4</code></p>
          <p>• Try changing Lemonade (B2) or Snacks (B3) in Sheet1 and watch Sheet2 update!</p>
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
            placeholder="What did you learn about cross-sheet references?"
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
