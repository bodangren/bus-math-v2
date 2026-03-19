'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { type ReflectionJournalActivityProps } from '@/types/activities'
import { type Activity } from '@/lib/db/schema/validators'
import {
  buildPracticeSubmissionEnvelope,
  buildPracticeSubmissionParts,
  type PracticeSubmissionCallbackPayload,
} from '@/lib/practice/contract'

interface ReflectionPrompt {
  id: string
  category: 'courage' | 'adaptability' | 'persistence'
  prompt: string
  placeholder: string
}

type ReflectionJournalActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'reflection-journal'
  props: ReflectionJournalActivityProps
}

export const REFLECTION_JOURNAL_SUPPORTED_MODES = [
  'guided_practice',
  'independent_practice',
] as const
const REFLECTION_JOURNAL_DEFAULT_MODE = 'independent_practice' as const

interface ReflectionJournalProps {
  activity: ReflectionJournalActivity
  className?: string
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void
}

const defaultPrompts: ReflectionPrompt[] = [
  {
    id: 'courage-1',
    category: 'courage',
    prompt: 'What was the most challenging part of this unit that required you to step outside your comfort zone?',
    placeholder: 'Describe a specific moment when you had to take a risk or try something new...',
  },
  {
    id: 'adaptability-1',
    category: 'adaptability',
    prompt: 'How did you adjust your approach when you encountered unexpected problems or feedback?',
    placeholder: 'Think about times when you had to change your strategy or method...',
  },
  {
    id: 'persistence-1',
    category: 'persistence',
    prompt: 'Describe a time when you wanted to give up but kept working. What motivated you to continue?',
    placeholder: 'Reflect on your perseverance and what helped you push through...',
  },
]

export function ReflectionJournal({ activity, className = '', onSubmit }: ReflectionJournalProps) {
  const prompts = activity.props.prompts.length ? activity.props.prompts : defaultPrompts
  const unitTitle = activity.props.unitTitle ?? activity.displayName ?? 'Learning Reflection'
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isSaved, setIsSaved] = useState(false)

  const completedCount = Object.values(responses).filter((value) => value.trim()).length
  const totalCount = prompts.length

  const handleResponseChange = (promptId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [promptId]: value,
    }))
    if (isSaved) setIsSaved(false)
  }

  const handleSave = () => {
    const parts = buildPracticeSubmissionParts(responses)

    onSubmit?.(
      buildPracticeSubmissionEnvelope({
        activityId: activity.id,
        mode: REFLECTION_JOURNAL_DEFAULT_MODE,
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date(),
        answers: responses,
        parts,
        artifact: {
          kind: 'reflection_journal',
          unitTitle,
          prompts: prompts.map((prompt) => ({
            id: prompt.id,
            category: prompt.category,
            prompt: prompt.prompt,
            response: responses[prompt.id] ?? '',
          })),
        },
        analytics: {
          completedCount,
          totalCount,
        },
      }),
    )
    setIsSaved(true)
  }

  const getCategoryColor = (category: ReflectionPrompt['category']) => {
    switch (category) {
      case 'courage':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'adaptability':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'persistence':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }
  }

  return (
    <div className={`mx-auto max-w-4xl space-y-6 p-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex flex-wrap items-center gap-3 text-2xl font-bold">
                {unitTitle}
                <Badge variant="outline" className="uppercase">
                  {REFLECTION_JOURNAL_DEFAULT_MODE.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  {completedCount}/{totalCount} complete
                </Badge>
                {isSaved && <Badge className="bg-green-100 text-green-800">Saved</Badge>}
              </CardTitle>
              <CardDescription>
                {activity.props.description ?? 'Reflect on your learning and growth from this lesson.'}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 border-t pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">Purpose:</span>
              <span>Capture learning reflection for teacher review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Time:</span>
              <span>~5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Save Progress:</span>
              <span>Recorded when you save</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {prompts.map((prompt) => {
            const response = responses[prompt.id] ?? ''

            return (
              <Card key={prompt.id} className="border-l-4 border-l-muted-foreground/20">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getCategoryColor(prompt.category)}>
                      {prompt.category.toUpperCase()}
                    </Badge>
                    <CardTitle className="text-lg leading-relaxed">{prompt.prompt}</CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor={prompt.id} className="sr-only">
                      Response to {prompt.category} reflection
                    </Label>
                    <textarea
                      id={prompt.id}
                      className="min-h-[120px] w-full resize-vertical rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder={prompt.placeholder}
                      value={response}
                      onChange={(event) => handleResponseChange(prompt.id, event.target.value)}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{response.length} characters</span>
                      {response.trim() && <span className="text-green-600">Complete</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Progress: {completedCount}/{totalCount} reflections completed
            </div>
            <Button onClick={handleSave} disabled={completedCount === 0} className="min-w-[120px]">
              {isSaved ? 'Saved' : 'Save Reflection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
