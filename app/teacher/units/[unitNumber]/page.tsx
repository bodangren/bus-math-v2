import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getServerSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { GradebookGrid } from '@/components/teacher/GradebookGrid';

interface PageProps {
  params: Promise<{ unitNumber: string }>;
}

export default async function UnitGradebookPage({ params }: PageProps) {
  const { unitNumber: unitNumberParam } = await params;
  const unitNumber = parseInt(unitNumberParam, 10);

  if (Number.isNaN(unitNumber) || unitNumber < 1) {
    notFound();
  }

  // Auth
  const claims = await getServerSessionClaims();
  if (!claims) {
    redirect(`/auth/login?redirect=/teacher/units/${unitNumber}`);
  }
  if (claims.role !== 'teacher' && claims.role !== 'admin') {
    redirect('/student/dashboard');
  }

  const gradebook = await fetchInternalQuery(
    internal.teacher.getTeacherGradebookData,
    {
      userId: claims.sub as never,
      unitNumber,
    },
  );

  if (!gradebook) {
    redirect('/auth/login');
  }

  const { rows, lessons } = gradebook as {
    rows: Array<{
      studentId: string;
      displayName: string;
      username: string;
      cells: Array<{
        completionStatus: string;
        masteryLevel: number | null;
        color: string;
      }>;
    }>;
    lessons: Array<{ lessonId: string; lessonTitle: string; orderIndex: number; isUnitTest: boolean }>;
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
            Unit {unitNumber} — Gradebook
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} student{rows.length !== 1 ? 's' : ''} ·{' '}
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
            {lessons.some(l => l.isUnitTest) ? ' (including unit test)' : ''}
          </p>
        </header>

        <section aria-label={`Unit ${unitNumber} gradebook`}>
          <GradebookGrid rows={rows} lessons={lessons} unitNumber={unitNumber} />
        </section>
      </div>
    </main>
  );
}
