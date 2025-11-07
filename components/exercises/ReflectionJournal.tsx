'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

import { type ReflectionJournalActivityProps } from '@/lib/db/schema/activities'
import { type Activity } from '@/lib/db/schema/validators'

interface ReflectionPrompt {
  id: string;
  category: 'courage' | 'adaptability' | 'persistence';
  prompt: string;
  placeholder: string;
}

type ReflectionJournalActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'reflection-journal'
  props: ReflectionJournalActivityProps
}

interface ReflectionJournalProps {
  activity: ReflectionJournalActivity
  className?: string
  onSubmit?: (payload: {
    activityId: string
    responses: Record<string, string>
    completedAt: Date
  }) => void
}

const defaultPrompts: ReflectionPrompt[] = [
  {
    id: 'courage-1',
    category: 'courage',
    prompt: 'What was the most challenging part of this unit that required you to step outside your comfort zone?',
    placeholder: 'Describe a specific moment when you had to take a risk or try something new...'
  },
  {
    id: 'adaptability-1', 
    category: 'adaptability',
    prompt: 'How did you adjust your approach when you encountered unexpected problems or feedback?',
    placeholder: 'Think about times when you had to change your strategy or method...'
  },
  {
    id: 'persistence-1',
    category: 'persistence',
    prompt: 'Describe a time when you wanted to give up but kept working. What motivated you to continue?',
    placeholder: 'Reflect on your perseverance and what helped you push through...'
  }
];

/**
 * ReflectionJournal - A component for student self-reflection on learning experiences
 * 
 * Supports the CAP (Courage, Adaptability, Persistence) framework used throughout
 * the Grade 12 Business Operations curriculum. Students reflect on their learning
 * journey and develop metacognitive awareness.
 */
export default function ReflectionJournal({ activity, className = '', onSubmit }: ReflectionJournalProps) {
  const prompts = activity.props.prompts.length ? activity.props.prompts : defaultPrompts
  const unitTitle = activity.props.unitTitle ?? activity.displayName ?? 'Learning Reflection'
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  const handleResponseChange = (promptId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [promptId]: value
    }));
    if (isSaved) setIsSaved(false);
  };

  const handleSave = () => {
    onSubmit?.({
      activityId: activity.id,
      responses,
      completedAt: new Date()
    })
    setIsSaved(true)
  };

  const getCategoryColor = (category: ReflectionPrompt['category']) => {
    switch (category) {
      case 'courage': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'adaptability': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'persistence': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  const getCategoryIcon = (category: ReflectionPrompt['category']) => {
    switch (category) {
      case 'courage': return '🦁';
      case 'adaptability': return '🌊';
      case 'persistence': return '⚡';
    }
  };

  const completedCount = Object.keys(responses).filter(key => responses[key]?.trim()).length;
  const totalCount = prompts.length;

  return (
    <div className={`max-w-4xl mx-auto p-4 space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{unitTitle}</CardTitle>
              <CardDescription>
                Reflect on your learning journey and growth in the CAP framework
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {completedCount}/{totalCount} Complete
              </Badge>
              {isSaved && (
                <Badge className="bg-green-100 text-green-800">
                  ✓ Saved
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="border-l-4 border-l-muted-foreground/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(prompt.category)}</span>
                  <Badge className={getCategoryColor(prompt.category)}>
                    {prompt.category.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-relaxed">
                  {prompt.prompt}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={prompt.id} className="sr-only">
                    Response to {prompt.category} reflection
                  </Label>
                  <textarea
                    id={prompt.id}
                    className="w-full min-h-[120px] p-3 border border-input bg-background text-sm rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder={prompt.placeholder}
                    value={responses[prompt.id] || ''}
                    onChange={(e) => handleResponseChange(prompt.id, e.target.value)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {responses[prompt.id]?.length || 0} characters
                    </span>
                    {responses[prompt.id]?.trim() && (
                      <span className="text-green-600">✓ Complete</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Progress: {completedCount}/{totalCount} reflections completed
            </div>
            <Button 
              onClick={handleSave}
              disabled={completedCount === 0}
              className="min-w-[120px]"
            >
              {isSaved ? '✓ Saved' : 'Save Reflection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
