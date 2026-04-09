"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, LineChart, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  applyInterventionFilter,
  buildInterventionSummary,
  interventionStatusLabel,
  type DerivedStudentIntervention,
  type InterventionFilter,
  type StudentDashboardRow,
} from "@/lib/teacher/intervention";
import {
  clampTeacherProgressPercentage,
  formatTeacherLastActive,
  formatTeacherProgressPercentage,
} from "@/lib/teacher/progress";
import { cn } from "@/lib/utils";
import { TeacherCsvExportButton } from "./TeacherCsvExportButton";
import { TeacherCreateStudentDialog } from "./TeacherCreateStudentDialog";
import { TeacherBulkImportDialog } from "./TeacherBulkImportDialog";
import { CourseOverviewGrid } from "./CourseOverviewGrid";
import type { CourseOverviewRow, UnitColumn } from "@/lib/teacher/course-overview";

interface TeacherDashboardContentProps {
  teacher: {
    username: string;
    organizationName: string;
  };
  students: StudentDashboardRow[];
  courseOverview: { rows: CourseOverviewRow[]; units: UnitColumn[] };
}

const FILTER_OPTIONS: Array<{ value: InterventionFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "at_risk", label: "At Risk" },
  { value: "inactive", label: "Inactive" },
  { value: "on_track", label: "On Track" },
  { value: "completed", label: "Completed" },
];

export function formatLastActive(value: string | null) {
  return formatTeacherLastActive(value);
}

function getDashboardMetrics(students: StudentDashboardRow[]) {
  const summary = buildInterventionSummary(students);

  if (students.length === 0) {
    return {
      totalStudents: 0,
      averageProgress: 0,
      activeThisWeek: 0,
      courseCompletions: 0,
      needsAttention: 0,
      atRisk: 0,
      inactive: 0,
    };
  }

  const totalProgress = students.reduce(
    (sum, student) =>
      sum + clampTeacherProgressPercentage(student.progressPercentage),
    0,
  );

  return {
    totalStudents: students.length,
    averageProgress: totalProgress / students.length,
    activeThisWeek: summary.activeThisWeek,
    courseCompletions: summary.completed,
    needsAttention: summary.needsAttention,
    atRisk: summary.atRisk,
    inactive: summary.inactive,
  };
}

function statusBadgeClassName(student: DerivedStudentIntervention) {
  if (student.isAtRisk) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (student.isInactive) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (student.isCompleted) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
}

export function TeacherDashboardContent({
  teacher,
  students,
  courseOverview,
}: TeacherDashboardContentProps) {
  const metrics = getDashboardMetrics(students);
  const [activeFilter, setActiveFilter] = useState<InterventionFilter>("all");
  const filteredStudents = applyInterventionFilter(students, activeFilter);
  const activeFilterLabel =
    FILTER_OPTIONS.find((option) => option.value === activeFilter)?.label ?? "All";

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
            <Button asChild variant="default">
              <Link href="/teacher/gradebook">
                View Course Gradebook
              </Link>
            </Button>
            <TeacherBulkImportDialog />
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
                {formatTeacherProgressPercentage(metrics.averageProgress)}
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.needsAttention} students need attention
              </p>
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

        <section aria-label="Student intervention queue">
          <Card>
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle>Student Intervention Queue</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Prioritize students who are inactive, below pace, or ready for celebration.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={activeFilter === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">At Risk</p>
                  <p className="mt-1 text-2xl font-semibold text-red-900">{metrics.atRisk}</p>
                  <p className="text-sm text-red-700">Below 50% progress</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-700">Inactive</p>
                  <p className="mt-1 text-2xl font-semibold text-amber-900">{metrics.inactive}</p>
                  <p className="text-sm text-amber-700">No recent activity in 7 days</p>
                </div>
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                  <p className="text-sm font-medium text-sky-700">Recently Active</p>
                  <p className="mt-1 text-2xl font-semibold text-sky-900">
                    {metrics.activeThisWeek}
                  </p>
                  <p className="text-sm text-sky-700">Students active this week</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-700">Completed</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-900">
                    {metrics.courseCompletions}
                  </p>
                  <p className="text-sm text-emerald-700">Students at full completion</p>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-muted-foreground/30 p-6 text-sm text-muted-foreground">
                  No students match the <span className="font-medium">{activeFilterLabel}</span>{" "}
                  filter right now.
                </div>
              ) : (
                <div className="grid gap-3" data-testid="intervention-roster">
                  {filteredStudents.map((student) => (
                    <article
                      key={student.id}
                      className="rounded-xl border bg-background p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {student.displayName ?? student.username}
                            </h3>
                            <Badge
                              variant="outline"
                              className={cn("capitalize", statusBadgeClassName(student))}
                            >
                              {interventionStatusLabel(student.status)}
                            </Badge>
                            {student.needsAttention ? (
                              <Badge
                                variant="outline"
                                className="border-orange-200 bg-orange-50 text-orange-700"
                              >
                                Needs Attention
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-muted-foreground">@{student.username}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                          <div>
                            <p className="text-muted-foreground">Progress</p>
                            <p className="font-semibold">
                              {formatTeacherProgressPercentage(student.progressPercentage)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Completed</p>
                            <p className="font-semibold">
                              {student.completedPhases}/{student.totalPhases} phases
                            </p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-muted-foreground">Last Active</p>
                            <p className="font-semibold">{formatLastActive(student.lastActive)}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-label="Course overview">
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <CourseOverviewGrid rows={courseOverview.rows} units={courseOverview.units} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export const __private__ = {
  clampPercentage: clampTeacherProgressPercentage,
  getDashboardMetrics,
};
