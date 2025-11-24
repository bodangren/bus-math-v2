import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { lessons, studentProgress, phases } from "@/lib/db/schema";
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
import { Button } from "@/components/ui/button";

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

async function getStudentDashboardData(userId: string) {
  // Fetch all lessons with their phases
  const lessonsWithPhases = await db.query.lessons.findMany({
    with: {
      phases: true,
    },
    orderBy: [asc(lessons.unitNumber), asc(lessons.orderIndex)],
  });

  // Fetch the student's progress for all phases
  const userProgressEntries = await db.query.studentProgress.findMany({
    where: eq(studentProgress.userId, userId),
  });

  // Create a map for quick lookup of completed phases
  const completedPhasesMap = new Set(
    userProgressEntries
      .filter((p) => p.status === 'completed')
      .map((p) => p.phaseId)
  );

  const unitsMap = new Map<number, UnitOverview>();

  for (const lesson of lessonsWithPhases) {
    const totalPhases = lesson.phases.length;
    const completedPhases = lesson.phases.filter(phase =>
      completedPhasesMap.has(phase.id)
    ).length;
    const progressPercentage = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

    if (!unitsMap.has(lesson.unitNumber)) {
      unitsMap.set(lesson.unitNumber, {
        unitNumber: lesson.unitNumber,
        unitTitle: deriveUnitTitle(lesson),
        lessons: [],
      });
    }

    unitsMap.get(lesson.unitNumber)?.lessons.push({
      id: lesson.id,
      unitNumber: lesson.unitNumber,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
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

