'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  buildTeacherLessonMonitoringViewModel,
  type TeacherLessonMonitoringViewModel,
} from '@/lib/teacher/lesson-monitoring';
import { TeacherLessonPlan } from '@/components/teacher/TeacherLessonPlan';

type TeacherLessonPlanPageContentProps = TeacherLessonMonitoringViewModel;

export function TeacherLessonPlanPageContent({
  lesson,
  phases,
  lessonNumber,
  availableLessons,
  lessonHrefByNumber,
  backHref,
  previousLessonHref,
  nextLessonHref,
  empty,
}: TeacherLessonPlanPageContentProps) {
  const router = useRouter();

  function navigateToHref(href: string | null) {
    if (!href) {
      return;
    }

    router.push(href);
  }

  function handleLessonChange(nextLessonNumber: number) {
    const href = lessonHrefByNumber[nextLessonNumber];
    if (href) {
      router.push(href);
    }
  }

  return (
    <main className="min-h-screen bg-muted/10 py-10">
      <div className="container mx-auto max-w-6xl px-4 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Teacher Monitoring
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Lesson Follow-Up
            </h1>
            <p className="text-sm text-muted-foreground">
              Use the published lesson plan to guide lesson-level follow-up and in-class support.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={backHref}>Back to unit gradebook</Link>
          </Button>
        </div>

        {empty ? (
          <Card>
            <CardHeader>
              <CardTitle>Published lesson content is not available yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This lesson exists in the unit sequence, but its published phases are not available
              yet. Teachers can return to the gradebook and continue monitoring other lessons while
              curriculum publishing catches up.
            </CardContent>
          </Card>
        ) : null}

        <TeacherLessonPlan
          lesson={lesson}
          phases={phases}
          lessonNumber={lessonNumber}
          availableLessons={availableLessons}
          onLessonChange={handleLessonChange}
          onNavigate={(direction) =>
            navigateToHref(direction === 'prev' ? previousLessonHref : nextLessonHref)
          }
        />
      </div>
    </main>
  );
}

export const __private__ = {
  buildTeacherLessonMonitoringViewModel,
};
