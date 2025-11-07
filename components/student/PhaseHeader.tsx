import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Home,
  Lightbulb,
  PlayCircle,
  Target,
  Users
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Lesson, Phase } from '@/lib/db/schema/validators';
import { cn } from '@/lib/utils';
import { ResourceBasePathFixer } from '@/components/ResourceBasePathFixer';

type PhaseThemeKey = NonNullable<Phase['metadata']['phaseType']> | 'default';

const phaseThemes: Record<
  PhaseThemeKey,
  {
    label: string;
    icon: typeof PlayCircle;
    className: string;
  }
> = {
  intro: {
    label: 'Hook',
    icon: PlayCircle,
    className: 'text-red-600 bg-red-50/60 border-red-200/60 dark:bg-red-950/20 dark:border-red-900/30'
  },
  example: {
    label: 'Introduction',
    icon: BookOpen,
    className: 'text-primary bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30'
  },
  practice: {
    label: 'Guided Practice',
    icon: Users,
    className: 'text-green-700 bg-green-50/60 border-green-200/60 dark:bg-green-950/20 dark:border-green-800/30'
  },
  challenge: {
    label: 'Independent Practice',
    icon: Target,
    className: 'text-purple-700 bg-purple-50/60 border-purple-200/60 dark:bg-purple-950/20 dark:border-purple-800/30'
  },
  assessment: {
    label: 'Assessment',
    icon: CheckCircle2,
    className: 'text-orange-700 bg-orange-50/60 border-orange-200/60 dark:bg-orange-950/20 dark:border-orange-800/30'
  },
  reflection: {
    label: 'Reflection',
    icon: Lightbulb,
    className: 'text-indigo-700 bg-indigo-50/60 border-indigo-200/60 dark:bg-indigo-950/20 dark:border-indigo-800/30'
  },
  default: {
    label: 'Phase',
    icon: PlayCircle,
    className: 'text-primary bg-muted/30 border-border/50'
  }
};

export interface PhaseHeaderNavigationOverrides {
  unitHref?: string;
  lessonHref?: string;
  lessonLabel?: string;
  phaseLabel?: string;
}

export interface PhaseHeaderProps {
  lesson: Lesson;
  phase: Phase;
  phases: Phase[];
  unit?: {
    title?: string;
  };
  navigationOverrides?: PhaseHeaderNavigationOverrides;
}

export function PhaseHeader({ lesson, phase, phases, unit, navigationOverrides }: PhaseHeaderProps) {
  const sortedPhases = [...phases].sort((a, b) => a.phaseNumber - b.phaseNumber);
  const phaseIndex = Math.max(
    0,
    sortedPhases.findIndex((entry) => entry.id === phase.id || entry.phaseNumber === phase.phaseNumber)
  );
  const progress = ((phaseIndex + 1) / sortedPhases.length) * 100;

  const unitNumber = lesson.unitNumber.toString().padStart(2, '0');
  const lessonNumber = lesson.orderIndex.toString().padStart(2, '0');
  const baseLessonHref = lesson.slug
    ? (lesson.slug.startsWith('/student') ? lesson.slug : `/student/${lesson.slug}`)
    : `/student/unit${unitNumber}/lesson${lessonNumber}`;

  const unitHref = navigationOverrides?.unitHref ?? `/student/unit${unitNumber}`;
  const lessonHref = navigationOverrides?.lessonHref ?? baseLessonHref;

  const theme = phaseThemes[phase.metadata.phaseType ?? 'default'];
  const Icon = theme.icon;
  const breadcrumbPhaseLabel = navigationOverrides?.phaseLabel ?? phase.title;
  const breadcrumbLessonLabel = navigationOverrides?.lessonLabel ?? `Lesson ${lesson.orderIndex}`;

  return (
    <div className="mx-auto mb-8 max-w-4xl space-y-6 px-4">
      <ResourceBasePathFixer />

      <nav className="flex items-center space-x-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/student" className="flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" />
          Student
        </Link>
        <ArrowRight className="h-3 w-3" />
        <Link href={unitHref} className="hover:text-foreground">
          {unit?.title ?? `Unit ${unitNumber}`}
        </Link>
        <ArrowRight className="h-3 w-3" />
        <Link href={lessonHref} className="hover:text-foreground">
          {breadcrumbLessonLabel}
        </Link>
        <ArrowRight className="h-3 w-3" />
        <span className="text-foreground">{breadcrumbPhaseLabel}</span>
      </nav>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">Lesson Progress</span>
          <span className="font-medium text-muted-foreground">
            Phase {phaseIndex + 1} of {sortedPhases.length}
          </span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3 bg-muted/50" aria-label="Lesson progress" />
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20" />
        </div>
      </div>

      <Card className={cn('shadow-lg', theme.className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-background shadow-md">
                <Icon className="h-7 w-7" aria-hidden />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs font-medium">
                    Unit {unitNumber} • Lesson {lessonNumber}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {theme.label}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {phase.title}: {lesson.title}
                </CardTitle>
                {lesson.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
                )}
              </div>
            </div>
          </div>
          {(() => {
            const firstBlock = phase.contentBlocks[0];
            if (firstBlock && firstBlock.type === 'markdown') {
              return (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {firstBlock.content}
                </p>
              );
            }
            return null;
          })()}
        </CardHeader>
      </Card>
    </div>
  );
}
