import Link from 'next/link'
import { BookOpen, CheckCircle2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Lesson, Phase, StudentProgress } from '@/lib/db/schema/validators'

export interface UnitSidebarProps {
  unitId: string
  unitNumber: number
  unitTitle: string
  lessons: Lesson[]
  phases?: Phase[]
  progressEntries?: StudentProgress[]
  currentLessonId?: string
  getLessonHref?: (lesson: Lesson) => string
}

const defaultLessonHref = (lesson: Lesson) => `/lessons/${lesson.slug}`

const statusScore: Record<StudentProgress['status'], number> = {
  completed: 1,
  in_progress: 0.5,
  not_started: 0
}

export function UnitSidebar({
  unitNumber,
  unitTitle,
  lessons,
  phases = [],
  progressEntries = [],
  currentLessonId,
  getLessonHref = defaultLessonHref
}: UnitSidebarProps) {
  const sortedLessons = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex)

  const totalDuration = sortedLessons.reduce((sum, lesson) => sum + (lesson.metadata?.duration ?? 0), 0)

  const getLessonPhases = (lessonId: string) => phases.filter((phase) => phase.lessonId === lessonId)

  const getLessonProgress = (lessonId: string) => {
    const lessonPhases = getLessonPhases(lessonId)
    if (lessonPhases.length === 0) return 0

    const totalScore = lessonPhases.reduce((acc, phase) => {
      const record = progressEntries.find((entry) => entry.phaseId === phase.id)
      return acc + (record ? statusScore[record.status] : 0)
    }, 0)

    return Math.round((totalScore / lessonPhases.length) * 100)
  }

  const lessonProgressValues = sortedLessons.map((lesson) => getLessonProgress(lesson.id))
  const unitProgress = lessonProgressValues.length
    ? Math.round(lessonProgressValues.reduce((sum, value) => sum + value, 0) / lessonProgressValues.length)
    : 0

  const formatDuration = (duration: number) => {
    if (duration <= 0) return 'Flexible pacing'
    return `${duration} min`
  }

  return (
    <aside className="w-full space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Unit {unitNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">{unitTitle}</p>
            </div>
            <Badge variant="outline" className="text-xs">
              {unitProgress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{unitProgress}%</span>
            </div>
            <Progress value={unitProgress} />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{sortedLessons.length} lessons</span>
            <span>{formatDuration(totalDuration)} total</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lessons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedLessons.map((lesson) => {
            const lessonProgress = getLessonProgress(lesson.id)
            const isActive = currentLessonId === lesson.id
            return (
              <div key={lesson.id} className="space-y-1">
                <Link
                  href={getLessonHref(lesson)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors',
                    isActive ? 'border-primary/50 bg-primary/5' : 'border-border/50 hover:bg-muted'
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {lesson.orderIndex}. {lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDuration(lesson.metadata?.duration ?? 0)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{lessonProgress}%</span>
                    {lessonProgress === 100 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : null}
                  </div>
                </Link>
                <Progress value={lessonProgress} className="h-1" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href={`/student/unit${unitNumber.toString().padStart(2, '0')}`}>
              View Unit Overview
            </Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  )
}
