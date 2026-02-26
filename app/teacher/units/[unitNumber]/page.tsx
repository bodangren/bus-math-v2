import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { getServerSessionClaims } from '@/lib/auth/server';
import { db } from '@/lib/db/drizzle';
import { profiles } from '@/lib/db/schema';
import { fetchGradebookData } from '@/lib/teacher/gradebook-data';
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

  const [teacher] = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      role: profiles.role,
      organizationId: profiles.organizationId,
    })
    .from(profiles)
    .where(eq(profiles.id, claims.sub))
    .limit(1);

  if (!teacher) {
    redirect('/auth/login');
  }

  if (teacher.role !== 'teacher' && teacher.role !== 'admin') {
    redirect('/student/dashboard');
  }

  const { rows, lessons } = await fetchGradebookData(unitNumber, teacher.organizationId);

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
