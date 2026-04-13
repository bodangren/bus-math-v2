'use client';

import { notFound } from 'next/navigation';
import { use, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, CheckCircle, RotateCcw, Shuffle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPracticeFamily } from '@/lib/practice/engine/family-registry';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { ProblemFamily, GradeResult } from '@/lib/practice/engine/types';

const MODES = ['worked_example', 'guided_practice', 'independent_practice'] as const;
const MODE_LABELS: Record<(typeof MODES)[number], string> = {
  worked_example: 'Worked Example',
  guided_practice: 'Guided Practice',
  independent_practice: 'Independent Practice',
};

interface Props {
  params: Promise<{ componentId: string }>;
}

export default function ExampleHarnessPage({ params }: Props) {
  const { componentId } = use(params);

  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const family = useMemo(() => getPracticeFamily(componentId), [componentId]);
  const versionHashData = useQuery(api.component_approvals.getComponentVersionHash, {
    componentType: 'example',
    componentId,
  });
  const versionHash = versionHashData ?? 'loading...';

  const [currentMode, setCurrentMode] = useState<(typeof MODES)[number]>('worked_example');
  const [seed, setSeed] = useState(2026);
  const [problem, setProblem] = useState<ReturnType<ProblemFamily<unknown, unknown, unknown>['generate']> | null>(null);
  const [solution, setSolution] = useState<ReturnType<ProblemFamily<unknown, unknown, unknown>['solve']> | null>(null);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [checksCompleted, setChecksCompleted] = useState<Record<string, boolean>>({});
  const [approved, setApproved] = useState(false);

  const generateNewProblem = useCallback(() => {
    if (!family) return;
    const definition = family.generate(seed, { mode: currentMode });
    const response = family.solve(definition);
    setProblem(definition);
    setSolution(response);
    setGradeResult(null);
    setShowSolution(false);
    setChecksCompleted({});
    setApproved(false);
  }, [family, seed, currentMode]);

  const handleSubmit = useCallback(() => {
    if (!family || !problem || !solution) return;
    const response = family.solve(problem);
    const grade = family.grade(problem, response);
    setGradeResult(grade);
  }, [family, problem, solution]);

  const handleGradeWrong = useCallback(() => {
    if (!family || !problem) return;
    const correctResponse = family.solve(problem);
    const wrongResponse: Record<string, unknown> = {};
    Object.keys(correctResponse as Record<string, unknown>).forEach((key) => {
      const val = (correctResponse as Record<string, unknown>)[key];
      if (typeof val === 'number') {
        wrongResponse[key] = val + 9999;
      } else {
        wrongResponse[key] = val;
      }
    });
    const grade = family.grade(problem, wrongResponse as Parameters<typeof family.grade>[1]);
    setGradeResult(grade);
  }, [family, problem]);

  if (!family) {
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
              <Lightbulb className="size-5 text-slate-400" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Example Harness</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{componentId}</h1>
            <p className="text-sm text-red-600">Practice family not found: {componentId}</p>
          </header>
        </div>
      </main>
    );
  }

  const requiredChecks = [
    { id: 'prompt_clear', label: 'Prompt is clear and unambiguous' },
    { id: 'instructions_complete', label: 'Instructions are complete for all modes' },
    { id: 'feedback_accurate', label: 'Feedback is accurate for correct and incorrect answers' },
    { id: 'no_dead_ui', label: 'No dead buttons, disabled states, or unhandled edge cases' },
  ];

  const allChecksComplete = requiredChecks.every((check) => checksCompleted[check.id]);
  const canApprove = allChecksComplete && problem !== null && gradeResult !== null;

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

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Controls</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Mode:</span>
              {MODES.map((mode) => (
                <Button
                  key={mode}
                  variant={currentMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setCurrentMode(mode);
                    setProblem(null);
                    setSolution(null);
                    setGradeResult(null);
                  }}
                >
                  {MODE_LABELS[mode]}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Seed:</span>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value, 10) || 2026)}
                className="w-24 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              />
              <Button variant="outline" size="sm" onClick={() => setSeed((s) => s + 1)}>
                <RotateCcw className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={generateNewProblem}
                disabled={!family}
              >
                <Shuffle className="size-4 mr-1" />
                Generate Problem
              </Button>
              {problem && (
                <>
                  <Button variant="outline" size="sm" onClick={handleSubmit}>
                    Submit (Correct)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGradeWrong}>
                    Submit (Wrong)
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {problem && (
          <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Problem</h2>
              <Badge>{currentMode.replace('_', ' ')}</Badge>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium">Prompt: {String((problem as { prompt?: { title?: string; stem?: string } }).prompt?.title || (problem as { prompt?: string }).prompt || 'N/A')}</p>
              {(problem as { prompt?: { stem?: string } }).prompt?.stem && (
                <p className="mt-2 text-sm text-slate-600">{(problem as { prompt: { stem: string } }).prompt.stem}</p>
              )}
            </div>
            <pre className="max-h-48 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(problem, null, 2)}
            </pre>
          </section>
        )}

        {solution && (
          <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Solution</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSolution(!showSolution)}>
                <Eye className="size-4 mr-1" />
                {showSolution ? 'Hide' : 'Show'}
              </Button>
            </div>
            {showSolution && (
              <pre className="max-h-48 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                {JSON.stringify(solution, null, 2)}
              </pre>
            )}
          </section>
        )}

        {gradeResult && (
          <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">Grading Result</h2>
            <div className="flex items-center gap-4">
              <Badge className={gradeResult.score === gradeResult.maxScore ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                {gradeResult.score} / {gradeResult.maxScore}
              </Badge>
              {gradeResult.feedback && (
                <span className="text-sm text-slate-600">{gradeResult.feedback}</span>
              )}
            </div>
            <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(gradeResult, null, 2)}
            </pre>
          </section>
        )}

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
              onClick={() => setApproved(true)}
              disabled={!canApprove}
            >
              Mark Approved
            </Button>
            {approved && (
              <Badge className="bg-emerald-100 text-emerald-800">
                <CheckCircle className="size-4 mr-1" />
                Approved
              </Badge>
            )}
            {!allChecksComplete && problem && (
              <span className="text-sm text-slate-500">Complete all checks to approve</span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
