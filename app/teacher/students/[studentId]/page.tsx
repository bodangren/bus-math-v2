import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { formatLastActive } from '@/components/teacher/TeacherDashboardContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getServerSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

interface StudentProgressSnapshot {
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
}

const percentageFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

function clampPercentage(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatPercentage(value: number) {
  return `${percentageFormatter.format(clampPercentage(value))}%`;
}

interface TeacherStudentDetailPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function TeacherStudentDetailPage({
  params,
}: TeacherStudentDetailPageProps) {
  const { studentId } = await params;

  const claims = await getServerSessionClaims();
  if (!claims) {
    redirect(`/auth/login?redirect=/teacher/students/${studentId}`);
  }

  if (claims.role !== 'teacher' && claims.role !== 'admin') {
    redirect('/student/dashboard');
  }

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
    redirect('/auth/login?redirect=/teacher');
  }

  const { organizationName, student, snapshot } = result as {
    status: 'success';
    organizationName: string;
    student: {
      id: string;
      username: string;
      displayName: string | null;
    };
    snapshot: StudentProgressSnapshot;
  };

  return (
    <main className="min-h-screen bg-muted/10 py-10">
      <div className="container mx-auto max-w-3xl px-4 space-y-6">
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
          <CardHeader>
            <CardTitle>{student.displayName ?? student.username}</CardTitle>
            <CardDescription>@{student.username}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Progress</p>
              <div className="flex items-center gap-3">
                <Progress
                  value={clampPercentage(snapshot.progressPercentage)}
                  aria-label={`${student.username} progress`}
                  className="bg-muted/60"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {formatPercentage(snapshot.progressPercentage)}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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
                  {formatLastActive(snapshot.lastActive)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
