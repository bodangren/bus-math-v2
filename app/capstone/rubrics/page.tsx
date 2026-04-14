import Link from 'next/link';

export default function CapstoneRubricsPage() {
  return (
    <main className="flex-1 bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link href="/capstone" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          &larr; Back to Capstone Overview
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
          Capstone Rubrics
        </h1>
        <div className="space-y-8 font-body text-muted-foreground">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Pitch Rubric
            </h2>
            <p className="mb-4 text-sm">
              40 points total. Download the <Link href="/api/pdfs/capstone_pitch_rubric.pdf" className="underline hover:text-foreground" target="_blank">full pitch rubric PDF</Link> for detailed criteria.
            </p>
            <div className="space-y-4">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">1. Presentation Structure</h3>
                  <span className="text-sm font-medium text-muted-foreground">8 pts</span>
                </div>
                <p className="text-sm">Clear narrative flow, logical sequencing, and effective use of time. Opening hooks attention, body develops key points, closing reinforces main message.</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">2. Financial Clarity</h3>
                  <span className="text-sm font-medium text-muted-foreground">10 pts</span>
                </div>
                <p className="text-sm">Demonstrates understanding of financial concepts. Workbooks are accurate, properly linked, and support the business thesis. Numbers tell a coherent story.</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">3. Market Understanding</h3>
                  <span className="text-sm font-medium text-muted-foreground">8 pts</span>
                </div>
                <p className="text-sm">Shows realistic assessment of target market, competitive landscape, and growth potential. Evidence supports market claims and assumptions.</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">4. Q&amp;A Handling</h3>
                  <span className="text-sm font-medium text-muted-foreground">6 pts</span>
                </div>
                <p className="text-sm">Responds confidently to audience questions. Acknowledges uncertainties, defends assumptions with evidence, and thinks on feet.</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground">5. Delivery</h3>
                  <span className="text-sm font-medium text-muted-foreground">8 pts</span>
                </div>
                <p className="text-sm">Professional demeanor, appropriate pacing, clear articulation, and effective use of visual aids. Engages audience throughout.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Model Tour Checklist
            </h2>
            <p className="mb-4 text-sm">
              Download the <Link href="/api/pdfs/capstone_model_tour_checklist.pdf" className="underline hover:text-foreground" target="_blank">full model tour checklist PDF</Link> for detailed criteria.
            </p>
            <div className="space-y-4">
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">1. Financial Model Components</h3>
                <p className="text-sm">Income statement, balance sheet, and cash flow statement are present and properly linked. All assumptions are documented in supporting schedules.</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">2. Assumption Documentation</h3>
                <p className="text-sm">Key assumptions are clearly stated, justified with evidence, and sensitivity analysis is included where relevant.</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">3. Formatting Standards</h3>
                <p className="text-sm">Consistent formatting, clear labels, professional layout. Headers, footers, and page numbers present throughout.</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">4. Data Sources and References</h3>
                <p className="text-sm">All external data is cited with sources. Market research, industry benchmarks, and historical data are properly referenced.</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">5. Executive Summary Alignment</h3>
                <p className="text-sm">Model outputs are consistent with the executive summary claims. Numbers in the pitch match the underlying financial model.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}