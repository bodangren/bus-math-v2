'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  buildTeacherLessonMonitoringViewModel,
  type TeacherLessonMonitoringViewModel,
} from '@/lib/teacher/lesson-monitoring';
import { TeacherLessonPlan } from '@/components/teacher/TeacherLessonPlan';
import { LessonErrorSummary } from '@/components/teacher/LessonErrorSummary';
import { formatCurriculumSegmentLabel } from '@/lib/curriculum/segment-labels';

type TeacherLessonPlanPageContentProps = TeacherLessonMonitoringViewModel & {
  unitNumber: number;
};

export function TeacherLessonPlanPageContent({
  lesson,
  phases,
  lessonNumber,
  availableLessons,
  lessonHrefByNumber,
  previousLessonHref,
  nextLessonHref,
  empty,
  unitNumber,
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
        <header className="space-y-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/teacher" className="hover:text-foreground">
              Teacher Dashboard
            </Link>
            <ChevronLeft className="size-3 rotate-180" aria-hidden="true" />
            <Link href="/teacher/gradebook" className="hover:text-foreground">
              Course Gradebook
            </Link>
            <ChevronLeft className="size-3 rotate-180" aria-hidden="true" />
            <Link
              href={`/teacher/units/${unitNumber}`}
              className="hover:text-foreground"
            >
              {formatCurriculumSegmentLabel(unitNumber)} Gradebook
            </Link>
            <ChevronLeft className="size-3 rotate-180" aria-hidden="true" />
            <span className="text-foreground font-medium">
              Lesson {lessonNumber}
            </span>
          </nav>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {lesson.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Use this to direct to student back into the published lesson sequence.
            </p>
          </div>
        </header>

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

        {!empty ? <LessonErrorSummary lessonId={lesson.id} /> : null}
      </div>
    </main>
  );
}

export const __private__ = {
  buildTeacherLessonMonitoringViewModel,
};
