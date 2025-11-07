import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  PlayCircle,
  Target,
  Users,
  BookOpen
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Lesson, Phase } from '@/lib/db/schema/validators';
import { ResourceBasePathFixer } from '@/components/ResourceBasePathFixer';

const phaseIcons: Record<string, typeof PlayCircle> = {
  intro: PlayCircle,
  example: BookOpen,
  practice: Users,
  challenge: Target,
  assessment: CheckCircle2,
  reflection: Lightbulb
};

export interface PhaseFooterNavigationOverrides {
  lessonHref?: string;
  lessonOverviewLabel?: string;
  backToLessonLabel?: string;
  completeLessonLabel?: string;
  phaseHrefBuilder?: (phase: Phase) => string;
}

export interface PhaseFooterProps {
  lesson: Lesson;
  phase: Phase;
  phases: Phase[];
  navigationOverrides?: PhaseFooterNavigationOverrides;
}

const formatNumber = (value: number) => value.toString().padStart(2, '0');

const buildLessonHref = (lesson: Lesson) => {
  if (lesson.slug) {
    return lesson.slug.startsWith('/student') ? lesson.slug : `/student/${lesson.slug}`;
  }

  return `/student/unit${formatNumber(lesson.unitNumber)}/lesson${formatNumber(lesson.orderIndex)}`;
};

export function PhaseFooter({ lesson, phase, phases, navigationOverrides }: PhaseFooterProps) {
  const sortedPhases = [...phases].sort((a, b) => a.phaseNumber - b.phaseNumber);
  const currentIndex = Math.max(
    0,
    sortedPhases.findIndex((entry) => entry.id === phase.id || entry.phaseNumber === phase.phaseNumber)
  );

  const prevPhase = currentIndex > 0 ? sortedPhases[currentIndex - 1] : undefined;
  const nextPhase = currentIndex < sortedPhases.length - 1 ? sortedPhases[currentIndex + 1] : undefined;

  const lessonHref = navigationOverrides?.lessonHref ?? buildLessonHref(lesson);
  const defaultPhaseHrefBuilder =
    navigationOverrides?.phaseHrefBuilder ??
    ((phaseToLink: Phase) => `${lessonHref}/phase-${formatNumber(phaseToLink.phaseNumber)}`);

  const lessonOverviewLabel = navigationOverrides?.lessonOverviewLabel ?? 'Lesson Overview';
  const backToLessonLabel = navigationOverrides?.backToLessonLabel ?? `Back to ${lessonOverviewLabel}`;
  const completeLessonLabel = navigationOverrides?.completeLessonLabel ?? 'Complete Lesson';

  return (
    <div className="mx-auto mt-8 max-w-4xl space-y-6 px-4">
      <ResourceBasePathFixer />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-4 py-4">
        <div className="flex items-center gap-2">
          {prevPhase ? (
            <Button variant="outline" asChild className="border-border/60 hover:bg-accent/50">
              <Link href={defaultPhaseHrefBuilder(prevPhase)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous: {prevPhase.title}
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild className="border-border/60 hover:bg-accent/50">
              <Link href={lessonHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backToLessonLabel}
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild className="border-border/60 hover:bg-accent/50">
            <Link href={lessonHref}>{lessonOverviewLabel}</Link>
          </Button>
          {nextPhase ? (
            <Button asChild className="gradient-financial text-primary-foreground shadow-md hover:shadow-lg">
              <Link href={defaultPhaseHrefBuilder(nextPhase)}>
                Next: {nextPhase.title}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild className="gradient-success text-white shadow-md hover:shadow-lg">
              <Link href={lessonHref}>
                {completeLessonLabel}
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/40">
        <CardHeader className="excel-header">
          <CardTitle className="text-primary text-sm font-semibold">Phase Navigation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {sortedPhases.map((phaseEntry, index) => {
            const Icon = phaseIcons[phaseEntry.metadata.phaseType ?? 'intro'] ?? PlayCircle;
            const isCurrent = phaseEntry.id === phase.id;
            const isCompleted = index < currentIndex;

            return (
              <Link
                key={phaseEntry.id}
                href={defaultPhaseHrefBuilder(phaseEntry)}
                className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-sm transition-all ${
                  isCurrent
                    ? 'border-primary bg-primary text-primary-foreground shadow-md'
                    : isCompleted
                      ? 'border-green-200/60 bg-green-50/60 text-green-700 dark:border-green-800/30 dark:bg-green-950/20'
                      : 'border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{phaseEntry.title}</span>
                  <span className="text-xs text-muted-foreground">Phase {phaseEntry.phaseNumber}</span>
                </div>
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
