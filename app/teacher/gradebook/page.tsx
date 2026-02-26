import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { getServerSessionClaims } from '@/lib/auth/server';
import { db } from '@/lib/db/drizzle';
import { profiles } from '@/lib/db/schema';
import { fetchCourseOverviewData } from '@/lib/teacher/course-overview-data';
import { CourseOverviewGrid } from '@/components/teacher/CourseOverviewGrid';

export default async function CourseGradebookPage() {
  const claims = await getServerSessionClaims();
  if (!claims) redirect('/auth/login?redirect=/teacher/gradebook');

  const [teacher] = await db
    .select({ id: profiles.id, username: profiles.username, role: profiles.role, organizationId: profiles.organizationId })
    .from(profiles)
    .where(eq(profiles.id, claims.sub))
    .limit(1);

  if (!teacher) redirect('/auth/login');
  if (teacher.role !== 'teacher' && teacher.role !== 'admin') redirect('/student/dashboard');

  const { rows, units } = await fetchCourseOverviewData(teacher.organizationId);

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
