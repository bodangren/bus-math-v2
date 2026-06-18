'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";

import type { UnitCurriculum } from "./types";
import { formatCurriculumSegmentLabel } from "@/lib/curriculum/segment-labels";
import { cn } from "@/lib/utils";

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
      className="bg-background border border-border relative overflow-hidden h-full cursor-pointer group transition-all duration-200 hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring"
      onClick={firstLesson ? handleCardClick : undefined}
      onKeyDown={firstLesson ? handleKeyDown : undefined}
      tabIndex={firstLesson ? 0 : -1}
      role={firstLesson ? "button" : undefined}
      aria-label={firstLesson ? `View ${unit.title}` : `${unit.title} (no lessons yet)`}
    >
      {/* Watermark unit number */}
      <span
        className="absolute -right-2 -top-4 font-mono font-bold leading-none select-none pointer-events-none opacity-5 transition-opacity group-hover:opacity-10"
        style={{ fontSize: "5rem" }}
        aria-hidden="true"
      >
        {unit.unitNumber}
      </span>

      {/* Header bar */}
      <div className="border-b border-border/50 px-5 py-3 flex items-center justify-between bg-secondary/30">
        <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground font-bold">
          {formatCurriculumSegmentLabel(unit.unitNumber)}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
          {unit.lessons.length} LESSONS
        </span>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Title & description */}
        <div>
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 uppercase tracking-tight">
            {unit.title}
          </h3>
          <p className="text-xs text-muted-foreground font-body leading-relaxed line-clamp-2">
            {unit.description}
          </p>
        </div>

        {/* Learning Objectives — compact */}
        {unit.objectives.length > 0 && (
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-3 font-bold">
              Objectives
            </p>
            <ul className="space-y-2 text-xs text-foreground font-body">
              {unit.objectives.slice(0, 3).map((objective) => (
                <li key={objective} className="flex gap-2 leading-snug">
                  <span className="text-muted-foreground shrink-0 w-1 mt-1.5 h-1 bg-foreground rounded-none" />
                  <span>{objective}</span>
                </li>
              ))}
              {unit.objectives.length > 3 && (
                <li className="text-muted-foreground text-[10px] font-mono uppercase tracking-wider pt-1">
                  + {unit.objectives.length - 3} MORE
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Lesson list — compact ledger rows */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60 mb-3 font-bold">
            Structure
          </p>
          <ol className="space-y-px bg-border border border-border">
            {unit.lessons.slice(0, 5).map((lesson) => (
              <li
                key={lesson.id}
                className="bg-background"
                onClick={(event) => event.stopPropagation()}
              >
                <Link
                  href={`/student/lesson/${lesson.slug}`}
                  className="flex items-baseline gap-3 px-3 py-2 text-[11px] font-mono uppercase tracking-tight text-muted-foreground hover:text-foreground hover:bg-secondary transition-all truncate focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <span className="text-[10px] text-muted-foreground/40 shrink-0 w-4 text-right">
                    {lesson.orderIndex}
                  </span>
                  <span className="truncate">{lesson.title}</span>
                </Link>
              </li>
            ))}
            {unit.lessons.length > 5 && (
              <li className="bg-background px-3 py-1.5 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest text-center border-t border-border/50">
                + {unit.lessons.length - 5} more phases
              </li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
