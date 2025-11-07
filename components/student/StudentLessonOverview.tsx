import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Lightbulb,
  PlayCircle,
  Target,
  Users
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Lesson, Phase } from '@/lib/db/schema/validators';

interface LessonUnitSummary {
  title: string;
  sequence: number;
}

interface StudentLessonOverviewProps {
  lesson: Lesson;
  unit: LessonUnitSummary;
  phases?: Phase[];
}

const phaseIcons: Record<string, typeof PlayCircle> = {
  intro: PlayCircle,
  example: BookOpen,
  practice: Users,
  challenge: Target,
  assessment: CheckCircle2,
  reflection: Lightbulb
};

const defaultPedagogy = [
  'Authentic scenario planning tied to Sarah Chen’s TechStart journey',
  'Guided collaboration routines with turn-and-talk prompts',
  'Hands-on spreadsheets with immediate instructor feedback'
];

const buildLessonHref = (lesson: Lesson) => {
  if (lesson.slug) {
    return lesson.slug.startsWith('/student') ? lesson.slug : `/student/${lesson.slug}`;
  }

  const unitNumber = lesson.unitNumber.toString().padStart(2, '0');
  const lessonNumber = lesson.orderIndex.toString().padStart(2, '0');
  return `/student/unit${unitNumber}/lesson${lessonNumber}`;
};

const formattedDuration = (lesson: Lesson) => {
  const hours = (lesson.metadata?.duration ?? 60) / 60;
  return Math.round(hours * 10) / 10;
};

export function StudentLessonOverview({ lesson, unit, phases = [] }: StudentLessonOverviewProps) {
  const baseLessonHref = buildLessonHref(lesson);
  const lessonNumber = lesson.orderIndex;
  const concepts = lesson.metadata?.tags ?? [];
  const sortedPhases = [...phases].sort((a, b) => a.phaseNumber - b.phaseNumber);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/student" className="hover:text-foreground">
          Student
        </Link>
        <ArrowRight className="h-3 w-3" />
        <Link href={`/student/unit${unit.sequence.toString().padStart(2, '0')}`} className="hover:text-foreground">
          {unit.title}
        </Link>
        <ArrowRight className="h-3 w-3" />
        <span className="text-foreground">Lesson {lessonNumber}</span>
      </nav>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Badge variant="outline" className="text-sm">
            Unit {unit.sequence} • Lesson {lessonNumber}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Clock className="mr-1 h-3 w-3" />
            {formattedDuration(lesson)}h {formattedDuration(lesson) > 1 ? '• Multi-day' : ''}
          </Badge>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{lesson.title}</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          {lesson.description ?? 'Lesson description forthcoming once Supabase content is seeded.'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Target className="h-5 w-5" />
              What You’ll Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(lesson.learningObjectives ?? ['Learning objectives coming soon.']).map((objective, index) => (
                <li key={`${objective}-${index}`} className="flex items-start gap-2">
                  <span className="mt-1 text-blue-600">▶</span>
                  <span className="text-sm leading-relaxed">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <BookOpen className="h-5 w-5" />
              Key Concepts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {concepts.length > 0 ? (
              <div className="space-y-2">
                {concepts.slice(0, 3).map((concept, index) => (
                  <div key={`${concept}-${index}`} className="rounded-md bg-green-50 p-2 text-sm font-medium text-green-800 dark:bg-green-950/20 dark:text-green-200">
                    {concept}
                  </div>
                ))}
                {concepts.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{concepts.length - 3} more concepts</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Concept tags will surface after lessons are migrated.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {sortedPhases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Lesson Phases
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Every lesson follows the six-phase routine to keep Sarah’s business narrative grounded in data.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedPhases.map((phase) => {
              const Icon = phaseIcons[phase.metadata.phaseType ?? 'intro'] ?? PlayCircle;

              return (
                <div
                  key={phase.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/40 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{phase.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {phase.contentBlocks.find((block) => block.type === 'markdown')?.content ??
                          'Phase description will appear when content blocks are populated.'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`${baseLessonHref}/phase-${phase.phaseNumber.toString().padStart(2, '0')}`}>
                      Start Phase
                    </Link>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-200">
            <Users className="h-5 w-5" />
            How You’ll Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {defaultPedagogy.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 text-orange-600">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
