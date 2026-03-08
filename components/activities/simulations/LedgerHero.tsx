'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight
} from 'lucide-react'

// Types for Ledger Hero
export interface LedgerImpact {
  account: string
  category: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  type: 'debit' | 'credit'
  amount: number
}

export interface LedgerScenario {
  id: string
  event: string
  description: string
  impacts: LedgerImpact[]
  hint?: string
}

export interface LedgerHeroProps {
  activity: {
    title?: string
    description?: string
    props: {
      scenarios: LedgerScenario[]
    }
  }
  onComplete?: (results: { score: number }) => void
}

export function LedgerHero({ activity, onComplete }: LedgerHeroProps) {
  const { scenarios } = activity.props
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedImpacts, setSelectedImpacts] = useState<LedgerImpact[]>([])
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const currentScenario = scenarios[currentIndex]

  // Get all unique accounts from all scenarios for selection pool
  const accountPool = useMemo(() => {
    const accounts = new Set<string>()
    scenarios.forEach(s => s.impacts.forEach(i => accounts.add(i.account)))
    return Array.from(accounts).sort()
  }, [scenarios])

  const handleSelectAccount = (accountName: string) => {
    // In this "Launch" version, we simplify. 
    // Students just need to pick the TWO accounts that are changing.
    const isAlreadySelected = selectedImpacts.some(i => i.account === accountName)
    
    if (isAlreadySelected) {
      setSelectedImpacts(prev => prev.filter(i => i.account !== accountName))
    } else if (selectedImpacts.length < 2) {
      // Find the impact data for this account in the current scenario
      const impact = currentScenario.impacts.find(i => i.account === accountName)
      if (impact) {
        setSelectedImpacts(prev => [...prev, impact])
      } else {
        // Incorrect account selected
        setFeedback({ type: 'error', message: `Hmm, does "${accountName}" really change in this scenario?` })
        setTimeout(() => setFeedback(null), 2000)
      }
    }
  }

  const checkScenario = () => {
    if (selectedImpacts.length !== 2) return

    const correctAccounts = currentScenario.impacts.map(i => i.account)
    const isCorrect = selectedImpacts.every(i => correctAccounts.includes(i.account))

    if (isCorrect) {
      setFeedback({ type: 'success', message: "Spot on! Every event has a 'Double Impact'." })
      setScore(prev => prev + 100)
      
      setTimeout(() => {
        if (currentIndex < scenarios.length - 1) {
          setCurrentIndex(prev => prev + 1)
          setSelectedImpacts([])
          setFeedback(null)
          setShowHint(false)
        } else {
          setIsComplete(true)
          onComplete?.({ score: score + 100 })
        }
      }, 2000)
    } else {
      setFeedback({ type: 'error', message: "Not quite. Look closer at what Sarah is giving vs. what she is getting." })
      setScore(prev => Math.max(0, prev - 20))
    }
  }

  const resetGame = () => {
    setCurrentIndex(0)
    setSelectedImpacts([])
    setScore(0)
    setIsComplete(false)
    setFeedback(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <ArrowLeftRight className="w-8 h-8 text-blue-600" />
            {activity.title || 'Ledger Hero: Double Impact'}
          </CardTitle>
          <CardDescription className="text-lg font-medium">
            Every business event changes at least TWO things. Can you find them?
          </CardDescription>
          <div className="mt-2 flex justify-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-1">
              Score: {score}
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-1">
              Scenario {currentIndex + 1} of {scenarios.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Scenario Card */}
      {!isComplete && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-blue-400 mb-2 uppercase tracking-widest text-[10px]">Current Event</Badge>
                  <CardTitle className="text-2xl">{currentScenario.event}</CardTitle>
                </div>
                <Zap className="w-10 h-10 text-yellow-300 opacity-50" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-xl text-slate-700 leading-relaxed italic border-l-4 border-blue-200 pl-4 py-2">
                &quot;{currentScenario.description}&quot;
              </p>

              <div className="mt-8">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  Select the TWO things that changed:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {accountPool.map(account => {
                    const isSelected = selectedImpacts.some(i => i.account === account)
                    return (
                      <Button
                        key={account}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`h-16 text-sm font-bold transition-all ${
                          isSelected ? 'bg-blue-600 hover:bg-blue-700 scale-105 shadow-md' : 'hover:border-blue-400'
                        }`}
                        onClick={() => handleSelectAccount(account)}
                      >
                        {account}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Feedback Overlay */}
              {feedback && (
                <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 animate-in zoom-in duration-300 ${
                  feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  <p className="font-bold">{feedback.message}</p>
                </div>
              )}

              <div className="mt-8 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowHint(!showHint)}
                  className="text-slate-500"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Need a hint?
                </Button>
                
                <Button 
                  size="lg" 
                  onClick={checkScenario}
                  disabled={selectedImpacts.length !== 2 || !!feedback}
                  className="bg-blue-600 hover:bg-blue-700 px-10 font-black text-xl shadow-xl transition-all"
                >
                  Check Balance
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </div>

              {showHint && currentScenario.hint && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 italic">
                  Hint: {currentScenario.hint}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visual Impact Tracker (Conceptual) */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <h4 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-tighter">Impact Visualization</h4>
              <div className="flex gap-4">
                {selectedImpacts.map((impact, idx) => (
                  <div key={idx} className="flex-1 p-3 bg-white rounded border flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{impact.category}</div>
                      <div className="font-bold text-slate-800">{impact.account}</div>
                    </div>
                    {impact.type === 'debit' ? (
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                ))}
                {selectedImpacts.length < 2 && (
                  <div className="flex-1 p-3 border-2 border-dashed rounded flex items-center justify-center text-slate-300 italic text-sm">
                    Select account {selectedImpacts.length + 1}...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completion Screen */}
      {isComplete && (
        <Card className="border-4 border-blue-600 bg-blue-50 animate-in zoom-in duration-300">
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-4xl font-black text-blue-900">LEDGER HERO!</h2>
            <p className="text-2xl text-blue-800 max-w-xl mx-auto font-medium">
              You correctly identified the Double Impact for every transaction. 
              Sarah&apos;s records are balanced and ready for the next level!
            </p>
            <div className="bg-white p-6 rounded-xl border-2 border-blue-200 inline-block">
              <p className="text-sm font-bold text-slate-500 uppercase">Final Score</p>
              <p className="text-5xl font-black text-blue-600">{score}</p>
            </div>
            <div className="pt-6 flex justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-10 h-14 text-xl" onClick={() => alert('Proceeding to next phase...')}>
                Continue Journey
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8" onClick={resetGame}>
                <RefreshCw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
