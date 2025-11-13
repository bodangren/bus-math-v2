import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { lessons } from "@/lib/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  orderIndex: number;
}

interface UnitCurriculum {
  unitNumber: number;
  title: string;
  description: string;
  objectives: string[];
  lessons: LessonSummary[];
}

type LessonRow = typeof lessons.$inferSelect;

type LessonMetadata = LessonRow["metadata"];

function deriveUnitTitle(metadata: LessonMetadata | null, unitNumber: number) {
  return (
    metadata?.unitContent?.introduction?.unitTitle ??
    metadata?.unitContent?.introduction?.unitNumber ??
    `Unit ${unitNumber}`
  );
}

function deriveUnitDescription(row: LessonRow) {
  return (
    row.metadata?.unitContent?.drivingQuestion?.question ??
    row.metadata?.unitContent?.introduction?.projectOverview?.scenario ??
    row.description ??
    "Explore core accounting and Excel skills through real classroom projects."
  );
}

function deriveObjectives(row: LessonRow) {
  return (
    row.metadata?.unitContent?.objectives?.content ??
    row.learningObjectives ??
    []
  );
}

export function groupLessonsByUnit(rows: LessonRow[]): UnitCurriculum[] {
  const units = new Map<number, UnitCurriculum>();

  rows.forEach((row) => {
    const existing = units.get(row.unitNumber);

    if (!existing) {
      units.set(row.unitNumber, {
        unitNumber: row.unitNumber,
        title: deriveUnitTitle(row.metadata, row.unitNumber),
        description: deriveUnitDescription(row),
        objectives: deriveObjectives(row),
        lessons: [],
      });
    }

    const unit = units.get(row.unitNumber)!;

    unit.lessons.push({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      orderIndex: row.orderIndex,
    });
  });

  return Array.from(units.values())
    .map((unit) => ({
      ...unit,
      lessons: unit.lessons.sort((a, b) => a.orderIndex - b.orderIndex),
    }))
    .sort((a, b) => a.unitNumber - b.unitNumber);
}

async function getCurriculum() {
  const lessonRows = await db
    .select()
    .from(lessons)
    .orderBy(asc(lessons.unitNumber), asc(lessons.orderIndex));

  return groupLessonsByUnit(lessonRows);
}

export default async function CurriculumPage() {
  const units = await getCurriculum();

  return (
    <main className="flex-1">
      <section className="py-16 md:py-20 bg-gradient-to-br from-background via-primary/5 to-accent/5 border-b border-border/40">
        <div className="container mx-auto px-4 space-y-6 text-center max-w-4xl">
          <Badge className="mx-auto w-fit" variant="secondary">
            Public Curriculum Overview
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            Explore the Math for Business Operations Curriculum
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Every unit blends classroom-ready narratives, authentic financial problems, and spreadsheet modeling. Browse the units and jump into any lesson without signing in.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="shadow-md">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Teacher Login</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/10">
        <div className="container mx-auto px-4">
          {units.length === 0 ? (
            <div className="text-center text-muted-foreground border rounded-xl p-12 bg-background">
              Curriculum data isn&apos;t available yet. Please seed lessons in Supabase to populate this page.
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {units.map((unit) => (
                <Card
                  key={unit.unitNumber}
                  className="border-border/40 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <Badge variant="outline">Unit {unit.unitNumber}</Badge>
                      <span>
                        {unit.lessons.length} lesson{unit.lessons.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <CardTitle className="text-2xl">{unit.title}</CardTitle>
                    <CardDescription>{unit.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {unit.objectives.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                          Learning Objectives
                        </p>
                        <ul className="space-y-2 text-sm text-foreground/90">
                          {unit.objectives.slice(0, 4).map((objective) => (
                            <li key={objective} className="flex gap-2">
                              <span className="text-primary">•</span>
                              <span>{objective}</span>
                            </li>
                          ))}
                          {unit.objectives.length > 4 && (
                            <li className="text-muted-foreground text-xs">
                              +{unit.objectives.length - 4} more objectives in lesson plans
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                        Lessons
                      </p>
                      <ol className="space-y-2">
                        {unit.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-start justify-between gap-4">
                            <div>
                              <Link
                                href={`/student/lesson/${lesson.slug}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {lesson.title}
                              </Link>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              L{lesson.orderIndex}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
