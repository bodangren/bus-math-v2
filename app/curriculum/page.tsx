import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { CurriculumUnitCard } from "./CurriculumUnitCard";
import type { UnitCurriculum } from "./types";

export const dynamic = 'force-dynamic';

export default async function CurriculumPage() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const convex = new ConvexHttpClient(convexUrl!);

  let units: UnitCurriculum[] = [];
  try {
    const fetchedUnits = await convex.query(api.public.getCurriculum);
    units = fetchedUnits as UnitCurriculum[];
  } catch (err) {
    console.error("Error fetching curriculum from Convex", err);
  }

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
              Curriculum data isn&apos;t available yet. Please seed lessons in Convex to populate this page.
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
