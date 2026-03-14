import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import type { DashboardLessonActionLink } from '@/lib/student/dashboard-presentation';
import { formatCurriculumSegmentLabel } from '@/lib/curriculum/segment-labels';
import { studentLessonPath } from '@/lib/student/navigation';

interface NextLessonCardProps {
  heading: string;
  description: string;
  lesson: DashboardLessonActionLink | null;
  emptyMessage: string;
}

export function NextLessonCard({
  heading,
  description,
  lesson,
  emptyMessage,
}: NextLessonCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <h2 className="font-semibold leading-none tracking-tight">{heading}</h2>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lesson ? (
          <>
            <div className="rounded-xl border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {formatCurriculumSegmentLabel(lesson.unitNumber)}
              </p>
              <p className="mt-1 font-semibold text-foreground">{lesson.title}</p>
              {lesson.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{lesson.description}</p>
              ) : null}
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href={studentLessonPath(lesson.slug)}>
                {lesson.actionLabel}
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
