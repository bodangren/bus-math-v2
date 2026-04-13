'use client';

import { notFound } from 'next/navigation';
import { use, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Box, CheckCircle, RotateCcw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getActivityComponent } from '@/lib/activities/registry';
import { computeActivityVersionHash } from '@/lib/component-approval/version-hashes';
import type { ComponentType } from 'react';

interface Props {
  params: Promise<{ componentId: string }>;
}

function ActivityWithSubmit({
  Component,
  props,
  onSubmit,
}: {
  Component: ComponentType<Record<string, unknown>>;
  props: Record<string, unknown>;
  onSubmit: (envelope: unknown) => void;
}) {
  return <Component {...props} onSubmit={onSubmit} />;
}

export default function ActivityHarnessPage({ params }: Props) {
  const { componentId } = use(params);

  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const ActivityComponent = useMemo(() => getActivityComponent(componentId), [componentId]);
  const versionHash = useMemo(() => {
    try {
      return computeActivityVersionHash(componentId);
    } catch {
      return 'unknown';
    }
  }, [componentId]);

  const [renderKey, setRenderKey] = useState(0);
  const [activityProps, setActivityProps] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<Record<string, unknown> | null>(null);

  const handleReset = useCallback(() => {
    setSubmitted(false);
    setLastSubmission(null);
    setRenderKey((k) => k + 1);
  }, []);

  const handleSubmit = useCallback((envelope: unknown) => {
    setSubmitted(true);
    setLastSubmission(envelope as Record<string, unknown>);
  }, []);

  const handleNewProps = useCallback((newProps: Record<string, unknown>) => {
    setActivityProps(newProps);
    setSubmitted(false);
    setLastSubmission(null);
    setRenderKey((k) => k + 1);
  }, []);

  const defaultActivityProps: Record<string, Record<string, unknown>> = {
    'comprehension-quiz': {
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          prompt: 'What is the primary purpose of a balance sheet?',
          options: [
            'To show a company\'s profitability',
            'To show a company\'s financial position at a point in time',
            'To track cash flows',
            'To calculate net income',
          ],
          correctAnswer: 1,
        },
        {
          id: 'q2',
          type: 'true-false',
          prompt: 'Assets always equal liabilities plus equity.',
          correctAnswer: true,
        },
      ],
    },
    'journal-entry-building': {
      description: 'Record the following transaction in journal entry format.',
      transaction: {
        date: '2026-03-20',
        narrative: 'Paid rent for the month, $5,000.',
        accounts: [
          { name: 'Rent Expense', debit: 5000, credit: 0 },
          { name: 'Cash', debit: 0, credit: 5000 },
        ],
      },
    },
    'tiered-assessment': {
      questions: [
        {
          id: 't1',
          prompt: 'Calculate the current ratio given current assets of $100,000 and current liabilities of $50,000.',
          correctAnswer: 2,
          hint: 'Current Ratio = Current Assets / Current Liabilities',
        },
      ],
    },
  };

  const props = Object.keys(activityProps).length > 0 ? activityProps : defaultActivityProps[componentId] || {};

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
            <Box className="size-5 text-slate-400" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Activity Harness</span>
            <Badge variant="outline">{componentId}</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity Component: {componentId}</h1>
          <p className="text-sm text-slate-600">
            Version hash: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{versionHash.slice(0, 12)}...</code>
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Controls</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="size-4 mr-1" />
              Reset
            </Button>
            {defaultActivityProps[componentId] && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNewProps(defaultActivityProps[componentId])}
              >
                <Play className="size-4 mr-1" />
                Load Default Props
              </Button>
            )}
            {submitted && (
              <Badge className="bg-emerald-100 text-emerald-800">
                <CheckCircle className="size-4 mr-1" />
                Submitted
              </Badge>
            )}
          </div>
        </section>

        {!ActivityComponent ? (
          <section className="space-y-4 rounded-2xl border bg-red-50/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-red-900">Component Not Found</h2>
            <p className="text-sm text-red-800">
              No activity component registered for <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">{componentId}</code>.
              Check the activity registry.
            </p>
          </section>
        ) : (
          <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">Activity Render</h2>
            <div className="rounded-lg border bg-slate-50 p-4">
              <ActivityWithSubmit
                key={renderKey}
                Component={ActivityComponent}
                props={props}
                onSubmit={handleSubmit}
              />
            </div>
          </section>
        )}

        {lastSubmission && (
          <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">Last Submission</h2>
            <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(lastSubmission, null, 2)}
            </pre>
          </section>
        )}

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Props Override</h2>
          <p className="text-sm text-slate-600">
            Current props being passed to the activity component. Edit to test different configurations.
          </p>
          <pre className="max-h-48 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(props, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}
