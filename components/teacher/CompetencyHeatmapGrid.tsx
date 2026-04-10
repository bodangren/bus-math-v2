'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cellBgClass, sortRowsByName } from '@/lib/teacher/gradebook';
import type { CompetencyHeatmapRow, CompetencyStandard } from '@/lib/teacher/competency-heatmap';

interface CompetencyHeatmapGridProps {
  rows: CompetencyHeatmapRow[];
  standards: CompetencyStandard[];
  onStudentClick?: (studentId: string) => void;
  onStandardClick?: (standardId: string) => void;
  onCellClick?: (studentId: string, standardId: string) => void;
}

type SortDirection = 'asc' | 'desc';

export function CompetencyHeatmapGrid({ rows, standards, onStudentClick, onStandardClick, onCellClick }: CompetencyHeatmapGridProps) {
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
        No students found in this competency heatmap.
      </div>
    );
  }

  if (standards.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
        No competency standards configured for this course.
      </div>
    );
  }

  const sortable = rows.map(r => ({ ...r, cells: [] as never[] }));
  const sorted = sortRowsByName(sortable);
  const orderedIds = sortDir === 'asc' ? sorted.map(r => r.studentId) : [...sorted].reverse().map(r => r.studentId);
  const rowById = new Map(rows.map(r => [r.studentId, r]));
  const displayRows = orderedIds.map(id => rowById.get(id)!);

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table
        className="min-w-full border-collapse text-sm"
        aria-label="Competency heatmap — student mastery by standard"
      >
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
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

            {standards.map(standard => (
              <th
                key={standard.id}
                scope="col"
                className="px-3 py-2 text-center font-medium"
              >
                {onStandardClick ? (
                  <button
                    type="button"
                    onClick={() => onStandardClick(standard.id)}
                    className="space-y-1 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1 transition-colors"
                  >
                    <div className="font-semibold">{standard.code}</div>
                    {standard.category && (
                      <div className="text-[10px] font-normal opacity-80">{standard.category}</div>
                    )}
                  </button>
                ) : (
                  <div className="space-y-1">
                    <div className="font-semibold">{standard.code}</div>
                    {standard.category && (
                      <div className="text-[10px] font-normal opacity-80">{standard.category}</div>
                    )}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {displayRows.map(row => (
            <tr key={row.studentId} className="bg-background hover:bg-muted/10">
              <th
                scope="row"
                className={`sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium text-foreground ${onStudentClick ? 'cursor-pointer hover:bg-muted/30' : ''}`}
              >
                {onStudentClick ? (
                  <button
                    type="button"
                    onClick={() => onStudentClick(row.studentId)}
                    className="space-y-1 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left w-full transition-colors"
                  >
                    <div>{row.displayName}</div>
                    <div className="text-xs text-muted-foreground font-normal">@{row.username}</div>
                  </button>
                ) : (
                  <div className="space-y-1">
                    <div>{row.displayName}</div>
                    <div className="text-xs text-muted-foreground font-normal">@{row.username}</div>
                  </div>
                )}
              </th>

              {row.cells.map(cell => (
                <td
                  key={cell.standardId}
                  className={`p-0 text-center font-medium tabular-nums ${cellBgClass(cell.color)} ${onCellClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={() => onCellClick?.(row.studentId, cell.standardId)}
                >
                  <span className="block px-3 py-2">
                    {cell.masteryLevel !== null ? `${cell.masteryLevel}%` : '—'}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
