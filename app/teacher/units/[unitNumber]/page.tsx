import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { GradebookGrid } from '@/components/teacher/GradebookGrid';
import type { GradebookLesson, GradebookRow } from '@/lib/teacher/gradebook';
import { formatCurriculumSegmentLabel } from '@/lib/curriculum/segment-labels';

interface PageProps {
  params: Promise<{ unitNumber: string }>;
}

export default async function UnitGradebookPage({ params }: PageProps) {
  const { unitNumber: unitNumberParam } = await params;
  const unitNumber = parseInt(unitNumberParam, 10);

  if (Number.isNaN(unitNumber) || unitNumber < 1) {
    notFound();
  }

  const claims = await requireTeacherSessionClaims(`/teacher/units/${unitNumber}`);

  const gradebook = await fetchInternalQuery(
    internal.teacher.getTeacherGradebookData,
    {
      userId: claims.sub as never,
      unitNumber,
    },
  );

  if (!gradebook) {
    redirect('/teacher');
  }

  const { rows, lessons } = gradebook as {
    rows: GradebookRow[];
    lessons: GradebookLesson[];
  };

  return (
    <main className="min-h-screen bg-muted/10 py-10">
      <div className="container mx-auto px-4 space-y-6">
        <header className="space-y-1">
          <Link
            href="/teacher"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Teacher Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {formatCurriculumSegmentLabel(unitNumber)} — Gradebook
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} student{rows.length !== 1 ? 's' : ''} ·{' '}
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
            {lessons.some(l => l.isUnitTest) ? ' (including unit test)' : ''}
          </p>
        </header>

        <section aria-label={`${formatCurriculumSegmentLabel(unitNumber)} gradebook`}>
          <GradebookGrid rows={rows} lessons={lessons} unitNumber={unitNumber} />
        </section>
      </div>
    </main>
  );
}
