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
    if (duration <= 0) return 'Flexible'
    return `${duration}m`
  }

  return (
    <aside className="w-full space-y-px bg-border border border-border">
      <Card className="border-none">
        <CardHeader className="p-4 border-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Unit {unitNumber}</p>
              <CardTitle className="text-base font-bold tracking-tight">{unitTitle}</CardTitle>
            </div>
            <div className="text-[10px] font-mono border border-border px-1.5 py-0.5">
              {unitProgress}%
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="space-y-1">
            <Progress value={unitProgress} className="h-1 rounded-none" />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            <span>{sortedLessons.length} lessons</span>
            <span>{formatDuration(totalDuration)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-background p-4 border-y border-border">
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <BookOpen className="h-3 w-3" />
          Lessons
        </h3>
      </div>

      <div className="bg-background">
        {sortedLessons.map((lesson) => {
          const lessonProgress = getLessonProgress(lesson.id)
          const isActive = currentLessonId === lesson.id
          return (
            <div key={lesson.id} className="border-b border-border/50 last:border-none">
              <Link
                href={getLessonHref(lesson)}
                className={cn(
                  'flex items-center justify-between px-4 py-3 text-left transition-colors',
                  isActive ? 'bg-secondary' : 'hover:bg-secondary/50'
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-xs font-bold truncate uppercase tracking-tight",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {lesson.orderIndex}. {lesson.title}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/60">{formatDuration(lesson.metadata?.duration ?? 0)}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                  <span>{lessonProgress}%</span>
                  {lessonProgress === 100 ? <CheckCircle2 className="h-3 w-3 text-foreground" /> : null}
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      <div className="bg-background p-4 border-t border-border">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/student/unit${unitNumber.toString().padStart(2, '0')}`}>
            View Overview
          </Link>
        </Button>
      </div>
    </aside>
  )
}
