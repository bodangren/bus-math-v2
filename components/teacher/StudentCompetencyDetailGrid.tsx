'use client';

import { computeCompetencyColor, cellBgClass, type StudentCompetencyDetail } from '@/lib/teacher/competency-heatmap';

interface StudentCompetencyDetailGridProps {
  detail: StudentCompetencyDetail;
}

export function StudentCompetencyDetailGrid({ detail }: StudentCompetencyDetailGridProps) {
  const { displayName, username, competencies } = detail;

  if (competencies.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground">
        No competency data found for this student.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          {displayName} (@{username})
        </h2>
        <p className="text-sm text-muted-foreground">
          {competencies.length} standard{competencies.length !== 1 ? 's' : ''}
        </p>
      </section>

      <div className="overflow-x-auto rounded-md border border-border">
        <table
          className="min-w-full border-collapse text-sm"
          aria-label="Student competency detail"
        >
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Standard
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Description
              </th>
              <th scope="col" className="px-3 py-2 text-center font-medium">
                Mastery Level
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Unit
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Primary Lesson
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {competencies.map(comp => (
              <tr key={comp.standardId} className="bg-background hover:bg-muted/10">
                <td className="px-3 py-2 font-medium">
                  <div>{comp.standardCode}</div>
                  {comp.category && (
                    <div className="text-xs text-muted-foreground font-normal">{comp.category}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {comp.standardDescription}
                </td>
                <td className={`p-0 text-center font-medium tabular-nums ${cellBgClass(computeCompetencyColor(comp.masteryLevel))}`}>
                  <span className="block px-3 py-2">
                    {comp.masteryLevel !== null ? `${comp.masteryLevel}%` : '—'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {comp.unitNumber ? `Unit ${comp.unitNumber}` : '—'}
                </td>
                <td className="px-3 py-2">
                  {comp.lessonTitle || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
