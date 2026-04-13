'use client';

import { notFound } from 'next/navigation';
import { use, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Puzzle, RotateCcw, Shuffle, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPracticeFamily } from '@/lib/practice/engine/family-registry';
import { computePracticeVersionHash } from '@/lib/component-approval/version-hashes';
import type { ProblemFamily, GradeResult } from '@/lib/practice/engine/types';

interface Props {
  params: Promise<{ componentId: string }>;
}

export default function PracticeHarnessPage({ params }: Props) {
  const { componentId } = use(params);

  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const family = useMemo(() => getPracticeFamily(componentId), [componentId]);
  const versionHash = useMemo(() => {
    try {
      return computePracticeVersionHash(componentId);
    } catch {
      return 'unknown';
    }
  }, [componentId]);

  const [seed, setSeed] = useState(12345);
  const [problem, setProblem] = useState<ReturnType<ProblemFamily<unknown, unknown, unknown>['generate']> | null>(null);
  const [solution, setSolution] = useState<ReturnType<ProblemFamily<unknown, unknown, unknown>['solve']> | null>(null);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [envelope, setEnvelope] = useState<Record<string, unknown> | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const generateNewProblem = useCallback(() => {
    if (!family) return;
    const definition = family.generate(seed, {});
    const response = family.solve(definition);
    setProblem(definition);
    setSolution(response);
    setGradeResult(null);
    setEnvelope(null);
    setAttempts(0);
  }, [family, seed]);

  const handleSubmitCorrect = useCallback(() => {
    if (!family || !problem || !solution) return;
    const response = family.solve(problem);
    const grade = family.grade(problem, response);
    setGradeResult(grade);
    const env = family.toEnvelope(problem, response, grade);
    setEnvelope(env as unknown as Record<string, unknown>);
    setAttempts((a) => a + 1);
  }, [family, problem, solution]);

  const handleSubmitWrong = useCallback(() => {
    if (!family || !problem) return;
    const correctResponse = family.solve(problem);
    const wrongResponse: Record<string, unknown> = {};
    Object.keys(correctResponse as Record<string, unknown>).forEach((key) => {
      const val = (correctResponse as Record<string, unknown>)[key];
      if (typeof val === 'number') {
        wrongResponse[key] = val + 9999;
      } else if (typeof val === 'string') {
        wrongResponse[key] = `wrong_${val}`;
      } else {
        wrongResponse[key] = val;
      }
    });
    const grade = family.grade(problem, wrongResponse as Parameters<typeof family.grade>[1]);
    setGradeResult(grade);
    const env = family.toEnvelope(problem, wrongResponse as Parameters<typeof family.toEnvelope>[1], grade);
    setEnvelope(env as unknown as Record<string, unknown>);
    setAttempts((a) => a + 1);
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
              <Puzzle className="size-5 text-slate-400" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Practice Harness</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{componentId}</h1>
            <p className="text-sm text-red-600">Practice family not found: {componentId}</p>
          </header>
        </div>
      </main>
    );
  }

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
            <Puzzle className="size-5 text-slate-400" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Practice Harness</span>
            <Badge variant="outline">{componentId}</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Practice Family: {componentId}</h1>
          <p className="text-sm text-slate-600">
            Version hash: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{versionHash.slice(0, 12)}...</code>
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Controls</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Seed:</span>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value, 10) || 12345)}
                className="w-28 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              />
              <Button variant="outline" size="sm" onClick={() => setSeed((s) => s + 1)}>
                <RotateCcw className="size-4" />
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={generateNewProblem}
              disabled={!family}
            >
              <Shuffle className="size-4 mr-1" />
              Generate
            </Button>
            {problem && (
              <>
                <Button variant="outline" size="sm" onClick={handleSubmitCorrect}>
                  <Send className="size-4 mr-1" />
                  Submit Correct
                </Button>
                <Button variant="outline" size="sm" onClick={handleSubmitWrong}>
                  <Send className="size-4 mr-1" />
                  Submit Wrong
                </Button>
              </>
            )}
            {attempts > 0 && (
              <Badge variant="outline">Attempts: {attempts}</Badge>
            )}
          </div>
        </section>

        {problem && (
          <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">Problem Definition</h2>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium">Family: {componentId}</p>
              <p className="text-sm text-slate-600">
                Parts: {Array.isArray((problem as { parts?: unknown[] }).parts) ? (problem as { parts: unknown[] }).parts.length : 'N/A'}
              </p>
            </div>
            <pre className="max-h-48 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(problem, null, 2)}
            </pre>
          </section>
        )}

        {solution && (
          <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Correct Solution</h2>
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
              <Badge className={gradeResult.score === gradeResult.maxScore ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                {gradeResult.score} / {gradeResult.maxScore}
              </Badge>
              {gradeResult.parts && gradeResult.parts.length > 0 && (
                <span className="text-sm text-slate-600">
                  {gradeResult.parts.filter((p) => p.isCorrect).length} correct,{' '}
                  {gradeResult.parts.filter((p) => !p.isCorrect).length} incorrect
                </span>
              )}
            </div>
            <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(gradeResult, null, 2)}
            </pre>
          </section>
        )}

        {envelope && (
          <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">practice.v1 Envelope</h2>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-800">
                {envelope.contractVersion as string}
              </Badge>
              <Badge className="bg-slate-100 text-slate-800">
                {envelope.status as string}
              </Badge>
              <Badge variant="outline">
                Attempt {envelope.attemptNumber as number}
              </Badge>
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(envelope, null, 2)}
            </pre>
          </section>
        )}

        <section className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Variant Testing</h2>
          <p className="text-sm text-slate-600">
            Test multiple random seeds to ensure the family produces varied problems.
          </p>
          <div className="flex flex-wrap gap-2">
            {[100, 200, 300, 400, 500].map((testSeed) => (
              <Button
                key={testSeed}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSeed(testSeed);
                  setProblem(null);
                  setSolution(null);
                  setGradeResult(null);
                  setEnvelope(null);
                }}
              >
                Seed {testSeed}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
