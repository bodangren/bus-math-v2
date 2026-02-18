'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cellBgClass, cellColorLabel, sortRowsByName } from '@/lib/teacher/gradebook';
import type { CourseOverviewRow, UnitColumn } from '@/lib/teacher/course-overview';

interface CourseOverviewGridProps {
  rows: CourseOverviewRow[];
  units: UnitColumn[];
}

type SortDirection = 'asc' | 'desc';

export function CourseOverviewGrid({ rows, units }: CourseOverviewGridProps) {
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
        No students found in this gradebook.
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
        No units configured for this course.
      </div>
    );
  }

  // CourseOverviewRow has the same shape as GradebookRow for sorting purposes
  const sortable = rows.map(r => ({ ...r, cells: [] as never[] }));
  const sorted = sortRowsByName(sortable);
  const orderedIds = sortDir === 'asc' ? sorted.map(r => r.studentId) : [...sorted].reverse().map(r => r.studentId);
  const rowById = new Map(rows.map(r => [r.studentId, r]));
  const displayRows = orderedIds.map(id => rowById.get(id)!);

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table
        className="min-w-full border-collapse text-sm"
        aria-label="Course overview — student mastery by unit"
      >
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {/* Frozen student-name header */}
            <th
              scope="col"
              className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left font-medium"
            >
              <button
                type="button"
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                aria-label="Sort by student name"
                className="flex items-center gap-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Student
                {sortDir === 'asc'
                  ? <ArrowUp className="size-3" aria-hidden="true" />
                  : sortDir === 'desc'
                    ? <ArrowDown className="size-3" aria-hidden="true" />
                    : <ArrowUpDown className="size-3" aria-hidden="true" />}
              </button>
            </th>

            {/* Unit column headers — each links to the unit gradebook */}
            {units.map(unit => (
              <th
                key={unit.unitNumber}
                scope="col"
                className="px-3 py-2 text-center font-medium"
              >
                <Link
                  href={`/teacher/units/${unit.unitNumber}`}
                  className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Unit {unit.unitNumber}
                </Link>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {displayRows.map(row => {
            const cellByUnit = new Map(row.cells.map(c => [c.unitNumber, c]));

            return (
              <tr key={row.studentId} className="bg-background hover:bg-muted/10">
                {/* Frozen student name */}
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium text-foreground"
                >
                  <div>{row.displayName}</div>
                  <div className="text-xs text-muted-foreground font-normal">@{row.username}</div>
                </th>

                {/* Unit cells */}
                {units.map(unit => {
                  const cell = cellByUnit.get(unit.unitNumber);
                  const color = cell?.color ?? 'gray';
                  const mastery = cell?.avgMastery ?? null;

                  return (
                    <td
                      key={unit.unitNumber}
                      className={`px-3 py-2 text-center font-medium tabular-nums ${cellBgClass(color)}`}
                      aria-label={`${row.displayName} Unit ${unit.unitNumber} — ${cellColorLabel(color)}`}
                    >
                      {mastery !== null ? `${mastery}%` : '—'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
