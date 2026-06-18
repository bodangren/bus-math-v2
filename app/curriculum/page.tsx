import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getConvexUrl } from "@/lib/convex/config";
import { Carousel } from "@/components/ui/carousel";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { UnitCurriculum } from "./types";
import { Button } from "@/components/ui/button";

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

  const semester1 = units.filter((u) => u.unitNumber >= 1 && u.unitNumber <= 4);
  const semester2 = units.filter((u) => u.unitNumber >= 5 && u.unitNumber <= 8);
  const capstone = units.find((u) => u.unitNumber === 9);

  return (
    <main className="flex-1 bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 md:py-28 border-b border-border">
        <div className="relative container mx-auto px-4 max-w-4xl space-y-6">
          <span className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
            The Curriculum
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 leading-tight tracking-tight">
            8 units. 1 capstone.<br />
            <span className="text-muted-foreground">Real workbooks you can show off.</span>
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-xl">
            Every unit ends with a deliverable you built yourself — not a
            worksheet you filled in.
          </p>
        </div>
      </section>

      {/* ── Semester 1 — Build the Financial Spine ── */}
      {semester1.length > 0 && (
        <section className="py-16 md:py-24 border-b border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline gap-4 mb-12 border-b border-border/50 pb-6">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-bold">
                Part I
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                The Financial Spine
              </h2>
            </div>

            {/* Desktop: staggered row */}
            <div className="hidden md:grid md:grid-cols-4 gap-px bg-border border border-border">
              {semester1.map((unit, i) => (
                <UnitTeaser key={unit.unitNumber} unit={unit} delay={i * 60} />
              ))}
            </div>

            {/* Mobile: carousel */}
            <div className="md:hidden">
              <Carousel itemsPerView={1} gap="gap-4" className="max-w-sm mx-auto">
                {semester1.map((unit) => (
                  <div key={unit.unitNumber} className="p-1">
                    <UnitTeaser unit={unit} delay={0} />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* ── Semester 2 — Run & Finance the Venture ── */}
      {semester2.length > 0 && (
        <section className="py-16 md:py-24 border-b border-border">
          <div className="relative container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline gap-4 mb-12 border-b border-border/50 pb-6">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-bold">
                Part II
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Run &amp; Finance
              </h2>
            </div>

            {/* Desktop: staggered row */}
            <div className="hidden md:grid md:grid-cols-4 gap-px bg-border border border-border">
              {semester2.map((unit, i) => (
                <UnitTeaser key={unit.unitNumber} unit={unit} delay={i * 60} />
              ))}
            </div>

            {/* Mobile: carousel */}
            <div className="md:hidden">
              <Carousel itemsPerView={1} gap="gap-4" className="max-w-sm mx-auto">
                {semester2.map((unit) => (
                  <div key={unit.unitNumber} className="p-1">
                    <UnitTeaser unit={unit} delay={0} />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* ── Capstone Spotlight ── */}
      {capstone && (
        <section className="py-20 md:py-32 bg-secondary/20">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-10">
            <span className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
              The Finale
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              {capstone.title}
            </h2>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
              {capstone.description}
            </p>
            <div className="flex justify-center">
              <Button asChild size="lg" className="h-12 px-10">
                <Link href="/capstone">
                  Enter the Capstone
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="py-20 md:py-32 border-t border-border">
        <div className="relative container mx-auto px-4 max-w-3xl text-center space-y-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Ready to start building?
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Log in to access lessons, datasets, and your personal workbook progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/auth/login">
                Student or teacher login
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link href="/">
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function UnitTeaser({ unit, delay }: { unit: UnitCurriculum; delay: number }) {
  const deliverable = unit.lessons[0]?.description ?? unit.description;

  return (
    <div
      className="bg-background h-full p-6 relative overflow-hidden group transition-all duration-200 hover:bg-secondary"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Watermark */}
      <span
        className="absolute -right-2 -top-4 font-mono font-bold leading-none select-none pointer-events-none opacity-5 transition-opacity group-hover:opacity-10"
        style={{ fontSize: "5rem" }}
        aria-hidden="true"
      >
        {unit.unitNumber}
      </span>

      <p className="font-mono text-[10px] text-muted-foreground/60 mb-3 tracking-widest uppercase font-medium">
        Unit {unit.unitNumber}
      </p>
      <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-3 uppercase tracking-tight">
        {unit.title}
      </h3>
      <p className="text-xs text-muted-foreground font-body leading-relaxed mb-6 line-clamp-3">
        {deliverable}
      </p>

      <div className="mt-auto flex items-center text-[10px] text-muted-foreground font-mono uppercase tracking-widest gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {unit.lessons.length} LESSONS <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  );
}
