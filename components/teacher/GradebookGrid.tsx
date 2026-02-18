'use client';

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  cellBgClass,
  cellColorLabel,
  sortRowsByName,
  type GradebookLesson,
  type GradebookRow,
} from '@/lib/teacher/gradebook';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GradebookGridProps {
  rows: GradebookRow[];
  lessons: GradebookLesson[];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GradebookGrid
// ---------------------------------------------------------------------------

type SortDirection = 'asc' | 'desc';

export function GradebookGrid({ rows, lessons }: GradebookGridProps) {
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  if (rows.length === 0) {
    return <EmptyState message="No students found in this gradebook." />;
  }

  if (lessons.length === 0) {
    return <EmptyState message="No lessons configured for this unit." />;
  }

  const sorted = sortRowsByName(rows);
  const displayRows = sortDir === 'asc' ? sorted : [...sorted].reverse();

  function toggleSort() {
    setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
  }

  const SortIcon = sortDir === 'asc' ? ArrowUp : ArrowDown;

  // Separate regular lessons from the unit test (L11) for visual distinction
  const regularLessons = lessons.filter(l => !l.isUnitTest);
  const unitTestLesson = lessons.find(l => l.isUnitTest);
  const orderedLessons = unitTestLesson
    ? [...regularLessons, unitTestLesson]
    : regularLessons;

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table
        className="min-w-full border-collapse text-sm"
        aria-label="Gradebook — student progress by lesson"
      >
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {/* Frozen student-name column header */}
            <th
              scope="col"
              className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left font-medium"
            >
              <button
                type="button"
                onClick={toggleSort}
                aria-label="Sort by student name"
                className="flex items-center gap-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Student
                {sortDir === 'asc' ? (
                  <ArrowUp className="size-3" aria-hidden="true" />
                ) : sortDir === 'desc' ? (
                  <ArrowDown className="size-3" aria-hidden="true" />
                ) : (
                  <ArrowUpDown className="size-3" aria-hidden="true" />
                )}
              </button>
            </th>

            {/* Regular lesson headers L1–L10 */}
            {regularLessons.map(lesson => (
              <th
                key={lesson.lessonId}
                scope="col"
                className="px-2 py-2 text-center font-medium"
                title={lesson.lessonTitle}
              >
                L{lesson.orderIndex}
              </th>
            ))}

            {/* Unit test column — separated by a heavier left border */}
            {unitTestLesson && (
              <th
                scope="col"
                className="border-l-2 border-border px-2 py-2 text-center font-semibold text-foreground"
                title={unitTestLesson.lessonTitle}
              >
                Unit Test
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {displayRows.map(row => {
            // Build a lookup from lessonId → cell for this student
            const cellByLessonId = new Map(row.cells.map(c => [c.lesson.lessonId, c]));

            return (
              <tr key={row.studentId} className="bg-background hover:bg-muted/10">
                {/* Frozen student name cell */}
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium text-foreground"
                >
                  <div>{row.displayName}</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    @{row.username}
                  </div>
                </th>

                {/* Regular lesson cells */}
                {regularLessons.map(lesson => {
                  const cell = cellByLessonId.get(lesson.lessonId);
                  const color = cell?.color ?? 'gray';
                  const mastery = cell?.masteryLevel ?? null;
                  const colorLabel = cellColorLabel(color);

                  return (
                    <td
                      key={lesson.lessonId}
                      className={`px-2 py-2 text-center font-medium tabular-nums ${cellBgClass(color)}`}
                      aria-label={`${row.displayName} ${lesson.lessonTitle} — ${colorLabel}`}
                    >
                      {mastery !== null ? `${mastery}%` : '—'}
                    </td>
                  );
                })}

                {/* Unit test cell */}
                {unitTestLesson && (() => {
                  const cell = cellByLessonId.get(unitTestLesson.lessonId);
                  const color = cell?.color ?? 'gray';
                  const mastery = cell?.masteryLevel ?? null;
                  const colorLabel = cellColorLabel(color);

                  return (
                    <td
                      key={unitTestLesson.lessonId}
                      className={`border-l-2 border-border px-2 py-2 text-center font-semibold tabular-nums ${cellBgClass(color)}`}
                      aria-label={`${row.displayName} ${unitTestLesson.lessonTitle} — ${colorLabel}`}
                    >
                      {mastery !== null ? `${mastery}%` : '—'}
                    </td>
                  );
                })()}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
