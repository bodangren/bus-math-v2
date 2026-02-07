import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { lessonVersions, lessons, phaseVersions, studentProgress } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const dynamic = 'force-dynamic';

interface LessonProgress {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description: string | null;
  totalPhases: number;
  completedPhases: number;
  progressPercentage: number;
}

interface UnitOverview {
  unitNumber: number;
  unitTitle: string;
  lessons: LessonProgress[];
}

function deriveUnitTitle(lesson: typeof lessons.$inferSelect) {
  return (
    lesson.metadata?.unitContent?.introduction?.unitTitle ??
    lesson.metadata?.unitContent?.introduction?.unitNumber ??
    `Unit ${lesson.unitNumber}`
  );
}

type DashboardLessonRow = typeof lessons.$inferSelect;

export async function getStudentDashboardData(userId: string) {
  const lessonRows = await db
    .select()
    .from(lessons)
    .orderBy(asc(lessons.unitNumber), asc(lessons.orderIndex));

  if (lessonRows.length === 0) {
    return [];
  }

  const lessonIds = lessonRows.map((lesson) => lesson.id);

  const userProgressEntries = await db.query.studentProgress.findMany({
    where: eq(studentProgress.userId, userId),
  });
  const completedPhaseIds = new Set(
    userProgressEntries
      .filter((entry) => entry.status === "completed")
      .map((entry) => entry.phaseId),
  );

  const latestVersionByLessonId = new Map<string, { id: string; title: string | null; description: string | null }>();
  const versionRows = await db
    .select({
      id: lessonVersions.id,
      lessonId: lessonVersions.lessonId,
      title: lessonVersions.title,
      description: lessonVersions.description,
      version: lessonVersions.version,
    })
    .from(lessonVersions)
    .where(inArray(lessonVersions.lessonId, lessonIds))
    .orderBy(asc(lessonVersions.lessonId), desc(lessonVersions.version));

  for (const versionRow of versionRows) {
    if (!latestVersionByLessonId.has(versionRow.lessonId)) {
      latestVersionByLessonId.set(versionRow.lessonId, {
        id: versionRow.id,
        title: versionRow.title ?? null,
        description: versionRow.description ?? null,
      });
    }
  }

  const versionIds = Array.from(latestVersionByLessonId.values()).map((row) => row.id);
  const versionedPhaseIdsByLessonId = new Map<string, string[]>();
  if (versionIds.length > 0) {
    const versionedPhaseRows = await db
      .select({
        id: phaseVersions.id,
        lessonVersionId: phaseVersions.lessonVersionId,
      })
      .from(phaseVersions)
      .where(inArray(phaseVersions.lessonVersionId, versionIds));

    const lessonIdByVersionId = new Map<string, string>();
    for (const [lessonId, version] of latestVersionByLessonId.entries()) {
      lessonIdByVersionId.set(version.id, lessonId);
    }

    for (const phaseRow of versionedPhaseRows) {
      const lessonId = lessonIdByVersionId.get(phaseRow.lessonVersionId);
      if (!lessonId) continue;
      const current = versionedPhaseIdsByLessonId.get(lessonId) ?? [];
      current.push(phaseRow.id);
      versionedPhaseIdsByLessonId.set(lessonId, current);
    }
  }

  const unitsMap = new Map<number, UnitOverview>();
  for (const lessonRow of lessonRows) {
    const versionedInfo = latestVersionByLessonId.get(lessonRow.id);
    const effectiveLesson: DashboardLessonRow = {
      ...lessonRow,
      title: versionedInfo?.title ?? lessonRow.title,
      description: versionedInfo?.description ?? lessonRow.description,
    };

    const versionedPhaseIds = versionedPhaseIdsByLessonId.get(lessonRow.id) ?? [];

    const totalPhases = versionedPhaseIds.length;
    const completedVersioned = versionedPhaseIds.filter((phaseId) => completedPhaseIds.has(phaseId)).length;
    const completedPhases = completedVersioned;

    const progressPercentage = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

    if (!unitsMap.has(effectiveLesson.unitNumber)) {
      unitsMap.set(effectiveLesson.unitNumber, {
        unitNumber: effectiveLesson.unitNumber,
        unitTitle: deriveUnitTitle(effectiveLesson),
        lessons: [],
      });
    }

    unitsMap.get(effectiveLesson.unitNumber)?.lessons.push({
      id: effectiveLesson.id,
      unitNumber: effectiveLesson.unitNumber,
      title: effectiveLesson.title,
      slug: effectiveLesson.slug,
      description: effectiveLesson.description,
      totalPhases,
      completedPhases,
      progressPercentage,
    });
  }

  return Array.from(unitsMap.values()).sort((a, b) => a.unitNumber - b.unitNumber);
}

export default async function StudentDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const studentUnits = await getStudentDashboardData(user.id);

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Student Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Welcome back to your learning journey, {user.user_metadata?.username || user.email}!
        </p>

        {studentUnits.length === 0 ? (
          <div className="text-center text-muted-foreground border rounded-xl p-12 bg-background">
            No lessons available yet. Please check back later or contact your teacher.
          </div>
        ) : (
          <div className="space-y-8">
            {studentUnits.map((unit) => (
              <div key={unit.unitNumber}>
                <h2 className="text-3xl font-semibold mb-4">{unit.unitTitle}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {unit.lessons.map((lesson) => (
                    <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">
                          Unit {lesson.unitNumber}
                        </Badge>
                        <CardTitle className="text-xl">
                          <Link href={`/student/lesson/${lesson.slug}`} className="hover:underline">
                            {lesson.title}
                          </Link>
                        </CardTitle>
                        {lesson.description && (
                          <CardDescription>{lesson.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>Progress</span>
                          <span>{lesson.completedPhases}/{lesson.totalPhases} phases ({lesson.progressPercentage}%)</span>
                        </div>
                        <Progress value={lesson.progressPercentage} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
