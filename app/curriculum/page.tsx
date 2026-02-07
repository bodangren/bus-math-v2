import Link from "next/link";
import { asc, desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { lessonVersions, lessons } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurriculumUnitCard } from "./CurriculumUnitCard";
import type { UnitCurriculum } from "./types";

export const dynamic = 'force-dynamic';

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
  const fromMetadata = row.metadata?.unitContent?.objectives?.content;
  if (Array.isArray(fromMetadata)) {
    return fromMetadata;
  }

  const fromRow = row.learningObjectives;
  if (Array.isArray(fromRow)) {
    return fromRow;
  }

  return [];
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

  if (lessonRows.length === 0) {
    return groupLessonsByUnit(lessonRows);
  }

  try {
    const lessonIds = lessonRows.map((row) => row.id);
    const versionRows = await db
      .select({
        lessonId: lessonVersions.lessonId,
        title: lessonVersions.title,
        description: lessonVersions.description,
        version: lessonVersions.version,
      })
      .from(lessonVersions)
      .where(inArray(lessonVersions.lessonId, lessonIds))
      .orderBy(asc(lessonVersions.lessonId), desc(lessonVersions.version));

    const latestVersionByLessonId = new Map<string, { title: string | null; description: string | null }>();
    for (const row of versionRows) {
      if (!latestVersionByLessonId.has(row.lessonId)) {
        latestVersionByLessonId.set(row.lessonId, {
          title: row.title ?? null,
          description: row.description ?? null,
        });
      }
    }

    const mergedRows = lessonRows.map((lessonRow) => {
      const latestVersion = latestVersionByLessonId.get(lessonRow.id);
      if (!latestVersion) return lessonRow;
      return {
        ...lessonRow,
        title: latestVersion.title ?? lessonRow.title,
        description: latestVersion.description ?? lessonRow.description,
      };
    });

    return groupLessonsByUnit(mergedRows);
  } catch {
    // Keep legacy lesson-only behavior while versioned schema rollout is in progress.
    return groupLessonsByUnit(lessonRows);
  }
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
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Teacher login</Link>
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
                 <CurriculumUnitCard key={unit.unitNumber} unit={unit} />
               ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
