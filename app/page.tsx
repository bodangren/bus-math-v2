import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Carousel } from "@/components/ui/carousel";
import { Hero } from "@/components/hero";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getConvexUrl } from "@/lib/convex/config";
import { Button } from "@/components/ui/button";

interface LandingUnit {
  id: string;
  unit_number: number;
  title: string;
  slug: string;
  description?: string | null;
}

function getConvexClient() {
  return new ConvexHttpClient(getConvexUrl());
}

const outcomes = [
  {
    number: "01",
    headline: "Build real Excel models",
    detail:
      "Ledgers, dashboards, financial statements, amortization schedules — every unit produces a workbook you designed from scratch.",
  },
  {
    number: "02",
    headline: "Present to real audiences",
    detail:
      "Mock loan officers, mentor panels, and Demo Day judges. Learn to defend your numbers the way professionals do.",
  },
  {
    number: "03",
    headline: "Finish with an investor pitch",
    detail:
      "The capstone is a linked business plan, a 3-minute model tour, and a pitch deck. One shot to prove it all connects.",
  },
];

export default async function Home() {
  const convex = getConvexClient();

  const [statsFetch, unitsFetch] = await Promise.allSettled([
    convex.query(api.public.getCurriculumStats),
    convex.query(api.public.getUnits),
  ]);

  if (statsFetch.status === "rejected" || unitsFetch.status === "rejected") {
    console.error("[home] Failed to load landing data from Convex", {
      statsError: statsFetch.status === "rejected" ? statsFetch.reason : null,
      unitsError: unitsFetch.status === "rejected" ? unitsFetch.reason : null,
    });
  }

  const statsResult = statsFetch.status === "fulfilled" ? statsFetch.value : null;
  const unitsResult = unitsFetch.status === "fulfilled" ? unitsFetch.value : [];
  const stats =
    statsResult &&
    typeof statsResult === "object" &&
    "unitCount" in statsResult &&
    "lessonCount" in statsResult &&
    "activityCount" in statsResult
      ? statsResult
      : null;
  const landingUnits = Array.isArray(unitsResult) ? (unitsResult as LandingUnit[]) : [];

  return (
    <>
      <Hero stats={stats} />

      {/* ── What students walk away with ── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-baseline gap-4 mb-16 border-b border-border pb-8">
            <span className="bg-foreground text-background px-3 py-1 font-mono text-[10px] uppercase tracking-widest font-bold">
              Mission Statement
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Not worksheets. Workbooks.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {outcomes.map((item) => (
              <div key={item.number} className="relative group border border-transparent hover:border-border p-6 -m-6 transition-colors duration-200">
                <span
                  className="font-mono font-bold leading-none select-none block mb-6 transition-colors group-hover:text-foreground text-muted"
                  style={{ fontSize: "2rem" }}
                  aria-hidden="true"
                >
                  {item.number}
                </span>
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground tracking-tight">
                    {item.headline}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unit strip — compact teaser ── */}
      {landingUnits.length > 0 && (
        <section className="py-20 md:py-28 bg-secondary/30 relative overflow-hidden border-y border-border">
          <div className="relative container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline justify-between mb-12 flex-wrap gap-6 border-b border-border/50 pb-8">
              <div>
                <span className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest mb-4">
                  The Sequence
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  8 units + capstone
                </h2>
              </div>
              <Link
                href="/curriculum"
                className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground transition-all hover:text-foreground"
              >
                See full curriculum <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Desktop: horizontal strip */}
            <div className="hidden md:grid md:grid-cols-4 xl:grid-cols-8 gap-px bg-border border border-border">
              {landingUnits.slice(0, 8).map((unit, i) => (
                <div
                  key={unit.id}
                  className="bg-background p-5 relative overflow-hidden group transition-all duration-200 hover:bg-secondary"
                  style={{
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <span
                    className="absolute -right-1 -top-2 font-mono font-bold leading-none select-none pointer-events-none opacity-5 transition-opacity group-hover:opacity-10"
                    style={{ fontSize: "3rem" }}
                    aria-hidden="true"
                  >
                    {unit.unit_number}
                  </span>
                  <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-3 font-medium">
                    Unit {unit.unit_number}
                  </p>
                  <h3 className="font-display text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors tracking-tight">
                    {unit.title}
                  </h3>
                </div>
              ))}
            </div>

            {/* Mobile: carousel */}
            <div className="md:hidden">
              <Carousel itemsPerView={1} gap="gap-4" className="max-w-sm mx-auto">
                {landingUnits.slice(0, 8).map((unit) => (
                  <div key={unit.id} className="p-1">
                    <div
                      className="bg-background border border-border p-6 relative overflow-hidden"
                    >
                      <span
                        className="absolute -right-2 -top-4 font-mono font-bold leading-none select-none pointer-events-none opacity-5"
                        style={{ fontSize: "4rem" }}
                        aria-hidden="true"
                      >
                        {unit.unit_number}
                      </span>
                      <p className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase mb-3 font-bold">
                        Unit {unit.unit_number}
                      </p>
                      <h3 className="font-display text-lg font-bold text-foreground leading-snug tracking-tight">
                        {unit.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="py-20 md:py-32 bg-background relative">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-10">
          <div className="space-y-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Ready to start building?
            </h2>
          </div>
          <p className="text-muted-foreground font-body text-lg leading-relaxed max-w-xl mx-auto">
            Log in to access your first unit, or try a simulation on the preface page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/auth/login">
                Student or teacher login
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link href="/preface">
                Try it first
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 pt-12 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            <Link href="/curriculum" className="hover:text-foreground transition-colors">Curriculum</Link>
            <Link href="/capstone" className="hover:text-foreground transition-colors">Capstone</Link>
            <Link href="/acknowledgments" className="hover:text-foreground transition-colors">Acknowledgments</Link>
          </div>
        </div>
      </section>
    </>
  );
}
