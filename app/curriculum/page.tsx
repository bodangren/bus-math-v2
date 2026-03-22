import Link from "next/link";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getConvexUrl } from "@/lib/convex/config";
import { Carousel } from "@/components/ui/carousel";
import { ArrowRight, ChevronRight } from "lucide-react";
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

  const semester1 = units.filter((u) => u.unitNumber >= 1 && u.unitNumber <= 4);
  const semester2 = units.filter((u) => u.unitNumber >= 5 && u.unitNumber <= 8);
  const capstone = units.find((u) => u.unitNumber === 9);

  return (
    <main className="flex-1">
      {/* ── Hero ── */}
      <section className="hero-gradient relative overflow-hidden py-20 md:py-28 border-b border-white/[0.08]">
        <div
          className="absolute inset-0 accounting-grid-dark pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 text-center max-w-3xl space-y-6">
          <span className="section-label section-label-light">The Curriculum</span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 leading-tight">
            8 units. 1 capstone.<br />
            <span style={{ color: "oklch(0.68 0.17 157)" }}>
              Real workbooks you can show off.
            </span>
          </h1>
          <p className="text-lg text-white/70 font-body max-w-xl mx-auto">
            Every unit ends with a deliverable you built yourself — not a
            worksheet you filled in.
          </p>
        </div>
      </section>

      {/* ── Semester 1 — Build the Financial Spine ── */}
      {semester1.length > 0 && (
        <section className="py-16 md:py-20 bg-background ledger-bg">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline gap-4 mb-10">
              <span className="font-mono-num text-xs tracking-widest uppercase text-muted-foreground">
                Semester 1
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                Build the financial spine
              </h2>
            </div>

            {/* Desktop: staggered row */}
            <div className="hidden md:grid md:grid-cols-4 gap-5">
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
        <section className="py-16 md:py-20 bg-forest-dark relative overflow-hidden">
          <div
            className="absolute inset-0 accounting-grid-dark pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline gap-4 mb-10">
              <span className="font-mono-num text-xs tracking-widest uppercase text-white/70">
                Semester 2
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-white">
                Run &amp; finance the venture
              </h2>
            </div>

            {/* Desktop: staggered row */}
            <div className="hidden md:grid md:grid-cols-4 gap-5">
              {semester2.map((unit, i) => (
                <UnitTeaserDark key={unit.unitNumber} unit={unit} delay={i * 60} />
              ))}
            </div>

            {/* Mobile: carousel */}
            <div className="md:hidden">
              <Carousel itemsPerView={1} gap="gap-4" className="max-w-sm mx-auto">
                {semester2.map((unit) => (
                  <div key={unit.unitNumber} className="p-1">
                    <UnitTeaserDark unit={unit} delay={0} />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* ── Capstone Spotlight ── */}
      {capstone && (
        <section className="py-16 md:py-24 bg-muted/20 ledger-bg">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
            <span className="section-label">The Finale</span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4">
              {capstone.title}
            </h2>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
              {capstone.description}
            </p>
            <div className="flex justify-center">
              <Link
                href="/capstone"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-md gradient-financial text-white font-body font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                See the capstone
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-20 bg-forest-dark relative overflow-hidden">
        <div
          className="absolute inset-0 accounting-grid-dark pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 max-w-3xl text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Ready to start building?
          </h2>
          <p className="text-white/70 font-body text-lg">
            Log in to access lessons, datasets, and your personal workbook progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-white font-body font-semibold shadow-lg hover:bg-white/90 hover:shadow-xl transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
              style={{ color: "oklch(0.22 0.05 157)" }}
            >
              Student or teacher login
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-transparent border text-white font-body hover:bg-white/10 hover:border-white/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2"
              style={{ borderColor: "oklch(1 0 0 / 0.25)" }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────
 * Unit teaser card — light background variant
 * ─────────────────────────────────────────── */
function UnitTeaser({ unit, delay }: { unit: UnitCurriculum; delay: number }) {
  const deliverable = unit.lessons[0]?.description ?? unit.description;

  return (
    <div
      className="card-workbook h-full p-5 relative overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Watermark */}
      <span
        className="absolute -right-1 -top-3 font-display font-bold leading-none select-none pointer-events-none"
        style={{ fontSize: "5rem", color: "oklch(var(--primary) / 0.05)" }}
        aria-hidden="true"
      >
        {unit.unitNumber}
      </span>

      <p className="font-mono-num text-[10px] text-muted-foreground mb-2 tracking-widest uppercase">
        Unit {unit.unitNumber}
      </p>
      <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-3">
        {unit.title}
      </h3>
      <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4 line-clamp-2">
        {deliverable}
      </p>

      <div className="mt-auto flex items-center text-xs text-primary font-medium font-body gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {unit.lessons.length} lessons <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Unit teaser card — dark background variant
 * ─────────────────────────────────────────── */
function UnitTeaserDark({ unit, delay }: { unit: UnitCurriculum; delay: number }) {
  const deliverable = unit.lessons[0]?.description ?? unit.description;

  return (
    <div
      className="h-full p-5 rounded-lg relative overflow-hidden group transition-all duration-200 hover:-translate-y-1"
      style={{
        background: "oklch(1 0 0 / 0.05)",
        border: "1px solid oklch(1 0 0 / 0.08)",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Watermark */}
      <span
        className="absolute -right-1 -top-3 font-display font-bold leading-none select-none pointer-events-none"
        style={{ fontSize: "5rem", color: "oklch(1 0 0 / 0.04)" }}
        aria-hidden="true"
      >
        {unit.unitNumber}
      </span>

      <p className="font-mono-num text-[10px] text-white/70 mb-2 tracking-widest uppercase">
        Unit {unit.unitNumber}
      </p>
      <h3 className="font-display text-lg font-semibold text-white group-hover:text-[oklch(0.68_0.17_157)] transition-colors leading-snug mb-3">
        {unit.title}
      </h3>
      <p className="text-sm text-white/70 font-body leading-relaxed mb-4 line-clamp-2">
        {deliverable}
      </p>

      <div className="mt-auto flex items-center text-xs font-medium font-body gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "oklch(0.68 0.17 157)" }}>
        {unit.lessons.length} lessons <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  );
}
