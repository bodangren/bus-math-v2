import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { CompetencyHeatmapGrid } from '@/components/teacher/CompetencyHeatmapGrid';
import type { CompetencyHeatmapResponse } from '@/lib/teacher/competency-heatmap';

export default async function TeacherCompetencyPage() {
  const claims = await requireTeacherSessionClaims('/teacher/competency');

  const competencyHeatmap = await fetchInternalQuery(
    internal.teacher.getTeacherCompetencyHeatmapData,
    {
      userId: claims.sub as never,
    },
  );

  if (!competencyHeatmap) redirect('/teacher');

  const { rows, standards } = competencyHeatmap as CompetencyHeatmapResponse;

  return (
    <main className="min-h-screen bg-muted/10 py-10">
      <div className="container mx-auto px-4 space-y-6">
        <header className="space-y-1">
          <Link href="/teacher" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Teacher Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Competency Heatmap
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} student{rows.length !== 1 ? 's' : ''} · {standards.length} standard{standards.length !== 1 ? 's' : ''} ·
            Color indicates mastery level: {<span className="ml-2 text-green-600 font-medium">green</span>} ≥80%, {<span className="text-yellow-600 font-medium">yellow</span>} 50-79%, {<span className="text-red-600 font-medium">red</span>} &lt;50%, {<span className="text-gray-400 font-medium">gray</span>} no data
          </p>
        </header>

        <section aria-label="Competency heatmap">
          <CompetencyHeatmapGrid rows={rows} standards={standards} />
        </section>
      </div>
    </main>
  );
}
