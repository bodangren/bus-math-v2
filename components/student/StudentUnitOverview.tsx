import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Rocket, Target, Trophy, Wrench } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Lesson } from '@/lib/db/schema/validators';

interface UnitOverview {
  id: string;
  title: string;
  description: string;
  rationale: string;
  sequence: number;
  practiceTestHref?: string;
}

interface StudentUnitOverviewProps {
  unit: UnitOverview;
  lessons: Lesson[];
}

const practiceTestMessages: Record<
  number,
  {
    title: string;
    description: string;
    tip: string;
  }
> = {
  1: {
    title: 'Practice Test & Investor Rehearsal',
    description:
      'Run the Unit 1 practice test to rehearse investor questions, pull randomized items from every lesson, and capture explanations you can teach back.',
    tip: 'Finish Lesson 07 first so you can apply Sarah’s audit trail standards while you review results.'
  },
  2: {
    title: 'Practice Test & Month-End Drill',
    description:
      'Launch the Unit 2 drill to refresh adjusting entries, reconciliation controls, and data validation with fresh question draws every time.',
    tip: 'Complete the capstone lesson before the drill so you can narrate the end-to-end close process during review.'
  },
  3: {
    title: 'Practice Test & Storyboard Mastery',
    description:
      'Trigger the Unit 3 practice test to rehearse integrated statements, dashboard storytelling, and QA checklists.',
    tip: 'Complete the integration sprint before reviewing so you can map answers back to Sarah’s business rules.'
  },
  4: {
    title: 'Practice Test & Café Analysis Confidence',
    description:
      'Use the Unit 4 practice test to sharpen data cleaning, regression analysis, and insight writing before showcasing your café playbook.',
    tip: 'Finish the pitch rehearsal lesson first to leverage the same visual storytelling techniques while reviewing responses.'
  },
  5: {
    title: 'Practice Test & Payroll Mastery',
    description:
      'Launch the Unit 5 drill to validate gross-to-net calculations, overtime logic, and compliance guardrails.',
    tip: 'Complete the QA automation lesson before reviewing so you can double-check every scenario with the same rubric.'
  },
  6: {
    title: 'Practice Test & Pricing Strategy Confidence',
    description:
      'Use the Unit 6 test to rehearse contribution margin decisions, break-even modeling, and markup vs. margin storytelling.',
    tip: 'Finish the production optimization sprint before the test to apply QA polishing to your answer review.'
  },
  7: {
    title: 'Practice Test & Asset Strategy Mastery',
    description:
      'Launch the Unit 7 drill to practice depreciation trade-offs, FIFO/LIFO implications, and strategic recommendations.',
    tip: 'Complete the board readiness lesson before review so you can annotate responses with the same storytelling arc.'
  },
  8: {
    title: 'Practice Test & Investor Readiness',
    description:
      'Use the Unit 8 test to rehearse investor Q&A, integrated models, and year-one strategy decks.',
    tip: 'Complete the investor rehearsal sprint first so you can cross-check each answer with presentation criteria.'
  }
};

const uniqueSkills = (lessons: Lesson[]) => {
  const tags = lessons.flatMap((lesson) => lesson.metadata?.tags ?? []);
  return Array.from(new Set(tags)).slice(0, 8);
};

const buildingGoals = (lessons: Lesson[]) =>
  lessons
    .flatMap((lesson) => lesson.learningObjectives ?? [])
    .filter(Boolean)
    .slice(0, 4);

const totalHours = (lessons: Lesson[]) => {
  const minutes = lessons.reduce((sum, lesson) => sum + (lesson.metadata?.duration ?? 45), 0);
  return Math.round((minutes / 60) * 10) / 10;
};

const lessonPath = (lesson: Lesson) => {
  if (lesson.slug) {
    return lesson.slug.startsWith('/student') ? lesson.slug : `/student/${lesson.slug}`;
  }

  const unit = lesson.unitNumber.toString().padStart(2, '0');
  const lessonNumber = lesson.orderIndex.toString().padStart(2, '0');
  return `/student/unit${unit}/lesson${lessonNumber}`;
};

export function StudentUnitOverview({ unit, lessons }: StudentUnitOverviewProps) {
  const practiceTest = practiceTestMessages[unit.sequence] ?? {
    title: 'Practice Test Ready',
    description: `Launch the practice test to rehearse skills from Unit ${unit.sequence}.`,
    tip: 'Complete the latest lesson first so you can reinforce the freshest skills during review.'
  };

  const lessonHours = totalHours(lessons);
  const skills = uniqueSkills(lessons);
  const goals = buildingGoals(lessons);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="text-sm">
          Unit {unit.sequence} • {lessonHours} Hours • Grade 12 Business Operations
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">{unit.title}</h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">{unit.description}</p>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Rocket className="h-6 w-6" />
            Your Business Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-blue-800 dark:text-blue-200">{unit.rationale}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Target className="h-5 w-5" />
              What You’ll Build
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="mt-1 text-green-600">▶</span>
                  <span>{goal}</span>
                </li>
              ))}
              {goals.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Learning objectives will publish once Supabase data is seeded.
                </p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Wrench className="h-5 w-5" />
              Skills You’ll Master
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Skills appear here once lesson metadata includes tags.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <Trophy className="h-5 w-5" />
            Final Showcase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-purple-900 dark:text-purple-100">
          <p>Every unit concludes with a professional presentation or live demonstration.</p>
          <p>Use your dashboards, models, and practice test reflections to narrate Sarah’s growth.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            Lessons in this Unit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex flex-col gap-3 rounded-lg border border-border/40 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Lesson {lesson.orderIndex.toString().padStart(2, '0')}
                </p>
                <h3 className="text-lg font-medium">{lesson.title}</h3>
                <p className="text-sm text-muted-foreground">{lesson.description}</p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <Badge variant="outline" className="text-xs">
                  {(lesson.metadata?.duration ?? 45) / 60} hrs
                </Badge>
                <Button variant="secondary" asChild size="sm" className="gap-1">
                  <Link href={lessonPath(lesson)}>
                    Open Lesson
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            {practiceTest.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{practiceTest.description}</p>
          <p className="font-medium text-foreground">{practiceTest.tip}</p>
          <Button asChild className="mt-2 w-fit">
            <Link href={unit.practiceTestHref ?? `/student/unit${unit.sequence.toString().padStart(2, '0')}/practice-test`}>
              Launch Practice Test
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
