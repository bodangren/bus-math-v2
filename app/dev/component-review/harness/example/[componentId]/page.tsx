'use client';

import { notFound } from 'next/navigation';
import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface Props {
  params: Promise<{ componentId: string }>;
}

export default function ExampleHarnessPage({ params }: Props) {
  const { componentId } = use(params);

  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const versionHashData = useQuery(api.component_approvals.getComponentVersionHash, {
    componentType: 'example',
    componentId,
  });
  const versionHash = versionHashData ?? 'N/A (examples not supported)';

  const [checksCompleted, setChecksCompleted] = useState<Record<string, boolean>>({});

  const requiredChecks = [
    { id: 'prompt_clear', label: 'Prompt is clear and unambiguous' },
    { id: 'instructions_complete', label: 'Instructions are complete for all modes' },
    { id: 'feedback_accurate', label: 'Feedback is accurate for correct and incorrect answers' },
    { id: 'no_dead_ui', label: 'No dead buttons, disabled states, or unhandled edge cases' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
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
            <Lightbulb className="size-5 text-slate-400" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Example Harness</span>
            <Badge variant="outline">{componentId}</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Practice Family: {componentId}</h1>
          <p className="text-sm text-slate-600">
            Version hash: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{versionHash.slice(0, 12)}...</code>
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-100">Not Yet Implemented</Badge>
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Example Review Harness</h2>
          <p className="text-sm text-slate-600">
            Example components do not yet use the practice family system. The example review harness requires
            a separate implementation with its own content hash strategy before it can generate and display
            example problems.
          </p>
          <p className="text-sm text-slate-600">
            The review checklist below remains available for future use when example support is implemented.
            For now, this harness serves as a placeholder showing the version hash for the component.
          </p>
          <div className="rounded-lg bg-amber-100/50 p-3 text-sm">
            <strong>Tech-debt note:</strong> The version hash for examples is currently a constant placeholder
            (&ldquo;example:${componentId}:placeholder&rdquo;). Real example content hashing requires a separate
            implementation track.
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Review Checklist</h2>
          <div className="space-y-2">
            {requiredChecks.map((check) => (
              <label key={check.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={!!checksCompleted[check.id]}
                  onChange={(e) =>
                    setChecksCompleted((prev) => ({ ...prev, [check.id]: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm">{check.label}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button
              disabled
              title="Approval not applicable — example components are embedded lesson content"
            >
              Not Applicable
            </Button>
            <span className="text-sm text-slate-500">
              Approval not applicable — example components are embedded lesson content
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}