import Link from 'next/link';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getConvexUrl } from "@/lib/convex/config";
import { CapstoneWorkbookDownloads } from '@/components/capstone/CapstoneWorkbookDownloads';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    { range: [1, 2], label: 'Phase I' },
    { range: [3, 4], label: 'Phase II' },
    { range: [5, 6], label: 'Phase III' },
    { range: [7, 8], label: 'Phase IV' },
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
    <div className="text-center space-y-4">
      <span className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest">{label}</span>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">{title}</h2>
      <p className="text-muted-foreground max-w-3xl mx-auto text-sm md:text-base font-body leading-relaxed">
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
      <header className="relative overflow-hidden border-b border-border bg-secondary/20">
        <div className="relative container mx-auto max-w-6xl px-4 py-20 text-center space-y-6">
          <span className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
            The Finale
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mt-4 leading-tight tracking-tight">
            {data.capstone?.title ?? 'Investor-Ready Capstone'}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body max-w-4xl mx-auto leading-relaxed">
            {data.capstone?.deliverable
              ? `${data.capstone.deliverable} — an integrated business environment fueled by eight units of rigorous modeling.`
              : 'Authentic business modeling where every unit artifact fuels a final, linked Excel workbook, business plan, and investor pitch.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button asChild variant="outline" size="sm">
              <Link href="/api/pdfs/capstone_business_plan_guide.pdf">
                Business Plan Guide
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/api/pdfs/capstone_pitch_rubric.pdf">
                Pitch Rubric
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/api/pdfs/capstone_model_tour_checklist.pdf">
                Model Tour Checklist
              </Link>
            </Button>
          </div>
          <div className="pt-6">
            <CapstoneWorkbookDownloads />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em] pt-4">
            Review the <Link className="text-foreground hover:underline" href="/capstone/guidelines">Guidelines</Link> and <Link className="text-foreground hover:underline" href="/capstone/rubrics">Rubrics</Link>
          </p>
        </div>
      </header>

      {/* Curriculum Bridge */}
      <div className="py-20 md:py-28 border-b border-border">
        <div className="container mx-auto max-w-6xl px-4 space-y-16">
          <SectionHeader
            label="Curriculum Bridge"
            title="Systems integration"
            description="Unit deliverables become the subsystems of the integrated model. We trace the throughline from ledger discipline to investor storytelling."
          />
          {allUnits.length === 0 ? (
            <div className="text-center text-muted-foreground font-mono text-[10px] border border-border p-16 bg-background uppercase tracking-widest">
              Data not available.
            </div>
          ) : (
            <div className="grid gap-px bg-border border border-border">
              {allUnits.map((unit) => {
                const label = unit.unitNumber <= 8 ? `Unit ${unit.unitNumber}` : 'Capstone';
                const watermark = unit.unitNumber <= 8 ? String(unit.unitNumber) : '★';
                return (
                  <div key={unit.unitNumber} className="bg-background p-6 relative overflow-hidden group hover:bg-secondary transition-colors">
                    <span
                      className="absolute -right-1 -top-2 font-mono font-bold leading-none select-none pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity"
                      style={{ fontSize: "3rem" }}
                      aria-hidden="true"
                    >
                      {watermark}
                    </span>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground font-bold">{label}</span>
                      <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider">{unit.title}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-3 uppercase tracking-tight">
                      {unit.deliverable ?? unit.title}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {unit.accountingFocus && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Accounting</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{unit.accountingFocus}</p>
                        </div>
                      )}
                      {unit.excelFocus && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Excel</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{unit.excelFocus}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Driving Questions */}
      {drivingQuestions.length > 0 && (
        <div className="py-20 md:py-28 border-b border-border bg-secondary/10">
          <div className="container mx-auto max-w-6xl px-4 space-y-16">
            <SectionHeader
              label="Public Products"
              title="Driving questions"
              description="REMINDING STUDENTS WHO THEY ARE BUILDING FOR EVERY TIME A DELIVERABLE SHIPS."
            />
            <div className="grid gap-px bg-border border border-border">
              {drivingQuestions.map((item) => (
                <div key={item.label} className="bg-background p-6 hover:bg-secondary transition-colors">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2 font-bold">{item.label}</p>
                  {item.audience && (
                    <p className="text-[10px] font-mono text-foreground uppercase tracking-wider mb-4 border-l border-foreground pl-2">{item.audience}</p>
                  )}
                  <p className="text-sm text-foreground font-body italic leading-relaxed">&ldquo;{item.question}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Narrative Arcs */}
      {narrativeArcs.length > 0 && (
        <div className="py-20 md:py-28 border-b border-border">
          <div className="container mx-auto max-w-6xl px-4 space-y-16">
            <SectionHeader
              label="Narrative"
              title="The TechStart Arc"
              description="Sarah Chen&rsquo;s story provides the functional context for every model."
            />
            <div className="grid md:grid-cols-4 gap-px bg-border border border-border">
              {narrativeArcs.map((moment) => (
                <div
                  key={moment.phase}
                  className="bg-background p-6 space-y-4 hover:bg-secondary transition-colors"
                >
                  <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground font-bold">{moment.phase}</p>
                  <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-tight">{moment.headline}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-body">{moment.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quality standards */}
      <div className="py-20 md:py-32">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="border border-border bg-background">
            <div className="px-8 py-6 border-b border-border bg-secondary/30">
              <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-[0.2em]">Quality Standards for Submission</h3>
            </div>
            <div className="p-8">
              <ul className="space-y-4">
                {[
                  "Linked formulas only — no hard-coded totals or plug values.",
                  "Document data sources and annotate complex logic with concise comments.",
                  "Use validation checks & KPI indicators so issues surface before Demo Day.",
                  "Keep formatting professional: consistent currency, alignment, and label conventions."
                ].map((std, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="font-mono text-[10px] text-muted-foreground pt-1">0{i+1}</span>
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">{std}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
