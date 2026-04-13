import Link from 'next/link';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getConvexUrl } from "@/lib/convex/config";
import { CapstoneWorkbookDownloads } from '@/components/capstone/CapstoneWorkbookDownloads';

export const dynamic = 'force-dynamic';

interface CapstoneUnit {
  unitNumber: number;
  title: string;
  drivingQuestion: string | null;
  scenario: string | null;
  deliverable: string | null;
  accountingFocus: string | null;
  excelFocus: string | null;
  audience: string | null;
}

interface CapstonePageData {
  instructionalUnits: CapstoneUnit[];
  capstone: CapstoneUnit | null;
}

function getConvexClient() {
  return new ConvexHttpClient(getConvexUrl());
}

/** Group units into narrative arcs by phase range. */
function buildNarrativeArcs(units: CapstoneUnit[]) {
  const phases: { range: [number, number]; label: string }[] = [
    { range: [1, 2], label: 'Units 1-2' },
    { range: [3, 4], label: 'Units 3-4' },
    { range: [5, 6], label: 'Units 5-6' },
    { range: [7, 8], label: 'Units 7-8' },
  ];

  return phases
    .map((phase) => {
      const phaseUnits = units.filter(
        (u) => u.unitNumber >= phase.range[0] && u.unitNumber <= phase.range[1],
      );
      if (phaseUnits.length === 0) return null;

      const scenarios = phaseUnits
        .map((u) => u.scenario)
        .filter(Boolean)
        .join(' ');

      return {
        phase: phase.label,
        headline: phaseUnits.map((u) => u.title).join(' & '),
        detail: scenarios || 'See unit details for the full scenario.',
      };
    })
    .filter(Boolean) as { phase: string; headline: string; detail: string }[];
}

function SectionHeader({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="text-center space-y-3">
      <span className="section-label">{label}</span>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">{title}</h2>
      <p className="text-muted-foreground max-w-3xl mx-auto text-sm md:text-base font-body">
        {description}
      </p>
    </div>
  );
}

export default async function CapstonePage() {
  const convex = getConvexClient();

  let data: CapstonePageData = { instructionalUnits: [], capstone: null };
  try {
    data = await convex.query(api.public.getCapstonePageData) as CapstonePageData;
  } catch (err) {
    console.error("[capstone] Failed to load capstone page data from Convex", err);
  }

  const allUnits = [
    ...data.instructionalUnits,
    ...(data.capstone ? [data.capstone] : []),
  ];

  const drivingQuestions = allUnits
    .filter((u) => u.drivingQuestion)
    .map((u) => ({
      label: u.unitNumber <= 8 ? `Unit ${u.unitNumber}` : 'Capstone',
      question: u.drivingQuestion!,
      audience: u.audience,
    }));

  const narrativeArcs = buildNarrativeArcs(data.instructionalUnits);

  return (
    <main className="flex-1 bg-background">
      <header className="hero-gradient relative overflow-hidden border-b border-white/[0.08]">
        <div
          className="absolute inset-0 accounting-grid-dark pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative container mx-auto max-w-6xl px-4 py-14 text-center space-y-4">
          <span className="section-label section-label-light">Capstone Overview</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mt-4">
            {data.capstone?.title ?? 'Investor-Ready Capstone Project'}
          </h1>
          <p className="text-lg md:text-xl text-white/75 font-body max-w-4xl mx-auto">
            {data.capstone?.deliverable
              ? `${data.capstone.deliverable} — every unit artifact fuels a final, linked Excel workbook, business plan, and investor pitch.`
              : '13 weeks of authentic business modeling where every unit artifact fuels a final, linked Excel workbook, business plan, and investor pitch.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <Link
              href="/api/pdfs/capstone_business_plan_guide.pdf"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Download Business Plan Guide
            </Link>
            <Link
              href="/api/pdfs/capstone_pitch_rubric.pdf"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
            >
              Download Pitch Rubric
            </Link>
            <Link
              href="/api/pdfs/capstone_model_tour_checklist.pdf"
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              Download Model Tour Checklist
            </Link>
          </div>
          <CapstoneWorkbookDownloads />
          <p className="text-sm text-white/70 font-body">
            Need specifics? Review the <Link className="underline text-white/70 hover:text-white transition-colors" href="/capstone/guidelines">Capstone Guidelines</Link> and <Link className="underline text-white/70 hover:text-white transition-colors" href="/capstone/rubrics">Rubrics</Link> before Demo Day.
          </p>
        </div>
      </header>

      {/* Curriculum Bridge — ledger-ruled background */}
      <div className="py-12 bg-muted/20 ledger-bg">
        <div className="container mx-auto max-w-6xl px-4 space-y-6 font-body">
          <SectionHeader
            label="Curriculum Bridge"
            title="How each unit feeds the capstone"
            description="Unit deliverables become the subsystems of the integrated model. Students see the throughline from ledger discipline to investor storytelling."
          />
          {allUnits.length === 0 ? (
            <div className="text-center text-muted-foreground font-body border rounded-xl p-12 bg-card">
              Curriculum data isn&apos;t available yet. Please publish lessons to populate this page.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allUnits.map((unit) => {
                const label = unit.unitNumber <= 8 ? `Unit ${unit.unitNumber}` : 'Capstone';
                const watermark = unit.unitNumber <= 8 ? String(unit.unitNumber) : '\u2605';
                return (
                  <div key={unit.unitNumber} className="card-workbook p-5 relative overflow-hidden">
                    <span
                      className="absolute -right-1 -top-2 font-display font-bold leading-none select-none pointer-events-none"
                      style={{ fontSize: "4rem", color: "oklch(var(--primary) / 0.05)" }}
                      aria-hidden="true"
                    >
                      {watermark}
                    </span>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span className="font-mono-num text-xs tracking-wider uppercase">{label}</span>
                      <span className="section-label">{unit.title}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      {unit.deliverable ?? unit.title}
                    </h3>
                    {unit.accountingFocus && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Accounting: {unit.accountingFocus}
                      </p>
                    )}
                    {unit.excelFocus && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Excel:&nbsp;</span>
                        {unit.excelFocus}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Driving Questions */}
      {drivingQuestions.length > 0 && (
        <div className="py-12 bg-background">
          <div className="container mx-auto max-w-6xl px-4 space-y-6 font-body">
            <SectionHeader
              label="Public Products"
              title="Driving questions &amp; authentic audiences"
              description="Keep the PBL energy alive by reminding students who they are building for every time a deliverable ships."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {drivingQuestions.map((item) => (
                <div key={item.label} className="card-workbook p-5">
                  <p className="font-mono-num text-xs tracking-wider uppercase text-muted-foreground mb-1">{item.label}</p>
                  {item.audience && (
                    <p className="text-xs text-primary font-medium font-body mb-2">{item.audience}</p>
                  )}
                  <p className="text-sm text-foreground font-body italic leading-relaxed">&ldquo;{item.question}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sarah Chen Narrative — subtle green tint */}
      {narrativeArcs.length > 0 && (
        <div className="py-12 bg-muted/20 ledger-bg">
          <div className="container mx-auto max-w-6xl px-4 space-y-6 font-body">
            <SectionHeader
              label="Narrative"
              title="Sarah Chen&rsquo;s TechStart arc"
              description="Use Sarah&rsquo;s story to keep the &ldquo;why&rdquo; front-and-center — students step into her decision-making to justify every spreadsheet."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {narrativeArcs.map((moment) => (
                <div
                  key={moment.phase}
                  className="rounded-lg p-5"
                  style={{ background: "oklch(var(--primary) / 0.05)", border: "1px solid oklch(var(--primary) / 0.12)" }}
                >
                  <p className="font-mono-num text-xs tracking-wider uppercase text-primary/70 mb-1">{moment.phase}</p>
                  <h3 className="font-display text-base font-semibold text-foreground mb-2">{moment.headline}</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{moment.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quality standards — dark accent */}
      <div className="py-12 bg-background">
        <div className="container mx-auto max-w-6xl px-4 font-body">
          <div className="card-statement rounded-lg overflow-hidden max-w-2xl mx-auto">
            <div className="excel-header px-6 py-3">
              <h3 className="font-display text-base font-semibold text-primary">Quality standards for submission</h3>
              <p className="text-xs text-muted-foreground">Simple guardrails that keep every workbook investor-ready.</p>
            </div>
            <div className="px-6 py-4">
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
                <li>Linked formulas only — no hard-coded totals or plug values.</li>
                <li>Document data sources and annotate complex logic with concise comments.</li>
                <li>Use validation checks &amp; KPI indicators so issues surface before Demo Day.</li>
                <li>Keep formatting professional: consistent currency, alignment, and label conventions.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
