import Link from 'next/link';
import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

import { formatLastActive } from '@/components/teacher/TeacherDashboardContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/db/drizzle';
import { organizations, phaseVersions, profiles, studentProgress } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';

interface TeacherProfile {
  id: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  organizationId: string;
}

interface StudentProfile {
  id: string;
  username: string;
  displayName: string | null;
}

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

async function getTeacherProfile(userId: string): Promise<TeacherProfile | null> {
  const [teacher] = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      role: profiles.role,
      organizationId: profiles.organizationId,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return (teacher as TeacherProfile | undefined) ?? null;
}

async function getOrganizationName(orgId: string) {
  const [organization] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  return organization?.name ?? 'Your organization';
}

async function getStudentInOrganization(
  studentId: string,
  orgId: string,
): Promise<StudentProfile | null> {
  const [student] = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      displayName: profiles.displayName,
    })
    .from(profiles)
    .where(
      and(
        eq(profiles.id, studentId),
        eq(profiles.organizationId, orgId),
        eq(profiles.role, 'student'),
      ),
    )
    .limit(1);

  return (student as StudentProfile | undefined) ?? null;
}

async function getStudentProgressSnapshot(
  studentId: string,
): Promise<StudentProgressSnapshot> {
  const versionedPhaseRows = await db
    .select({ id: phaseVersions.id })
    .from(phaseVersions);

  const activePhaseIds = new Set(versionedPhaseRows.map((row) => row.id));
  const totalPhases = activePhaseIds.size;

  const progressRows = await db
    .select({
      phaseId: studentProgress.phaseId,
      status: studentProgress.status,
      updatedAt: studentProgress.updatedAt,
    })
    .from(studentProgress)
    .where(eq(studentProgress.userId, studentId));

  let completedPhases = 0;
  let lastActive: string | null = null;

  for (const row of progressRows) {
    if (!activePhaseIds.has(row.phaseId)) {
      continue;
    }

    if (row.status === 'completed') {
      completedPhases += 1;
    }

    if (row.updatedAt) {
      const rowTime = row.updatedAt.getTime();
      const currentTime = lastActive ? new Date(lastActive).getTime() : 0;
      if (rowTime > currentTime) {
        lastActive = row.updatedAt.toISOString();
      }
    }
  }

  return {
    completedPhases,
    totalPhases,
    progressPercentage:
      totalPhases > 0
        ? Number(((completedPhases / totalPhases) * 100).toFixed(1))
        : 0,
    lastActive,
  };
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/teacher/students/${studentId}`);
  }

  const teacher = await getTeacherProfile(user.id);
  if (!teacher) {
    redirect('/auth/login?redirect=/teacher');
  }

  if (teacher.role !== 'teacher' && teacher.role !== 'admin') {
    redirect('/student/dashboard');
  }

  const [organizationName, student, snapshot] = await Promise.all([
    getOrganizationName(teacher.organizationId),
    getStudentInOrganization(studentId, teacher.organizationId),
    getStudentProgressSnapshot(studentId),
  ]);

  if (!student) {
    notFound();
  }

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
