import Link from 'next/link';

export default function CapstoneGuidelinesPage() {
  return (
    <main className="flex-1 bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link href="/capstone" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          &larr; Back to Capstone Overview
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
          Capstone Guidelines
        </h1>
        <div className="space-y-6 font-body text-muted-foreground">
          <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            Overview
          </h2>
          <p className="mb-4">
            The capstone project is your chance to apply everything you&apos;ve learned
            about business math and accounting to build a real, investor-ready business plan
            and financial model.
          </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Key Deliverables
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Linked investor-ready workbook with statement, operations, and financing tabs</li>
              <li>Polished business plan with executive summary</li>
              <li>Final presentation and pitch</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
