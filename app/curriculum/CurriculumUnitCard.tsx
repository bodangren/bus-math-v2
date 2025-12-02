'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { UnitCurriculum } from "./types";

interface CurriculumUnitCardProps {
  unit: UnitCurriculum;
}

export function CurriculumUnitCard({ unit }: CurriculumUnitCardProps) {
  const router = useRouter();
  const firstLesson = unit.lessons[0];

  const handleCardClick = () => {
    if (firstLesson) {
      router.push(`/student/lesson/${firstLesson.slug}`);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!firstLesson) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Card
      className="border-border/40 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/30 hover:bg-accent/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 h-full cursor-pointer group"
      onClick={firstLesson ? handleCardClick : undefined}
      onKeyDown={firstLesson ? handleKeyDown : undefined}
      tabIndex={firstLesson ? 0 : -1}
      role={firstLesson ? "button" : undefined}
      aria-label={firstLesson ? `View ${unit.title}` : `${unit.title} (no lessons yet)`}
    >
      <CardHeader>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Badge variant="outline">Unit {unit.unitNumber}</Badge>
          <span>
            {unit.lessons.length} lesson{unit.lessons.length === 1 ? "" : "s"}
          </span>
        </div>
        <CardTitle className="text-2xl group-hover:text-primary transition-colors">
          {unit.title}
        </CardTitle>
        <CardDescription>{unit.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {unit.objectives.length > 0 && (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Learning Objectives
            </p>
            <ul className="space-y-2 text-sm text-foreground/90">
              {unit.objectives.slice(0, 4).map((objective) => (
                <li key={objective} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{objective}</span>
                </li>
              ))}
              {unit.objectives.length > 4 && (
                <li className="text-muted-foreground text-xs">
                  +{unit.objectives.length - 4} more objectives in lesson plans
                </li>
              )}
            </ul>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Lessons
          </p>
          <ol className="space-y-2">
            {unit.lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-start justify-between gap-4"
                onClick={(event) => event.stopPropagation()}
              >
                <div>
                  <Link
                    href={`/student/lesson/${lesson.slug}`}
                    className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                  >
                    {lesson.title}
                  </Link>
                  {lesson.description && (
                    <p className="text-sm text-muted-foreground">
                      {lesson.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  L{lesson.orderIndex}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
