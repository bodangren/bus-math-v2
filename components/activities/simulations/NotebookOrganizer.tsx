'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

import type { Activity } from '@/lib/db/schema/validators'
import type { NotebookOrganizerActivityProps } from '@/types/activities'
import { buildPracticeSubmissionEnvelope, buildPracticeSubmissionParts, type PracticeSubmissionCallbackPayload } from '@/lib/practice/contract'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const NOTEBOOK_ORGANIZER_SUPPORTED_MODES = [
  'guided_practice',
  'independent_practice',
] as const
const NOTEBOOK_ORGANIZER_DEFAULT_MODE = 'guided_practice' as const

export type NotebookOrganizerActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'notebook-organizer'
  props: NotebookOrganizerActivityProps
}

export interface NotebookItem {
  id: string
  label: string
  amount: number
  category: 'asset' | 'liability' | 'equity'
  description: string
  icon: 'cash' | 'bill' | 'equipment' | 'owner' | 'receivable'
}

export interface NotebookOrganizerProps {
  activity: NotebookOrganizerActivity
  onComplete?: (results: {
    totals: { asset: number; liability: number; equity: number }
    items: Record<string, string>
  }) => void
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void
}

const ITEM_ICONS: Record<string, LucideIcon> = {
  cash: DollarSign,
  bill: CreditCard,
  equipment: Briefcase,
  owner: User,
  receivable: FileText
}

function resolveActivityId(activity: NotebookOrganizerProps['activity']) {
  if (typeof activity.id === 'string' && activity.id.trim()) {
    return activity.id
  }

  return `${activity.props.title ?? activity.displayName ?? 'notebook-organizer'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
}

function buildSubmission(args: {
  activity: NotebookOrganizerProps['activity']
  items: NotebookItem[]
  placedItems: Record<string, string>
  totals: { asset: number; liability: number; equity: number }
  successMessage?: string
  initialMessage?: string
}) {
  const answers = Object.fromEntries(
    args.items.map((item) => [item.id, args.placedItems[item.id] ?? '']),
  )
  const parts = buildPracticeSubmissionParts(answers).map((part, index) => ({
    ...part,
    isCorrect: args.placedItems[args.items[index].id] === args.items[index].category,
    score: args.placedItems[args.items[index].id] === args.items[index].category ? 1 : 0,
    maxScore: 1,
  }))

  return buildPracticeSubmissionEnvelope({
    activityId: resolveActivityId(args.activity),
    mode: NOTEBOOK_ORGANIZER_DEFAULT_MODE,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: new Date(),
    answers,
    parts,
    artifact: {
      kind: 'notebook_organizer',
      title: args.activity.props.title ?? args.activity.displayName ?? 'The Notebook Organizer',
      description: args.activity.description ?? "Help Sarah sort her messy desk into 'What she has' vs 'What she owes'.",
      items: args.items,
      placedItems: args.placedItems,
      totals: args.totals,
      successMessage: args.successMessage,
      initialMessage: args.initialMessage,
    },
    analytics: {
      assetTotal: args.totals.asset,
      liabilityTotal: args.totals.liability,
      equityTotal: args.totals.equity,
    },
  })
}

export function NotebookOrganizer({ activity, onComplete, onSubmit }: NotebookOrganizerProps) {
  const { items, successMessage, initialMessage } = activity.props
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({})
  const [showInstructions, setShowInstructions] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const submittedRef = useRef(false)

  const resolvedTitle = activity.props.title ?? activity.displayName ?? 'The Notebook Organizer'
  const resolvedDescription =
    activity.description ?? "Help Sarah sort her messy desk into 'What she has' vs 'What she owes'."

  const totals = useMemo(() => {
    const counts = { asset: 0, liability: 0, equity: 0 }
    Object.entries(placedItems).forEach(([itemId, category]) => {
      const item = items.find((entry) => entry.id === itemId)
      if (item) {
        counts[category as keyof typeof counts] += item.amount
      }
    })
    return counts
  }, [items, placedItems])

  const equationBalanced = totals.asset === (totals.liability + totals.equity) && totals.asset > 0
  const allItemsPlaced = Object.keys(placedItems).length === items.length
  const correctPlacements = items.every((item) => placedItems[item.id] === item.category)

  useEffect(() => {
    if (allItemsPlaced && equationBalanced && !isComplete && correctPlacements && !submittedRef.current) {
      submittedRef.current = true
      const submission = buildSubmission({
        activity,
        items,
        placedItems,
        totals,
        successMessage,
        initialMessage,
      })

      setIsComplete(true)
      setSubmitted(true)
      onSubmit?.(submission)
      onComplete?.({ totals, items: placedItems })
    }
  }, [activity, allItemsPlaced, correctPlacements, equationBalanced, initialMessage, isComplete, items, onComplete, onSubmit, placedItems, successMessage, totals])

  const handlePlaceItem = (itemId: string, category: string) => {
    setPlacedItems((prev) => ({ ...prev, [itemId]: category }))
  }

  const resetGame = () => {
    setPlacedItems({})
    setIsComplete(false)
    setSubmitted(false)
    submittedRef.current = false
  }

  const submitNow = () => {
    if (!allItemsPlaced || !equationBalanced || !correctPlacements || submittedRef.current) {
      return
    }

    submittedRef.current = true
    const submission = buildSubmission({
      activity,
      items,
      placedItems,
      totals,
      successMessage,
      initialMessage,
    })

    setSubmitted(true)
    setIsComplete(true)
    onSubmit?.(submission)
    onComplete?.({ totals, items: placedItems })
  }

  const renderFolder = (id: 'asset' | 'liability' | 'equity', title: string, colorClass: string, icon: LucideIcon) => {
    const Icon = icon
    const folderItems = items.filter((item) => placedItems[item.id] === id)

    return (
      <Card className={`border-2 ${colorClass} h-full flex flex-col`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="text-2xl font-bold">${totals[id].toLocaleString()}</div>
        </CardHeader>
        <CardContent className="max-h-[300px] flex-1 space-y-2 overflow-y-auto">
          {folderItems.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed py-4 text-center text-sm italic text-slate-400">
              Drag items here
            </div>
          ) : (
            folderItems.map((item) => {
              const ItemIcon = ITEM_ICONS[item.icon] || FileText
              return (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded border bg-white p-2 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <ItemIcon className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">${item.amount.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = { ...placedItems }
                        delete next[item.id]
                        setPlacedItems(next)
                      }}
                      className="text-slate-300 hover:text-red-500"
                      aria-label={`Remove ${item.label}`}
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

  const unplacedItems = items.filter((item) => !placedItems[item.id])

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-3xl">
            <FileText className="h-8 w-8 text-amber-600" />
            {resolvedTitle}
          </CardTitle>
          <CardDescription className="text-lg">{resolvedDescription}</CardDescription>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="uppercase">
              {NOTEBOOK_ORGANIZER_DEFAULT_MODE.replace('_', ' ')}
            </Badge>
            <Badge variant="secondary">
              {Object.keys(placedItems).length}/{items.length} sorted
            </Badge>
            <Badge variant={equationBalanced && correctPlacements && isComplete ? 'default' : 'outline'}>
              {equationBalanced ? 'Balanced' : 'Not balanced'}
            </Badge>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstructions((value) => !value)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              How to Sort
              {showInstructions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showInstructions ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="space-y-4 p-6">
            <p className="leading-relaxed text-amber-900">
              Sarah Chen just launched TechStart, and her notebook is full of scattered notes about cash, equipment, and bills.
              Sort each note into assets, liabilities, or equity so the equation stays in balance.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded border border-blue-200 bg-white p-3">
                <h4 className="mb-1 font-bold text-blue-700">What We Have</h4>
                <p className="text-xs text-slate-600">Assets: cash, equipment, or money customers owe us.</p>
              </div>
              <div className="rounded border border-red-200 bg-white p-3">
                <h4 className="mb-1 font-bold text-red-700">What We Owe</h4>
                <p className="text-xs text-slate-600">Liabilities: credit card bills, loans, or unpaid invoices.</p>
              </div>
              <div className="rounded border border-purple-200 bg-white p-3">
                <h4 className="mb-1 font-bold text-purple-700">Sarah&apos;s Stake</h4>
                <p className="text-xs text-slate-600">Equity: the money Sarah put in or the value left over for her.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex w-full max-w-2xl items-center gap-8">
              <div className="flex-1 text-center">
                <div className="text-sm font-bold uppercase text-blue-600">What We Have</div>
                <div className="text-3xl font-black">${totals.asset.toLocaleString()}</div>
              </div>

              <div className="flex flex-col items-center">
                <Scale
                  className={`h-12 w-12 transition-transform duration-500 ${
                    totals.asset > (totals.liability + totals.equity)
                      ? '-rotate-12'
                      : totals.asset < (totals.liability + totals.equity)
                        ? 'rotate-12'
                        : ''
                  }`}
                />
                <div className="text-2xl font-bold">{equationBalanced ? '=' : '≠'}</div>
              </div>

              <div className="flex-1 text-center">
                <div className="text-sm font-bold uppercase text-slate-600">Owe + Stake</div>
                <div className="text-3xl font-black">${(totals.liability + totals.equity).toLocaleString()}</div>
              </div>
            </div>

            <div className="w-full max-w-md">
              <Progress
                value={allItemsPlaced ? 100 : (Object.keys(placedItems).length / items.length) * 100}
                className="h-2"
              />
              <p className="mt-2 text-center text-xs text-slate-500">
                {Object.keys(placedItems).length} of {items.length} notes sorted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <h3 className="flex items-center gap-2 px-2 font-bold text-slate-700">
            <RefreshCw className="h-4 w-4" />
            Sarah&apos;s Notes
          </h3>
          <div className="max-h-[600px] space-y-3 overflow-y-auto pr-2">
            {unplacedItems.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-green-200 bg-green-50 p-6 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                <p className="text-sm font-medium text-green-700">All notes sorted!</p>
              </div>
            ) : (
              unplacedItems.map((item) => {
                const ItemIcon = ITEM_ICONS[item.icon] || FileText
                return (
                  <Card key={item.id} className="cursor-grab transition-shadow hover:shadow-md active:cursor-grabbing">
                    <CardContent className="space-y-2 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ItemIcon className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.description}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold">${item.amount.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {(['asset', 'liability', 'equity'] as const).map((category) => (
                          <Button
                            key={category}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlaceItem(item.id, category)}
                            className="text-xs capitalize"
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {renderFolder('asset', 'What We Have', 'border-blue-200 bg-blue-50', DollarSign)}
            {renderFolder('liability', 'What We Owe', 'border-red-200 bg-red-50', CreditCard)}
            {renderFolder('equity', 'Sarah&apos;s Stake', 'border-purple-200 bg-purple-50', User)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="text-sm text-slate-600">
          {submitted
            ? 'Submitted as canonical practice evidence.'
            : `Progress: ${Object.keys(placedItems).length}/${items.length} notes placed`}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetGame}
          >
            Reset
          </Button>
          <Button
            onClick={submitNow}
            disabled={submitted || !allItemsPlaced || !equationBalanced || !correctPlacements}
          >
            {submitted ? 'Submitted' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
