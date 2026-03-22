import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getConvexUrl } from "@/lib/convex/config";
import { CurriculumUnitCard } from "./CurriculumUnitCard";
import type { UnitCurriculum } from "./types";

export const dynamic = 'force-dynamic';

export default async function CurriculumPage() {
  const convex = new ConvexHttpClient(getConvexUrl());

  let units: UnitCurriculum[] = [];
  try {
    const fetchedUnits = await convex.query(api.public.getCurriculum);
    units = fetchedUnits as UnitCurriculum[];
  } catch (err) {
    console.error("Error fetching curriculum from Convex", err);
  }

  return (
    <main className="flex-1">
      {/* Dark hero banner — matches the landing page visual language */}
      <section className="hero-gradient relative overflow-hidden py-16 md:py-20 border-b border-white/[0.08]">
        <div
          className="absolute inset-0 accounting-grid-dark pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 space-y-6 text-center max-w-4xl">
          <span className="section-label section-label-light">
            Public Curriculum Overview
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
            Explore the Curriculum
          </h1>
          <p className="text-lg md:text-xl text-white/65 font-body max-w-2xl mx-auto">
            Every unit blends classroom-ready narratives, authentic financial
            problems, and spreadsheet modeling. Browse the sequence before
            signing in to study each protected lesson.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button
              asChild
              size="lg"
              className="gradient-cta text-white font-body font-semibold shadow-md hover:opacity-90 transition-opacity"
            >
              <Link href="/">Back to home</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 font-body transition-all"
            >
              <Link href="/auth/login">Student or teacher login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Unit grid */}
      <section className="py-12 md:py-16 bg-background ledger-bg">
        <div className="container mx-auto px-4">
          {units.length === 0 ? (
            <div className="text-center text-muted-foreground font-body border rounded-xl p-12 bg-card">
              Curriculum data isn&apos;t available yet. Please seed lessons in
              Convex to populate this page.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
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
