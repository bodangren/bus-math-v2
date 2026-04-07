'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Users,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Handshake,
  Briefcase,
  HelpCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

import type { Activity } from '@/lib/db/schema/validators'
import type { CapitalNegotiationActivityProps } from '@/types/activities'
import { buildPracticeSubmissionEnvelope, buildPracticeSubmissionParts, type PracticeSubmissionCallbackPayload } from '@/lib/practice/contract'

export type CapitalNegotiationActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'capital-negotiation'
  props: CapitalNegotiationActivityProps
}

export interface CapitalTerm {
  label: string
  value: string
  isPro: boolean
}

export interface CapitalOption {
  id: string
  name: string
  type: 'debt' | 'equity'
  terms: CapitalTerm[]
  monthlyImpact: string
  longTermImpact: string
}

export interface CapitalNegotiationProps {
  activity: CapitalNegotiationActivity
  onComplete?: (results: { selection?: string }) => void
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void
}

export function CapitalNegotiation({ activity, onComplete, onSubmit }: CapitalNegotiationProps) {
  const { options } = activity.props
  const [selectedOption, setSelectedOption] = useState<CapitalOption | null>(null)
  const [revealedTerms, setRevealedTerms] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [simulationStep, setSimulationStep] = useState(0)
  const submittedRef = useRef(false)

  const handleSelect = (option: CapitalOption) => {
    setSelectedOption(option)
    setRevealedTerms([])
    setSimulationStep(1)
  }

  const handleReveal = (termLabel: string) => {
    if (!revealedTerms.includes(termLabel)) {
      setRevealedTerms(prev => [...prev, termLabel])
    }
  }

  const handleFinalize = () => {
    if (submittedRef.current) return
    setIsComplete(true)

    const selection = selectedOption?.id ?? ''
    const answers: Record<string, unknown> = {
      selection,
      termsReviewed: revealedTerms.length,
      optionType: selectedOption?.type ?? 'unknown',
    }
    const parts = buildPracticeSubmissionParts(answers).map((part) => ({
      ...part,
      isCorrect: true,
      score: 1,
      maxScore: 1,
    }))

    const envelope = buildPracticeSubmissionEnvelope({
      activityId: activity.id ?? 'capital-negotiation',
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date(),
      answers,
      parts,
        artifact: {
          kind: 'capital_negotiation',
          title: activity.props.title ?? 'Capital Negotiation',
          selectedOption: selection,
          optionType: selectedOption?.type ?? 'unknown',
          termsReviewed: revealedTerms,
          revealedCount: revealedTerms.length,
        },
      analytics: {
        selectedOption: selection,
        optionType: selectedOption?.type ?? 'unknown',
        termsReviewedCount: revealedTerms.length,
      },
    })

    submittedRef.current = true
    onSubmit?.(envelope)
    onComplete?.({ selection })
  }

  const reset = () => {
    submittedRef.current = false
    setSelectedOption(null)
    setRevealedTerms([])
    setSimulationStep(0)
    setIsComplete(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white border-0 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Handshake className="w-10 h-10 text-blue-400" />
            {activity.props.title || 'The Capital Negotiation'}
          </CardTitle>
          <CardDescription className="text-blue-200 text-lg">
            Sarah needs <strong>$10,000</strong> to scale TechStart. Two offers are on the table.
          </CardDescription>
        </CardHeader>
      </Card>

      {simulationStep === 0 && (
        <div className="grid md:grid-cols-2 gap-8 py-6">
          {options.map((option) => (
            <Card key={option.id} className="border-2 hover:border-blue-500 transition-all cursor-pointer group flex flex-col" onClick={() => handleSelect(option)}>
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${option.type === 'debt' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                  {option.type === 'debt' ? <Building2 className="w-8 h-8" /> : <Users className="w-8 h-8" />}
                </div>
                <CardTitle className="text-2xl font-black">{option.name}</CardTitle>
                <Badge variant="outline" className="mt-2 uppercase tracking-widest">{option.type === 'debt' ? 'Loan (Debt)' : 'Partner (Equity)'}</Badge>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-500 text-center italic mb-6">&quot;{option.monthlyImpact}&quot;</p>
                <div className="space-y-3">
                  {option.terms.slice(0, 2).map((term, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded border">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      {term.label}: {term.value}
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <span className="text-xs font-bold text-blue-600 underline">Read Full Terms →</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 bg-slate-50 border-t mt-auto">
                <Button className="w-full bg-slate-900 group-hover:bg-blue-600 transition-colors">Negotiate This Deal</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {simulationStep === 1 && selectedOption && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={reset} className="text-slate-500">&larr; Back to Offers</Button>
            <Badge className={selectedOption.type === 'debt' ? 'bg-blue-600' : 'bg-purple-600'}>{selectedOption.name} Analysis</Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Analyze the Deal Terms</CardTitle>
                <CardDescription>Click each term to see the pros and cons for Sarah.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3">
                {selectedOption.terms.map((term, i) => {
                  const isRevealed = revealedTerms.includes(term.label)
                  return (
                    <div 
                      key={i} 
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isRevealed ? (term.isPro ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50') : 'bg-white hover:border-blue-200'
                      }`}
                      onClick={() => handleReveal(term.label)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{term.label}</p>
                          <p className="text-lg font-black text-slate-900">{term.value}</p>
                        </div>
                        {isRevealed ? (
                          term.isPro ? <ThumbsUp className="text-emerald-600" /> : <ThumbsDown className="text-red-600" />
                        ) : (
                          <HelpCircle className="text-slate-300" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-slate-900 text-white border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">The Simulation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Monthly Impact</p>
                    <p className="text-lg font-medium leading-tight">{selectedOption.monthlyImpact}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Long-Term Impact</p>
                    <p className="text-lg font-medium leading-tight">{selectedOption.longTermImpact}</p>
                  </div>
                </CardContent>
              </Card>

              <Button 
                size="lg" 
                className="w-full h-20 text-xl font-black shadow-xl bg-blue-600 hover:bg-blue-700"
                disabled={revealedTerms.length < 3}
                onClick={handleFinalize}
              >
                Sign This Deal
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              {revealedTerms.length < 3 && <p className="text-center text-xs text-slate-400">Analyze at least 3 terms to sign.</p>}
            </div>
          </div>
        </div>
      )}

      {isComplete && selectedOption && (
        <Card className="border-4 border-blue-600 bg-white shadow-2xl animate-in zoom-in duration-300">
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-900">OFFICE FUNDED!</h2>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              You chose <strong>{selectedOption.name}</strong>. Sarah has the $10,000 she needs to move TechStart into a real office!
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border">
                <div className="flex items-center gap-3 mb-2 justify-center">
                  <TrendingUp className="text-emerald-600" />
                  <h4 className="font-bold text-slate-900">Your Future Outcome</h4>
                </div>
                <p className="text-sm text-slate-600">{selectedOption.longTermImpact}</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-2 justify-center">
                  <Briefcase className="text-blue-600" />
                  <h4 className="font-bold text-blue-900">Accounting Logic</h4>
                </div>
                <p className="text-sm text-blue-800">
                  {selectedOption.type === 'debt' 
                    ? "By choosing a loan, you've created a Liability. Sarah keeps 100% of the company (Equity), but she must pay interest every month."
                    : "By choosing a partner, you've increased Equity. Sarah doesn't have a monthly bill, but she now shares her future profits."}
                </p>
              </div>
            </div>

            <div className="pt-6 flex justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-10 h-14 text-xl" onClick={() => { setIsComplete(false) }}>
                Continue Lesson
              </Button>
              <Button variant="outline" size="lg" className="h-14" onClick={reset}>
                Try Other Option
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
