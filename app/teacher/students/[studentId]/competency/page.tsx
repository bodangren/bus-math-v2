import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { StudentCompetencyDetailGrid } from '@/components/teacher/StudentCompetencyDetailGrid';
import type { StudentCompetencyDetail } from '@/lib/teacher/competency-heatmap';

export default async function TeacherStudentCompetencyPage({ params }: { params: { studentId: string } }) {
  const claims = await requireTeacherSessionClaims('/teacher/students/[studentId]/competency');

  const studentCompetencyDetail = await fetchInternalQuery(
    internal.teacher.getTeacherStudentCompetencyDetail,
    {
      userId: claims.sub as never,
      studentId: params.studentId as never,
    },
  );

  if (!studentCompetencyDetail) redirect('/teacher/competency');

  const detail = studentCompetencyDetail as StudentCompetencyDetail;

  return (
    <main className="min-h-screen bg-muted/10 py-10">
      <div className="container mx-auto px-4 space-y-6">
        <header className="space-y-1">
          <Link href="/teacher/competency" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Competency Heatmap
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Student Competency Detail
          </h1>
        </header>

        <section aria-label="Student competency detail">
          <StudentCompetencyDetailGrid detail={detail} />
        </section>
      </div>
    </main>
  );
}
