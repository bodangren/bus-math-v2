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
        <div className="space-y-6 font-body text-muted-foreground">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Pitch Rubric
            </h2>
            <p className="mb-4">
              Download the full pitch rubric from the capstone overview page.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Model Tour Checklist
            </h2>
            <p className="mb-4">
              Download the model tour checklist from the capstone overview page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
