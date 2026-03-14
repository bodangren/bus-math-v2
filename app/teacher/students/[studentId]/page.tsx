import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NextLessonCard } from '@/components/dashboard/NextLessonCard';
import { Progress } from '@/components/ui/progress';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import {
  clampTeacherProgressPercentage,
  formatTeacherLastActive,
  formatTeacherProgressPercentage,
} from '@/lib/teacher/progress';
import { buildTeacherStudentDetailViewModel } from '@/lib/teacher/student-detail';
import { formatCurriculumSegmentLabel } from '@/lib/curriculum/segment-labels';

interface TeacherStudentDetailPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

interface TeacherStudentDetailResponse {
  status: 'success';
  organizationName: string;
  student: {
    id: string;
    username: string;
    displayName: string | null;
  };
  snapshot: {
    completedPhases: number;
    totalPhases: number;
    progressPercentage: number;
    lastActive: string | null;
  };
  units: Array<{
    unitNumber: number;
    unitTitle: string;
    lessons: Array<{
      id: string;
      unitNumber: number;
      title: string;
      slug: string;
      description: string | null;
      totalPhases: number;
      completedPhases: number;
      progressPercentage: number;
    }>;
  }>;
}

export default async function TeacherStudentDetailPage({
  params,
}: TeacherStudentDetailPageProps) {
  const { studentId } = await params;

  const claims = await requireTeacherSessionClaims(`/teacher/students/${studentId}`);

  const result = await fetchInternalQuery(
    internal.teacher.getTeacherStudentDetail,
    {
      userId: claims.sub as never,
      studentId: studentId as never,
    },
  );

  if (!result || result.status === 'not_found') {
    notFound();
  }

  if (result.status === 'unauthorized') {
    redirect('/teacher');
  }

  const { organizationName, student, snapshot, units } =
    result as TeacherStudentDetailResponse;
  const viewModel = buildTeacherStudentDetailViewModel({ student, snapshot, units });

  return (
    <main className="min-h-screen bg-muted/10 py-10">
      <div className="container mx-auto max-w-5xl px-4 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {organizationName}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Student Details
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/teacher">Back to dashboard</Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>{viewModel.studentLabel}</CardTitle>
                <CardDescription>@{student.username}</CardDescription>
              </div>
              <Badge variant="outline" className={viewModel.status.emphasisClassName}>
                {viewModel.status.label}
              </Badge>
            </div>
            <CardDescription>{viewModel.guidance}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Progress</p>
              <div className="flex items-center gap-3">
                <Progress
                  value={clampTeacherProgressPercentage(snapshot.progressPercentage)}
                  aria-label={`${student.username} progress`}
                  className="bg-muted/60"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {formatTeacherProgressPercentage(snapshot.progressPercentage)}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Completed Phases
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {snapshot.completedPhases} / {snapshot.totalPhases}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Last Active
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatTeacherLastActive(snapshot.lastActive)}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Lessons Completed
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {viewModel.summary.completedLessons} / {viewModel.summary.totalLessons}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Units Completed
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {viewModel.summary.completedUnits} / {viewModel.summary.totalUnits}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Unit Progress</CardTitle>
              <CardDescription>
                Review where this student is moving forward and where support may be needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {viewModel.unitSummaries.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No published unit data is available yet.
                </div>
              ) : (
                viewModel.unitSummaries.map((unit) => (
                  <div key={unit.unitNumber} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {formatCurriculumSegmentLabel(unit.unitNumber)}
                        </p>
                        <p className="font-semibold text-foreground">{unit.unitTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {unit.completedLessons} of {unit.totalLessons} lessons complete
                        </p>
                      </div>
                      <Badge variant="outline">
                        {formatTeacherProgressPercentage(unit.progressPercentage)}
                      </Badge>
                    </div>
                    {unit.nextLesson ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Next lesson:{' '}
                        <span className="font-medium text-foreground">
                          {unit.nextLesson.title}
                        </span>
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <NextLessonCard
            heading="Next Best Lesson"
            description="Use this to direct the student back into the most relevant published lesson."
            lesson={viewModel.nextLesson}
            emptyMessage={viewModel.guidance}
          />
        </div>
      </div>
    </main>
  );
}
