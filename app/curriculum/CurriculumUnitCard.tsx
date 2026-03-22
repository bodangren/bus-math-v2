'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";

import type { UnitCurriculum } from "./types";
import { formatCurriculumSegmentLabel } from "@/lib/curriculum/segment-labels";

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
    <div
      className="card-workbook p-0 relative overflow-hidden h-full cursor-pointer group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      onClick={firstLesson ? handleCardClick : undefined}
      onKeyDown={firstLesson ? handleKeyDown : undefined}
      tabIndex={firstLesson ? 0 : -1}
      role={firstLesson ? "button" : undefined}
      aria-label={firstLesson ? `View ${unit.title}` : `${unit.title} (no lessons yet)`}
    >
      {/* Watermark unit number */}
      <span
        className="absolute -right-1 -top-3 font-display font-bold leading-none select-none pointer-events-none"
        style={{ fontSize: "5rem", color: "oklch(var(--primary) / 0.05)" }}
        aria-hidden="true"
      >
        {unit.unitNumber}
      </span>

      {/* Excel-style header bar */}
      <div className="excel-header px-5 py-3 flex items-center justify-between">
        <span className="font-mono-num text-xs tracking-wider uppercase text-primary">
          {formatCurriculumSegmentLabel(unit.unitNumber)}
        </span>
        <span className="font-mono-num text-[10px] text-muted-foreground">
          {unit.lessons.length} lesson{unit.lessons.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Title & description */}
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
            {unit.title}
          </h3>
          <p className="text-sm text-muted-foreground font-body leading-relaxed">
            {unit.description}
          </p>
        </div>

        {/* Learning Objectives — compact */}
        {unit.objectives.length > 0 && (
          <div>
            <p className="font-mono-num text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
              Objectives
            </p>
            <ul className="space-y-1 text-sm text-foreground/90 font-body">
              {unit.objectives.slice(0, 3).map((objective) => (
                <li key={objective} className="flex gap-2 leading-snug">
                  <span className="text-primary mt-0.5 shrink-0">&#x2022;</span>
                  <span>{objective}</span>
                </li>
              ))}
              {unit.objectives.length > 3 && (
                <li className="text-muted-foreground text-xs font-body">
                  +{unit.objectives.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Lesson list — compact ledger rows */}
        <div>
          <p className="font-mono-num text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
            Lessons
          </p>
          <ol className="space-y-0.5">
            {unit.lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex items-baseline gap-3 py-1 border-b border-border/20 last:border-b-0"
                onClick={(event) => event.stopPropagation()}
              >
                <span className="font-mono-num text-[10px] text-muted-foreground/60 shrink-0 w-5 text-right">
                  {lesson.orderIndex}
                </span>
                <Link
                  href={`/student/lesson/${lesson.slug}`}
                  className="text-sm font-body text-foreground hover:text-primary transition-colors truncate focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm"
                >
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
