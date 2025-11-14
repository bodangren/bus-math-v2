import Link from "next/link";
import { CheckCircle2, LineChart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TeacherCsvExportButton } from "./TeacherCsvExportButton";
import { TeacherCreateStudentDialog } from "./TeacherCreateStudentDialog";

export interface StudentDashboardRow {
  id: string;
  username: string;
  displayName: string | null;
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
}

interface TeacherDashboardContentProps {
  teacher: {
    username: string;
    organizationName: string;
  };
  students: StudentDashboardRow[];
}

const percentageFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function clampPercentage(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatPercentage(value: number) {
  return `${percentageFormatter.format(clampPercentage(value))}%`;
}

export function formatLastActive(value: string | null) {
  if (!value) {
    return "No activity recorded";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "No activity recorded";
  }

  return dateTimeFormatter.format(parsed);
}

function isActiveWithinDays(value: string | null, days: number) {
  if (!value) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;

  const now = Date.now();
  const diff = now - parsed.getTime();
  const dayMs = days * 24 * 60 * 60 * 1000;

  return diff <= dayMs;
}

function getDashboardMetrics(students: StudentDashboardRow[]) {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      averageProgress: 0,
      activeThisWeek: 0,
      courseCompletions: 0,
    };
  }

  const totalProgress = students.reduce(
    (sum, student) => sum + clampPercentage(student.progressPercentage),
    0,
  );

  const activeThisWeek = students.filter((student) =>
    isActiveWithinDays(student.lastActive, 7),
  ).length;

  const completedCount = students.filter(
    (student) => clampPercentage(student.progressPercentage) >= 99.5,
  ).length;

  return {
    totalStudents: students.length,
    averageProgress: totalProgress / students.length,
    activeThisWeek,
    courseCompletions: completedCount,
  };
}

export function TeacherDashboardContent({
  teacher,
  students,
}: TeacherDashboardContentProps) {
  const metrics = getDashboardMetrics(students);

  return (
    <main className="min-h-screen bg-muted/10 py-10">
      <div className="container mx-auto px-4 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {teacher.organizationName}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Teacher Dashboard &mdash; {teacher.username}
            </h1>
            <p className="text-muted-foreground">
              Monitor student progress, highlight recent activity, and keep your classes in sync.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <TeacherCreateStudentDialog />
            <TeacherCsvExportButton students={students} />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card aria-live="polite">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="size-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{metrics.totalStudents}</div>
              <p className="text-sm text-muted-foreground">
                {metrics.activeThisWeek} active in the last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <LineChart className="size-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {formatPercentage(metrics.averageProgress)}
              </div>
              <p className="text-sm text-muted-foreground">Across all students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
              <CheckCircle2 className="size-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{metrics.courseCompletions}</div>
              <p className="text-sm text-muted-foreground">Students at 100% completion</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Student Progress</CardTitle>
              <CardDescription>
                Progress only counts phases marked as completed, satisfying Blocker #4 from the spec.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="rounded-md border border-dashed border-muted-foreground/30 p-6 text-center text-muted-foreground">
                  No students are associated with your organization yet. Seed demo accounts or create students to populate this table.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-sm" aria-label="Student progress table">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left">Student</th>
                        <th scope="col" className="px-3 py-2 text-left">Progress</th>
                        <th scope="col" className="px-3 py-2 text-left">Completed</th>
                        <th scope="col" className="px-3 py-2 text-left">Last Active</th>
                        <th scope="col" className="px-3 py-2 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {students.map((student) => (
                        <tr key={student.id} className="bg-background hover:bg-muted/30 focus-within:bg-muted/30">
                          <td className="px-3 py-3 align-top">
                            <div className="font-medium text-foreground">{student.displayName ?? student.username}</div>
                            <p className="text-xs text-muted-foreground">@{student.username}</p>
                          </td>
                          <td className="px-3 py-3 align-top w-64">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={clampPercentage(student.progressPercentage)}
                                aria-label={`${student.username} progress`}
                                className="bg-muted/60"
                              />
                              <span className="text-xs font-medium text-muted-foreground">
                                {formatPercentage(student.progressPercentage)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <p className="font-medium text-foreground">
                              {student.completedPhases} / {student.totalPhases || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">Completed phases</p>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <p className="text-foreground">{formatLastActive(student.lastActive)}</p>
                          </td>
                          <td className="px-3 py-3 align-top text-right">
                            <Button
                              asChild
                              variant="link"
                              className="px-0 text-primary"
                            >
                              <Link href={`/teacher/students/${student.id}`} aria-label={`View ${student.username} details`}>
                                View details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export const __private__ = {
  clampPercentage,
  getDashboardMetrics,
  isActiveWithinDays,
};
