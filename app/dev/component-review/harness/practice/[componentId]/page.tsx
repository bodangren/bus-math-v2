'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  params: Promise<{ componentId: string }>;
}

export default function PracticeHarnessPage({ params }: Props) {
  const { componentId } = use(params);

  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="space-y-2 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dev/component-review">
                <ArrowLeft className="size-4" />
                Back to Queue
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Puzzle className="size-5 text-slate-400" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Practice Harness</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{componentId}</h1>
          <p className="text-sm text-slate-600">
            Review harness for practice family <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{componentId}</code>.
            Full harness implementation is Phase 4 of this track.
          </p>
        </header>

        <section className="rounded-2xl border bg-amber-50/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-amber-900">Phase 4 Scope</h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-800">
            <li>Runs attempts against the practice family</li>
            <li>Tests answer validation and feedback</li>
            <li>Shows evidence payloads where applicable</li>
            <li>Exercises randomized variants where applicable</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
