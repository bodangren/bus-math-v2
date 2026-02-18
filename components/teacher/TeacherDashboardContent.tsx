"use client";

import { CheckCircle2, LineChart, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeacherCsvExportButton } from "./TeacherCsvExportButton";
import { TeacherCreateStudentDialog } from "./TeacherCreateStudentDialog";
import { TeacherBulkImportDialog } from "./TeacherBulkImportDialog";
import { CourseOverviewGrid } from "./CourseOverviewGrid";
import type { CourseOverviewRow, UnitColumn } from "@/lib/teacher/course-overview";

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
  courseOverview: { rows: CourseOverviewRow[]; units: UnitColumn[] };
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
  courseOverview,
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


        <section aria-label="Course overview">
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <CourseOverviewGrid
                rows={courseOverview.rows}
                units={courseOverview.units}
              />
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
