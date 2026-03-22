import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Carousel } from "@/components/ui/carousel";
import { Hero } from "@/components/hero";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getConvexUrl } from "@/lib/convex/config";

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
      <section className="py-16 md:py-20 bg-background ledger-bg">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="section-label">Why this course</span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mt-4">
              Not worksheets. Workbooks.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {outcomes.map((item) => (
              <div key={item.number} className="relative">
                <span
                  className="font-display font-bold leading-none select-none block mb-3"
                  style={{ fontSize: "2.5rem", color: "oklch(var(--primary) / 0.10)" }}
                  aria-hidden="true"
                >
                  {item.number}
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {item.headline}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unit strip — compact teaser ── */}
      {landingUnits.length > 0 && (
        <section className="py-16 md:py-20 bg-forest-dark relative overflow-hidden">
          <div
            className="absolute inset-0 accounting-grid-dark pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline justify-between mb-10 flex-wrap gap-4">
              <div>
                <span className="section-label section-label-light">The sequence</span>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mt-4">
                  8 units + capstone
                </h2>
              </div>
              <Link
                href="/curriculum"
                className="inline-flex items-center gap-2 text-sm font-body font-medium transition-colors hover:text-white"
                style={{ color: "oklch(0.68 0.17 157)" }}
              >
                See full curriculum <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Desktop: horizontal strip */}
            <div className="hidden md:grid md:grid-cols-4 xl:grid-cols-8 gap-3">
              {landingUnits.slice(0, 8).map((unit, i) => (
                <div
                  key={unit.id}
                  className="rounded-lg p-4 relative overflow-hidden group transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: "oklch(1 0 0 / 0.05)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <span
                    className="absolute -right-0.5 -top-2 font-display font-bold leading-none select-none pointer-events-none"
                    style={{ fontSize: "3.5rem", color: "oklch(1 0 0 / 0.04)" }}
                    aria-hidden="true"
                  >
                    {unit.unit_number}
                  </span>
                  <p className="font-mono-num text-[9px] text-white/60 tracking-widest uppercase mb-1.5">
                    Unit {unit.unit_number}
                  </p>
                  <h3 className="font-display text-sm font-semibold text-white leading-snug group-hover:text-[oklch(0.68_0.17_157)] transition-colors">
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
                      className="rounded-lg p-5 relative overflow-hidden"
                      style={{
                        background: "oklch(1 0 0 / 0.05)",
                        border: "1px solid oklch(1 0 0 / 0.08)",
                      }}
                    >
                      <span
                        className="absolute -right-1 -top-3 font-display font-bold leading-none select-none pointer-events-none"
                        style={{ fontSize: "5rem", color: "oklch(1 0 0 / 0.04)" }}
                        aria-hidden="true"
                      >
                        {unit.unit_number}
                      </span>
                      <p className="font-mono-num text-[10px] text-white/60 tracking-widest uppercase mb-2">
                        Unit {unit.unit_number}
                      </p>
                      <h3 className="font-display text-lg font-semibold text-white leading-snug">
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
      <section className="py-16 md:py-20 bg-muted/20 ledger-bg">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Ready to start building?
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Log in to access your first unit, or try a simulation on the preface page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md gradient-financial text-white font-body font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Student or teacher login
            </Link>
            <Link
              href="/preface"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-transparent border border-border/60 text-foreground font-body hover:bg-muted/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Try it first
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 pt-4 text-sm text-muted-foreground font-body">
            <Link href="/curriculum" className="hover:text-foreground transition-colors">Curriculum</Link>
            <span>&middot;</span>
            <Link href="/capstone" className="hover:text-foreground transition-colors">Capstone</Link>
            <span>&middot;</span>
            <Link href="/acknowledgments" className="hover:text-foreground transition-colors">Acknowledgments</Link>
          </div>
        </div>
      </section>
    </>
  );
}
