import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpenCheck, CheckCircle2, Compass } from "lucide-react";
import { getServerSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import { buildStudentDashboardViewModel, type StudentDashboardUnit } from "@/lib/student/dashboard";
import { studentLessonPath } from "@/lib/student/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const dynamic = 'force-dynamic';

const metricCards = [
  {
    key: "progress",
    title: "Course Progress",
    icon: Compass,
  },
  {
    key: "lessons",
    title: "Lessons Completed",
    icon: BookOpenCheck,
  },
  {
    key: "units",
    title: "Units Completed",
    icon: CheckCircle2,
  },
] as const;

function statusBadgeVariant(status: "not_started" | "in_progress" | "completed") {
  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "in_progress") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function statusLabel(status: "not_started" | "in_progress" | "completed") {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In Progress";
  return "Not Started";
}

export default async function StudentDashboard() {
  const claims = await getServerSessionClaims();

  if (!claims) {
    redirect("/auth/login");
  }

  const studentUnits = await fetchInternalQuery(internal.student.getDashboardData, {
    userId: claims.sub as never,
  }) as StudentDashboardUnit[];
  const dashboard = buildStudentDashboardViewModel(studentUnits);

  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
            <Card className="border-primary/20 bg-background">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  Guided Progress
                </Badge>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Student Progress Hub
                </h1>
                <CardDescription className="max-w-2xl text-base">
                  Welcome back, {claims.username}. Keep moving through each unit with a clear next
                  step and a quick view of the course.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Overall completion</span>
                  <span>{dashboard.summary.progressPercentage}%</span>
                </div>
                <Progress value={dashboard.summary.progressPercentage} className="h-3" />
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>
                  {dashboard.nextLesson
                    ? `Next up: ${dashboard.nextLesson.title}`
                    : "All available lessons are complete right now."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboard.nextLesson ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Unit {dashboard.nextLesson.unitNumber}
                      </p>
                      <p className="font-semibold">{dashboard.nextLesson.title}</p>
                      {dashboard.nextLesson.description ? (
                        <p className="text-sm text-muted-foreground">
                          {dashboard.nextLesson.description}
                        </p>
                      ) : null}
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                      <Link href={studentLessonPath(dashboard.nextLesson.slug)}>
                        {dashboard.nextLesson.actionLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    You have finished every available lesson. Review completed units or ask your
                    teacher what to tackle next.
                  </div>
                )}
              </CardContent>
            </Card>
          </header>

          <section className="grid gap-4 md:grid-cols-3" aria-label="Course metrics">
            {metricCards.map((card) => {
              const Icon = card.icon;
              const value =
                card.key === "progress"
                  ? `${dashboard.summary.progressPercentage}%`
                  : card.key === "lessons"
                    ? `${dashboard.summary.completedLessons}/${dashboard.summary.totalLessons}`
                    : `${dashboard.summary.completedUnits}/${dashboard.summary.totalUnits}`;
              const description =
                card.key === "progress"
                  ? `${dashboard.summary.inProgressLessons} lessons in progress`
                  : card.key === "lessons"
                    ? `${dashboard.summary.inProgressLessons} currently in progress`
                    : `${dashboard.summary.totalUnits - dashboard.summary.completedUnits} units still active`;

              return (
                <Card key={card.key}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{value}</div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          {dashboard.units.length === 0 ? (
            <div className="rounded-xl border bg-background p-12 text-center text-muted-foreground">
            No lessons available yet. Please check back later or contact your teacher.
          </div>
        ) : (
            <section className="space-y-6" aria-label="Unit progress">
              {dashboard.units.map((unit) => (
                <Card key={unit.unitNumber} id={`unit-${unit.unitNumber}`}>
                  <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Unit {unit.unitNumber}</Badge>
                        <Badge variant="outline" className={statusBadgeVariant(unit.status)}>
                          {statusLabel(unit.status)}
                        </Badge>
                      </div>
                      <CardTitle>{unit.unitTitle}</CardTitle>
                      <CardDescription>
                        {unit.completedLessons} of {unit.lessons.length} lessons complete
                      </CardDescription>
                    </div>
                    {unit.nextLesson ? (
                      <Button asChild variant="outline" className="w-full md:w-auto">
                        <Link href={studentLessonPath(unit.nextLesson.slug)}>
                          {unit.nextLesson.actionLabel}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
                        Unit Complete
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                        <span>Unit progress</span>
                        <span>{unit.progressPercentage}%</span>
                      </div>
                      <Progress value={unit.progressPercentage} className="h-2" />
                    </div>

                    {unit.nextLesson ? (
                      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">Next lesson in this unit</p>
                        <p className="mt-1 font-semibold">{unit.nextLesson.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {unit.nextLesson.completedPhases}/{unit.nextLesson.totalPhases} phases
                          complete
                        </p>
                      </div>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {unit.lessons.map((lesson) => (
                        <Card key={lesson.id} className="border-border/60 shadow-none">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3">
                              <Badge variant="secondary">Lesson</Badge>
                              <span className="text-xs text-muted-foreground">
                                {lesson.progressPercentage}%
                              </span>
                            </div>
                            <CardTitle className="text-lg leading-snug">
                              <Link
                                href={studentLessonPath(lesson.slug)}
                                className="hover:underline"
                              >
                                {lesson.title}
                              </Link>
                            </CardTitle>
                            {lesson.description ? (
                              <CardDescription>{lesson.description}</CardDescription>
                            ) : null}
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Progress value={lesson.progressPercentage} className="h-2" />
                            <p className="text-sm text-muted-foreground">
                              {lesson.completedPhases}/{lesson.totalPhases} phases complete
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
        )}
      </div>
      </div>
    </main>
  );
}
