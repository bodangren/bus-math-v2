'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  type LucideIcon,
  DollarSign,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle,
  FileText,
  CreditCard,
  Briefcase,
  User,
  Scale
} from 'lucide-react'

// Types for the simulation
export interface NotebookItem {
  id: string
  label: string
  amount: number
  category: 'asset' | 'liability' | 'equity'
  description: string
  icon: 'cash' | 'bill' | 'equipment' | 'owner' | 'receivable'
}

export interface NotebookOrganizerProps {
  activity: {
    title?: string
    description?: string
    props: {
      items: NotebookItem[]
      initialMessage?: string
      successMessage?: string
    }
  }
  onComplete?: (results: {
    totals: { asset: number; liability: number; equity: number }
    items: Record<string, string>
  }) => void
}

const ITEM_ICONS: Record<string, LucideIcon> = {
  cash: DollarSign,
  bill: CreditCard,
  equipment: Briefcase,
  owner: User,
  receivable: FileText
}

export function NotebookOrganizer({ activity, onComplete }: NotebookOrganizerProps) {
  const { items, successMessage } = activity.props
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({})
  const [showInstructions, setShowInstructions] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Totals
  const totals = useMemo(() => {
    const counts = { asset: 0, liability: 0, equity: 0 }
    Object.entries(placedItems).forEach(([itemId, category]) => {
      const item = items.find(i => i.id === itemId)
      if (item) {
        counts[category as keyof typeof counts] += item.amount
      }
    })
    return counts
  }, [items, placedItems])

  const equationBalanced = totals.asset === (totals.liability + totals.equity) && totals.asset > 0

  const allItemsPlaced = Object.keys(placedItems).length === items.length

  useEffect(() => {
    if (allItemsPlaced && equationBalanced && !isComplete) {
      // Check if categories are correct
      const correct = items.every(item => placedItems[item.id] === item.category)
      if (correct) {
        setIsComplete(true)
        onComplete?.({ totals, items: placedItems })
      }
    }
  }, [allItemsPlaced, equationBalanced, items, placedItems, totals, isComplete, onComplete])

  const handlePlaceItem = (itemId: string, category: string) => {
    setPlacedItems(prev => ({ ...prev, [itemId]: category }))
  }

  const resetGame = () => {
    setPlacedItems({})
    setIsComplete(false)
  }

  const renderFolder = (id: 'asset' | 'liability' | 'equity', title: string, colorClass: string, icon: LucideIcon) => {
    const Icon = icon
    const folderItems = items.filter(item => placedItems[item.id] === id)
    
    return (
      <Card className={`border-2 ${colorClass} h-full flex flex-col`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="w-5 h-5" />
            {title}
          </CardTitle>
          <div className="text-2xl font-bold">${totals[id].toLocaleString()}</div>
        </CardHeader>
        <CardContent className="flex-1 space-y-2 overflow-y-auto max-h-[300px]">
          {folderItems.length === 0 ? (
            <div className="text-sm text-slate-400 italic py-4 text-center border-2 border-dashed rounded-lg">
              Drag items here
            </div>
          ) : (
            folderItems.map(item => {
              const ItemIcon = ITEM_ICONS[item.icon] || FileText
              return (
                <div 
                  key={item.id} 
                  className="p-2 bg-white rounded border shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <ItemIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">${item.amount.toLocaleString()}</span>
                    <button 
                      onClick={() => {
                        const next = { ...placedItems }
                        delete next[item.id]
                        setPlacedItems(next)
                      }}
                      className="text-slate-300 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    )
  }

  const unplacedItems = items.filter(item => !placedItems[item.id])

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <FileText className="w-8 h-8 text-amber-600" />
            {activity.title || 'The Notebook Organizer'}
          </CardTitle>
          <CardDescription className="text-lg">
            {activity.description || "Help Sarah sort her messy desk into 'What she has' vs 'What she owes'."}
          </CardDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              How to Sort
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Instructions */}
      {showInstructions && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 space-y-4">
            <p className="text-amber-900 leading-relaxed">
              Sarah Chen just launched TechStart, and her notebook is full of scattered notes about cash, equipment, and bills. 
              To help her see if her business is healthy, we need to sort these into three categories:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded border border-blue-200">
                <h4 className="font-bold text-blue-700 mb-1">What We Have</h4>
                <p className="text-xs text-slate-600">Assets: Cash, equipment, or money customers owe us.</p>
              </div>
              <div className="p-3 bg-white rounded border border-red-200">
                <h4 className="font-bold text-red-700 mb-1">What We Owe</h4>
                <p className="text-xs text-slate-600">Liabilities: Credit card bills, loans, or unpaid invoices.</p>
              </div>
              <div className="p-3 bg-white rounded border border-purple-200">
                <h4 className="font-bold text-purple-700 mb-1">Sarah&apos;s Stake</h4>
                <p className="text-xs text-slate-600">Equity: The money Sarah put in or the value left over for her.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* The Scale */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-8 w-full max-w-2xl">
              <div className="flex-1 text-center">
                <div className="text-sm font-bold text-blue-600 uppercase">What We Have</div>
                <div className="text-3xl font-black">${totals.asset.toLocaleString()}</div>
              </div>
              
              <div className="flex flex-col items-center">
                <Scale className={`w-12 h-12 transition-transform duration-500 ${
                  totals.asset > (totals.liability + totals.equity) ? '-rotate-12' :
                  totals.asset < (totals.liability + totals.equity) ? 'rotate-12' : ''
                }`} />
                <div className="text-2xl font-bold">{equationBalanced ? '=' : '≠'}</div>
              </div>

              <div className="flex-1 text-center">
                <div className="text-sm font-bold text-slate-600 uppercase">Owe + Stake</div>
                <div className="text-3xl font-black">${(totals.liability + totals.equity).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="w-full max-w-md">
              <Progress 
                value={allItemsPlaced ? 100 : (Object.keys(placedItems).length / items.length) * 100} 
                className="h-2"
              />
              <p className="text-center text-xs text-slate-500 mt-2">
                {Object.keys(placedItems).length} of {items.length} notes sorted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Messy Desk (Unplaced Items) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 px-2">
            <RefreshCw className="w-4 h-4" />
            Sarah&apos;s Notes
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {unplacedItems.length === 0 ? (
              <div className="p-6 bg-green-50 border-2 border-dashed border-green-200 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-700 font-medium">All notes sorted!</p>
              </div>
            ) : (
              unplacedItems.map(item => {
                const ItemIcon = ITEM_ICONS[item.icon] || FileText
                return (
                  <Card key={item.id} className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-100 rounded-full">
                          <ItemIcon className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="font-bold text-sm">{item.label}</div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-lg font-black">${item.amount.toLocaleString()}</div>
                        <div className="flex gap-1">
                          <Button size="xs" variant="outline" className="text-[10px] h-6 px-1.5" onClick={() => handlePlaceItem(item.id, 'asset')}>Have</Button>
                          <Button size="xs" variant="outline" className="text-[10px] h-6 px-1.5" onClick={() => handlePlaceItem(item.id, 'liability')}>Owe</Button>
                          <Button size="xs" variant="outline" className="text-[10px] h-6 px-1.5" onClick={() => handlePlaceItem(item.id, 'equity')}>Stake</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Folders */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderFolder('asset', 'What We Have', 'border-blue-200 bg-blue-50/30 text-blue-900', Briefcase)}
          {renderFolder('liability', 'What We Owe', 'border-red-200 bg-red-50/30 text-red-900', CreditCard)}
          {renderFolder('equity', "Sarah's Stake", 'border-purple-200 bg-purple-50/30 text-purple-900', User)}
        </div>
      </div>

      {/* Completion Screen */}
      {isComplete && (
        <Card className="border-4 border-green-500 bg-green-50 animate-in zoom-in duration-300">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-green-900">Desk Organized!</h2>
            <p className="text-xl text-green-800 max-w-2xl mx-auto">
              {successMessage || "Great work! You've successfully categorized Sarah's messy notes. Notice how What We Have ($" + totals.asset.toLocaleString() + ") perfectly balances with What We Owe + Sarah's Stake."}
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8" onClick={() => alert('Proceeding to next phase...')}>
                Continue Lesson
              </Button>
              <Button variant="outline" size="lg" onClick={resetGame}>
                Restart
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Controls */}
      {!isComplete && (
        <div className="flex justify-center pt-6 border-t">
          <Button variant="ghost" onClick={resetGame} className="text-slate-500">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset All Notes
          </Button>
        </div>
      )}
    </div>
  )
}
