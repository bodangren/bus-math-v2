'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
// ArrowUp/ArrowDown used inline in column header button; ArrowUpDown used as default icon
import {
  cellBgClass,
  cellColorLabel,
  sortRowsByName,
  applyStudentRowUpdate,
  type GradebookLesson,
  type GradebookRow,
} from '@/lib/teacher/gradebook';
import {
  SubmissionDetailModal,
  type SelectedCell,
} from '@/components/teacher/SubmissionDetailModal';
import {
  TeacherStudentActions,
  type StudentAccountUpdate,
} from '@/components/teacher/TeacherStudentActions';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GradebookGridProps {
  rows: GradebookRow[];
  lessons: GradebookLesson[];
  /** Used to build lesson header links: /teacher/units/[unitNumber]/lessons/[lessonId] */
  unitNumber: number;
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

export function GradebookGrid({ rows, lessons, unitNumber }: GradebookGridProps) {
  const [managedRows, setManagedRows] = useState(rows);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);

  function handleStudentUpdated(update: StudentAccountUpdate) {
    setManagedRows(current => applyStudentRowUpdate(current, update));
  }

  if (managedRows.length === 0) {
    return <EmptyState message="No students found in this gradebook." />;
  }

  if (lessons.length === 0) {
    return <EmptyState message="No lessons configured for this unit." />;
  }

  const sorted = sortRowsByName(managedRows);
  const displayRows = sortDir === 'asc' ? sorted : [...sorted].reverse();

  function toggleSort() {
    setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
  }

  // Separate regular lessons from the unit test (L11) for visual distinction
  const regularLessons = lessons.filter(l => !l.isUnitTest);
  const unitTestLesson = lessons.find(l => l.isUnitTest);

  return (
    <>
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

            {/* Regular lesson headers L1–L10 — link to lesson view */}
            {regularLessons.map(lesson => (
              <th
                key={lesson.lessonId}
                scope="col"
                className="px-2 py-2 text-center font-medium"
              >
                <Link
                  href={`/teacher/units/${unitNumber}/lessons/${lesson.lessonId}`}
                  title={lesson.lessonTitle}
                  className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  L{lesson.orderIndex}
                </Link>
              </th>
            ))}

            {/* Unit test column — separated by a heavier left border */}
            {unitTestLesson && (
              <th
                scope="col"
                className="border-l-2 border-border px-2 py-2 text-center font-semibold text-foreground"
              >
                <Link
                  href={`/teacher/units/${unitNumber}/lessons/${unitTestLesson.lessonId}`}
                  title={unitTestLesson.lessonTitle}
                  className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Unit Test
                </Link>
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
                {/* Frozen student name cell with row actions */}
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium text-foreground"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div>{row.displayName}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        @{row.username}
                      </div>
                    </div>
                    <TeacherStudentActions
                      studentId={row.studentId}
                      username={row.username}
                      displayName={row.displayName}
                      onStudentUpdated={handleStudentUpdated}
                    />
                  </div>
                </th>

                {/* Regular lesson cells */}
                {regularLessons.map(lesson => {
                  const cell = cellByLessonId.get(lesson.lessonId);
                  const color = cell?.color ?? 'gray';
                  const mastery = cell?.masteryLevel ?? null;
                  const independentPractice = cell?.independentPractice;
                  const { assessment } = cell || {};
                  const colorLabel = cellColorLabel(color);
  
                  return (
                    <td
                      key={lesson.lessonId}
                      className={`px-2 py-1 text-center font-medium tabular-nums ${cellBgClass(color)}`}
                      aria-label={`${row.displayName} ${lesson.lessonTitle} — ${colorLabel}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCell({
                            studentId: row.studentId,
                            studentName: row.displayName,
                            lessonId: lesson.lessonId,
                            lessonTitle: lesson.lessonTitle,
                          })
                        }
                        tabIndex={0}
                        className="w-full rounded px-1 py-1 hover:ring-2 hover:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-semibold">
                            {mastery !== null ? `${mastery}%` : '—'}
                          </span>
                          {(independentPractice?.completed || assessment?.completed) && (
                            <div className="flex gap-1 text-xs">
                              {independentPractice?.completed && (
                                <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white font-medium" title="Independent practice completed">
                                  IP
                                </span>
                              )}
                              {assessment?.completed && (
                                <span className="px-1.5 py-0.5 rounded-full bg-purple-500 text-white font-medium" title="Assessment completed">
                                  A: {assessment.score ?? '—'}/{assessment.maxScore ?? '—'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    </td>
                  );
                })}

                {/* Unit test cell */}
                {unitTestLesson && (() => {
                  const cell = cellByLessonId.get(unitTestLesson.lessonId);
                  const color = cell?.color ?? 'gray';
                  const mastery = cell?.masteryLevel ?? null;
                  const independentPractice = cell?.independentPractice;
                  const { assessment } = cell || {};
                  const colorLabel = cellColorLabel(color);
  
                  return (
                    <td
                      key={unitTestLesson.lessonId}
                      className={`border-l-2 border-border px-2 py-1 text-center font-semibold tabular-nums ${cellBgClass(color)}`}
                      aria-label={`${row.displayName} ${unitTestLesson.lessonTitle} — ${colorLabel}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCell({
                            studentId: row.studentId,
                            studentName: row.displayName,
                            lessonId: unitTestLesson.lessonId,
                            lessonTitle: unitTestLesson.lessonTitle,
                          })
                        }
                        tabIndex={0}
                        className="w-full rounded px-1 py-1 hover:ring-2 hover:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-semibold">
                            {mastery !== null ? `${mastery}%` : '—'}
                          </span>
                          {(independentPractice?.completed || assessment?.completed) && (
                            <div className="flex gap-1 text-xs">
                              {({} as any).independentPractice?.completed && (
                                <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white font-medium" title="Independent practice completed">
                                  IP
                                </span>
                              )}
                              {assessment?.completed && (
                                <span className="px-1.5 py-0.5 rounded-full bg-purple-500 text-white font-medium" title="Assessment completed">
                                  A: {assessment.score ?? '—'}/{assessment.maxScore ?? '—'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    </td>
                  );
                })()}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {selectedCell && (
      <SubmissionDetailModal
        selected={selectedCell}
        onClose={() => setSelectedCell(null)}
      />
    )}
    </>
  );
}
