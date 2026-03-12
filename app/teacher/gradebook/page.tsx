import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { CourseOverviewGrid } from '@/components/teacher/CourseOverviewGrid';
import type { CourseOverviewRow, UnitColumn } from '@/lib/teacher/course-overview';

export default async function CourseGradebookPage() {
  const claims = await requireTeacherSessionClaims('/teacher/gradebook');

  const courseOverview = await fetchInternalQuery(
    internal.teacher.getTeacherCourseOverviewData,
    {
      userId: claims.sub as never,
    },
  );

  if (!courseOverview) redirect('/teacher');

  const { rows, units } = courseOverview as {
    rows: CourseOverviewRow[];
    units: UnitColumn[];
  };

  return (
    <main className="min-h-screen bg-muted/10 py-10">
      <div className="container mx-auto px-4 space-y-6">
        <header className="space-y-1">
          <Link href="/teacher" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Teacher Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Course Gradebook
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} student{rows.length !== 1 ? 's' : ''} · {units.length} unit{units.length !== 1 ? 's' : ''} ·
            Click a unit header to view the lesson-level gradebook.
          </p>
        </header>

        <section aria-label="Course overview gradebook">
          <CourseOverviewGrid rows={rows} units={units} />
        </section>
      </div>
    </main>
  );
}
