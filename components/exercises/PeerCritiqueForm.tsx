'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AlertCircle, FileText, Send, Star, User } from 'lucide-react'

import { type PeerCritiqueActivityProps } from '@/lib/db/schema/activities'
import { type Activity } from '@/lib/db/schema/validators'

const DEFAULT_CATEGORIES: PeerCritiqueActivityProps['categories'] = [
  {
    id: 'strengths',
    title: 'Strengths & Highlights',
    description: 'What went especially well?',
    prompt: 'Celebrate the most impressive parts of their work.',
    placeholder: 'Call out specific examples that stood out...'
  },
  {
    id: 'improvements',
    title: 'Areas for Growth',
    description: 'Where could they improve?',
    prompt: 'Offer actionable, kind suggestions.',
    placeholder: 'Share concrete ideas that would level up the work...'
  },
  {
    id: 'excelSkills',
    title: 'Excel & Technical Skills',
    description: 'Accuracy, formulas, and data storytelling.',
    prompt: 'How effectively did they use Excel?',
    placeholder: 'Comment on formulas, charts, formatting, or automation...'
  },
  {
    id: 'businessInsight',
    title: 'Business Insight',
    description: 'Strategic thinking and real-world relevance.',
    prompt: 'Did the analysis drive clear decisions?',
    placeholder: 'Explain how their recommendations land with executives...'
  },
  {
    id: 'presentation',
    title: 'Presentation & Delivery',
    description: 'Clarity, confidence, and story arc.',
    prompt: 'How well did they communicate their ideas?',
    placeholder: 'Describe how they engaged the audience...'
  }
]

const categoryColors: Record<string, string> = {
  strengths: 'bg-green-50 border-green-200',
  improvements: 'bg-blue-50 border-blue-200',
  excelSkills: 'bg-purple-50 border-purple-200',
  businessInsight: 'bg-orange-50 border-orange-200',
  presentation: 'bg-pink-50 border-pink-200'
}

const textareaClasses =
  'mt-2 w-full min-h-[120px] rounded-md border border-input bg-background p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export type PeerCritiqueActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'peer-critique-form'
  props: PeerCritiqueActivityProps
}

interface PeerCritiqueFormProps {
  activity: PeerCritiqueActivity
  className?: string
  onSubmit?: (payload: {
    activityId: string
    projectTitle: string
    peerName: string
    unitNumber?: number
    reviewerName?: string
    ratings: Record<string, number>
    comments: Record<string, string>
    overallComments: string
    completedAt: Date
  }) => void
}

export function PeerCritiqueForm({ activity, className = '', onSubmit }: PeerCritiqueFormProps) {
  const projectTitle = activity.props.projectTitle ?? activity.displayName ?? 'Project Review'
  const peerName = activity.props.peerName ?? 'Peer'
  const unitNumber = activity.props.unitNumber
  const configuredCategories = activity.props.categories.length ? activity.props.categories : DEFAULT_CATEGORIES

  const categories = useMemo(
    () =>
      configuredCategories.map((category) => ({
        ...category,
        color: categoryColors[category.id] ?? 'bg-slate-50 border-slate-200'
      })),
    [configuredCategories]
  )

  const [ratings, setRatings] = useState<Record<string, number>>(() =>
    categories.reduce<Record<string, number>>((acc, category) => {
      acc[category.id] = 0
      return acc
    }, {})
  )
  const [comments, setComments] = useState<Record<string, string>>(() =>
    categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = ''
      return acc
    }, {})
  )
  const [overallComments, setOverallComments] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const overallTextareaId = `${activity.id}-overall`
  const reviewerInputId = `${activity.id}-reviewer`

  useEffect(() => {
    setRatings(
      categories.reduce<Record<string, number>>((acc, category) => {
        acc[category.id] = 0
        return acc
      }, {})
    )
    setComments(
      categories.reduce<Record<string, string>>((acc, category) => {
        acc[category.id] = ''
        return acc
      }, {})
    )
    setSubmitted(false)
  }, [categories])

  const allComplete =
    Object.values(ratings).every((rating) => rating > 0) &&
    Object.values(comments).every((text) => text.trim().length > 0)

  const handleSubmit = () => {
    if (!allComplete) return
    onSubmit?.({
      activityId: activity.id,
      projectTitle,
      peerName,
      unitNumber,
      reviewerName: reviewerName.trim() || undefined,
      ratings,
      comments,
      overallComments,
      completedAt: new Date()
    })
    setSubmitted(true)
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-3 text-2xl">
          <FileText className="h-6 w-6 text-muted-foreground" />
          {projectTitle}
          <Badge variant="secondary" className="ml-auto flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> {peerName}
          </Badge>
        </CardTitle>
        <CardDescription>
          Offer structured, coachable feedback aligned with the TechStart presentation rubric.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {unitNumber && (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            Unit {unitNumber} · Peer critique in progress
          </div>
        )}

        <div className="grid gap-5">
          {categories.map((category) => (
            <section
              key={category.id}
              className={`rounded-lg border ${category.color} p-4 shadow-sm`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Badge variant="outline">Rate 1-5</Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={ratings[category.id] === value ? 'default' : 'outline'}
                    className="gap-1"
                    aria-label={`${category.title} rating ${value}`}
                    onClick={() =>
                      setRatings((prev) => ({
                        ...prev,
                        [category.id]: value
                      }))
                    }
                  >
                    <Star className="h-4 w-4" /> {value}
                  </Button>
                ))}
              </div>

              <Label
                className="mt-4 block text-sm font-medium text-muted-foreground"
                htmlFor={`${category.id}-comment`}
              >
                {category.prompt}
              </Label>
              <textarea
                id={`${category.id}-comment`}
                value={comments[category.id]}
                onChange={(event) =>
                  setComments((prev) => ({
                    ...prev,
                    [category.id]: event.target.value
                  }))
                }
                placeholder={category.placeholder}
                rows={4}
                className={textareaClasses}
              />
            </section>
          ))}
        </div>

        <section className="space-y-3">
          <Label
            className="text-sm font-medium text-muted-foreground"
            htmlFor={overallTextareaId}
          >
            {activity.props.overallPrompt ?? 'Overall comments for your peer'}
          </Label>
          <textarea
            id={overallTextareaId}
            value={overallComments}
            onChange={(event) => setOverallComments(event.target.value)}
            placeholder="Summarize your feedback and next steps..."
            rows={4}
            className={textareaClasses}
          />
        </section>

        <section className="grid gap-3">
          <Label
            className="text-sm font-medium text-muted-foreground"
            htmlFor={reviewerInputId}
          >
            {activity.props.reviewerNameLabel ?? 'Your name (optional)'}
          </Label>
          <Input
            id={reviewerInputId}
            value={reviewerName}
            onChange={(event) => setReviewerName(event.target.value)}
            placeholder="Add your name if you want credit for feedback"
          />
        </section>

        {!allComplete && (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertCircle className="h-4 w-4" /> Complete every rating and comment before submitting.
          </div>
        )}

        <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
          <span>
            {Object.values(comments).filter((text) => text.trim().length > 0).length}/{categories.length} comments filled
          </span>
          <Button
            type="button"
            className="gap-2"
            disabled={!allComplete}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
            {submitted ? 'Feedback sent' : 'Submit feedback'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
