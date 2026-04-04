'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lightbulb } from 'lucide-react'
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract'
import { buildSimulationSubmissionEnvelope, createSimulationPart } from '@/lib/practice/simulation-submission'

interface Scenario { id: string; label: string; description: string; impact: string; tradeoff: string }

const defaultScenarios: Scenario[] = [
  { id: 'scenario-a', label: 'Conservative Growth', description: 'Reinvest 80% of profits, slow market expansion, focus on operational efficiency.', impact: 'Steady 5-8% annual growth with strong cash reserves. Lower short-term returns but high stability.', tradeoff: 'May miss market opportunities that competitors capture with faster expansion.' },
  { id: 'scenario-b', label: 'Aggressive Expansion', description: 'Borrow $500K, open 3 new locations, hire 15 staff in Year 1.', impact: 'Potential 20-30% revenue growth but high fixed costs and debt service obligations.', tradeoff: 'If revenue targets miss by 15%+, the company faces cash flow crisis by Month 8.' },
  { id: 'scenario-c', label: 'Digital Pivot', description: 'Shift 40% of operations online, reduce physical footprint, invest in automation.', impact: 'Lower overhead by 25%, reach broader market, but requires $200K upfront tech investment.', tradeoff: 'Customer experience may suffer in transition. Staff reskilling takes 3-6 months.' },
]

interface ComparisonNote { scenarioA: string; scenarioB: string; insight: string }

export interface ScenarioSwitchShowTellProps {
  activity: { id?: string; props?: { scenarios?: Scenario[] } }
  onSubmit?: (submission: PracticeSubmissionEnvelope) => void
  onComplete?: () => void
}

export function ScenarioSwitchShowTell({ activity, onSubmit, onComplete }: ScenarioSwitchShowTellProps) {
  const scenarios = activity.props?.scenarios ?? defaultScenarios
  const [activeIndex, setActiveIndex] = useState(0)
  const [comparisonNotes, setComparisonNotes] = useState<ComparisonNote[]>([])
  const [currentNote, setCurrentNote] = useState('')
  const [completed, setCompleted] = useState(false)

  const active = scenarios[activeIndex]

  const handleAddComparison = useCallback(() => {
    if (!currentNote.trim()) return
    const otherIndex = activeIndex === 0 ? 1 : 0
    setComparisonNotes(prev => [...prev, { scenarioA: scenarios[activeIndex].label, scenarioB: scenarios[otherIndex].label, insight: currentNote }])
    setCurrentNote('')
  }, [currentNote, activeIndex, scenarios])

  const handleComplete = useCallback(() => {
    setCompleted(true)
    onSubmit?.(
      buildSimulationSubmissionEnvelope({
        activityId: activity.id ?? 'scenario-switch-showtell',
        mode: 'independent_practice',
        answers: { viewedScenarios: scenarios.map(s => s.id), comparisons: comparisonNotes },
        parts: comparisonNotes.map((note, i) => createSimulationPart(`comparison-${i}`, note.insight)),
        artifact: { scenarioLabels: scenarios.map(s => s.label), comparisonCount: comparisonNotes.length },
      }),
    )
    onComplete?.()
  }, [comparisonNotes, scenarios, onSubmit, onComplete, activity.id])

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader><CardTitle className="text-blue-900">Scenario Switch — Show & Tell</CardTitle><CardDescription className="text-blue-700">Toggle between business scenarios. Compare tradeoffs and document your insights.</CardDescription></CardHeader>
        <CardContent><div className="flex flex-wrap gap-2">{scenarios.map((s, i) => (<Button key={s.id} variant={i === activeIndex ? 'default' : 'outline'} onClick={() => setActiveIndex(i)} className={i === activeIndex ? 'bg-blue-700' : ''}>{s.label}</Button>))}</div></CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader><CardTitle className="text-slate-900">{active.label}</CardTitle><CardDescription className="text-slate-600">{active.description}</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-3 rounded border border-green-200"><p className="text-sm font-medium text-green-800">Impact</p><p className="text-sm text-green-700">{active.impact}</p></div>
          <div className="bg-amber-50 p-3 rounded border border-amber-200"><p className="text-sm font-medium text-amber-800">Tradeoff</p><p className="text-sm text-amber-700">{active.tradeoff}</p></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardHeader><CardTitle className="text-purple-900 flex items-center gap-2"><Lightbulb className="h-5 w-5" />Compare Scenarios</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <textarea className="w-full p-3 rounded border border-purple-200 text-sm" rows={3} placeholder="What insight did you find from comparing scenarios?" value={currentNote} onChange={e => setCurrentNote(e.target.value)} disabled={completed} />
          <div className="flex gap-2">
            <Button onClick={handleAddComparison} disabled={!currentNote.trim() || completed} variant="outline">Add Comparison Note</Button>
            <Button onClick={handleComplete} disabled={comparisonNotes.length === 0 || completed} className="bg-green-700"><CheckCircle2 className="h-4 w-4 mr-2" />Complete Analysis</Button>
          </div>
          {comparisonNotes.length > 0 && (
            <div className="space-y-2">{comparisonNotes.map((note, i) => (
              <div key={i} className="bg-white p-3 rounded border text-sm">
                <p className="font-medium">{note.scenarioA} vs {note.scenarioB}</p>
                <p className="text-slate-600">{note.insight}</p>
              </div>
            ))}</div>
          )}
          {completed && (
            <div className="bg-green-50 p-3 rounded border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">Analysis complete! {comparisonNotes.length} comparison{comparisonNotes.length !== 1 ? 's' : ''} documented.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
