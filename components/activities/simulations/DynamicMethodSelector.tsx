'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Table2 } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface MethodSummaryRow { key: string; scenario: string; method: string; cogs: number; endingInventory: number }
interface FormulaRow { step: string; formula: string; plainEnglish: string }
interface RehearsalStage { id: string; title: string; sheet: string; output: string; rows: FormulaRow[]; references: Array<{ token: string; meaning: string }>; commonTrap: string; auditCheck: string; prompt: string; modelResponse: string }

const methodSummary: MethodSummaryRow[] = [
  { key: 'Base|FIFO', scenario: 'Base', method: 'FIFO', cogs: 690, endingInventory: 460 },
  { key: 'Base|LIFO', scenario: 'Base', method: 'LIFO', cogs: 770, endingInventory: 380 },
  { key: 'Base|Weighted Average', scenario: 'Base', method: 'Weighted Average', cogs: 731.82, endingInventory: 418.18 },
  { key: 'Stretch|FIFO', scenario: 'Stretch', method: 'FIFO', cogs: 778, endingInventory: 372 },
  { key: 'Stretch|LIFO', scenario: 'Stretch', method: 'LIFO', cogs: 850, endingInventory: 300 },
  { key: 'Stretch|Weighted Average', scenario: 'Stretch', method: 'Weighted Average', cogs: 815.45, endingInventory: 334.55 },
  { key: 'Downside|FIFO', scenario: 'Downside', method: 'FIFO', cogs: 624, endingInventory: 526 },
  { key: 'Downside|LIFO', scenario: 'Downside', method: 'LIFO', cogs: 710, endingInventory: 440 },
  { key: 'Downside|Weighted Average', scenario: 'Downside', method: 'Weighted Average', cogs: 669.09, endingInventory: 480.91 },
]

const stages: RehearsalStage[] = [
  {
    id: 'controls', title: 'Controls Rehearsal', sheet: 'Inputs', output: 'SelectedScenario, SelectedMethod, SelectedKey',
    rows: [
      { step: 'Scenario selector', formula: 'Data validation list: Base, Stretch, Downside', plainEnglish: 'User chooses which market situation to evaluate.' },
      { step: 'Method selector', formula: 'Data validation list: FIFO, LIFO, Weighted Average', plainEnglish: 'User chooses which costing method to evaluate.' },
      { step: 'Composite key', formula: '=SelectedScenario&"|"&SelectedMethod', plainEnglish: 'Builds one exact key so downstream lookups return one row.' },
    ],
    references: [{ token: 'SelectedScenario', meaning: 'Current scenario dropdown value.' }, { token: 'SelectedMethod', meaning: 'Current method dropdown value.' }],
    commonTrap: 'Labels must match table text exactly.', auditCheck: 'Changing either selector updates SelectedKey instantly.',
    prompt: 'Why is a composite key safer than nested IF logic?', modelResponse: 'A key-based lookup scales cleanly and is easier to audit.',
  },
  {
    id: 'lookups', title: 'Lookup Chain Rehearsal', sheet: 'MethodSummary', output: 'COGS and Ending Inventory by method',
    rows: [
      { step: 'COGS lookup', formula: '=INDEX(MethodSummary[COGS],MATCH(SelectedKey,MethodSummary[Key],0))', plainEnglish: 'Find the COGS value for the selected scenario and method.' },
      { step: 'Ending Inventory lookup', formula: '=INDEX(MethodSummary[EI],MATCH(SelectedKey,MethodSummary[Key],0))', plainEnglish: 'Find the ending inventory for the selected scenario and method.' },
    ],
    references: [{ token: 'MethodSummary[COGS]', meaning: 'The COGS column from the method summary table.' }],
    commonTrap: 'Key column must be the first column for MATCH.', auditCheck: 'Switching scenario or method updates both values.',
    prompt: 'What happens if your key column is not sorted?', modelResponse: 'INDEX/MATCH works regardless of sort order, unlike VLOOKUP.',
  },
  {
    id: 'kpis', title: 'KPI Rehearsal', sheet: 'Dashboard', output: 'Gross Profit, Margin %, Inventory Turnover',
    rows: [
      { step: 'Gross Profit', formula: '=Revenue - COGS', plainEnglish: 'Revenue minus cost of goods sold.' },
      { step: 'Gross Margin %', formula: '=GrossProfit / Revenue', plainEnglish: 'Gross profit as a percentage of revenue.' },
      { step: 'Inventory Turnover', formula: '=COGS / AverageInventory', plainEnglish: 'How many times inventory is sold and replaced.' },
    ],
    references: [{ token: 'Revenue', meaning: 'Units sold × selling price.' }],
    commonTrap: 'Divide by zero if Revenue or Inventory is zero.', auditCheck: 'KPIs update when scenario changes.',
    prompt: 'Which method produces the highest gross margin in a rising-price environment?', modelResponse: 'FIFO produces higher gross margins because older, cheaper inventory is matched against current revenue.',
  },
  {
    id: 'checks', title: 'Audit Checks Rehearsal', sheet: 'Checks', output: 'Validation flags',
    rows: [
      { step: 'COGS + EI = GAFS', formula: '=IF(COGS+EI=GAFS,"OK","ERROR")', plainEnglish: 'Cost of goods sold plus ending inventory must equal goods available for sale.' },
      { step: 'Margin sanity', formula: '=IF(AND(Margin>0,Margin<1),"OK","CHECK")', plainEnglish: 'Gross margin should be between 0% and 100%.' },
    ],
    references: [{ token: 'GAFS', meaning: 'Goods Available For Sale = Beginning Inventory + Purchases.' }],
    commonTrap: 'Forgetting rounding differences in weighted average.', auditCheck: 'All checks show OK for valid inputs.',
    prompt: 'Why check COGS + EI = GAFS?', modelResponse: 'It verifies the cost flow equation is balanced.',
  },
]

export interface DynamicMethodSelectorProps {
  activity: { id?: string; props?: Record<string, unknown> }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function DynamicMethodSelector({ activity, onSubmit, onComplete }: DynamicMethodSelectorProps) {
  const [activeStage, setActiveStage] = useState(0)
  const [selectedScenario, setSelectedScenario] = useState('Base')
  const [selectedMethod, setSelectedMethod] = useState('FIFO')
  const [completed, setCompleted] = useState(false)

  const compositeKey = `${selectedScenario}|${selectedMethod}`
  const lookup = methodSummary.find(r => r.key === compositeKey)
  const scenarios = ['Base', 'Stretch', 'Downside']
  const methods = ['FIFO', 'LIFO', 'Weighted Average']

  const handleComplete = useCallback(() => {
    if (completed) return
    setCompleted(true)
    onSubmit?.(
      buildSimulationSubmissionEnvelope({
        activityId: activity.id ?? 'dynamic-method-selector',
        mode: 'independent_practice',
        answers: { selectedScenario, selectedMethod, cogs: lookup?.cogs, endingInventory: lookup?.endingInventory },
        parts: [createSimulationPart('scenario', selectedScenario), createSimulationPart('method', selectedMethod), createSimulationPart('cogs', lookup?.cogs ?? 0)],
        artifact: { compositeKey, cogs: lookup?.cogs, endingInventory: lookup?.endingInventory },
      }),
    )
    onComplete?.()
  }, [completed, selectedScenario, selectedMethod, lookup, onSubmit, onComplete, activity.id, compositeKey])

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader><CardTitle className="text-blue-900 flex items-center gap-2"><Table2 className="h-5 w-5" />Dynamic Method Selector — Inventory Costing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Scenario</label>
              <div className="flex gap-2">{scenarios.map(s => (<Button key={s} variant={s === selectedScenario ? 'default' : 'outline'} size="sm" onClick={() => setSelectedScenario(s)}>{s}</Button>))}</div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Method</label>
              <div className="flex gap-2">{methods.map(m => (<Button key={m} variant={m === selectedMethod ? 'default' : 'outline'} size="sm" onClick={() => setSelectedMethod(m)}>{m}</Button>))}</div>
            </div>
          </div>
          {lookup && (
            <div className="bg-white p-4 rounded border space-y-2">
              <p className="text-sm"><strong>Composite Key:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded">{compositeKey}</code></p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 p-3 rounded"><p className="text-xs text-amber-600 uppercase">COGS</p><p className="text-lg font-bold">${lookup.cogs.toLocaleString()}</p></div>
                <div className="bg-green-50 p-3 rounded"><p className="text-xs text-green-600 uppercase">Ending Inventory</p><p className="text-lg font-bold">${lookup.endingInventory.toLocaleString()}</p></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">{stages.map((stage, i) => (<Button key={stage.id} variant={i === activeStage ? 'default' : 'outline'} size="sm" onClick={() => setActiveStage(i)}>{stage.title}</Button>))}</div>

      <Card className="border-green-200 bg-green-50">
        <CardHeader><CardTitle className="text-green-900">{stages[activeStage].title}</CardTitle><CardDescription className="text-green-700">Sheet: {stages[activeStage].sheet} → Output: {stages[activeStage].output}</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">{stages[activeStage].rows.map((row, i) => (
            <div key={i} className="bg-white p-3 rounded border"><p className="font-medium text-sm">{row.step}</p><code className="text-xs bg-gray-100 px-2 py-0.5 rounded block mt-1">{row.formula}</code><p className="text-xs text-slate-500 mt-1">{row.plainEnglish}</p></div>
          ))}</div>
          <div className="bg-amber-50 p-3 rounded border border-amber-200"><p className="text-sm font-medium text-amber-800">Common Trap:</p><p className="text-sm text-amber-700">{stages[activeStage].commonTrap}</p></div>
          <div className="bg-blue-50 p-3 rounded border border-blue-200"><p className="text-sm font-medium text-blue-800">Think About:</p><p className="text-sm text-blue-700">{stages[activeStage].prompt}</p><p className="text-sm text-blue-600 mt-1 italic">{stages[activeStage].modelResponse}</p></div>
          {activeStage < stages.length - 1 ? (
            <Button onClick={() => setActiveStage(activeStage + 1)} className="bg-green-700">Next Stage <ArrowRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-700" disabled={completed}><CheckCircle2 className="h-4 w-4 mr-2" />Complete</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
