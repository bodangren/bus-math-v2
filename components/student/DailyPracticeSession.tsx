'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/lib/convex/server';
import { practiceFamilyRegistry } from '@/lib/practice/engine/family-registry';
import { buildPracticeSubmissionEnvelope } from '@/lib/practice/contract';
import { processPracticeSubmission } from '@/lib/srs/review-processor';
import { dailyPracticeInputRegistry } from '@/lib/srs/answer-inputs/registry';
import type { SrsCardState } from '@/lib/srs/contract';
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';

interface DailyPracticeSessionProps {
  studentId: string;
}

export function DailyPracticeSession({ studentId }: DailyPracticeSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [sessionCards, setSessionCards] = useState<SrsCardState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const submittedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const dueCards = useQuery(api.srs.getDueCards, { studentId });
  const recordReview = useMutation(api.srs.recordSrsReview);

  useEffect(() => {
    if (dueCards && dueCards.length > 0 && sessionCards.length === 0) {
      setSessionCards(dueCards.slice(0, 10));
    }
    if (dueCards && dueCards.length === 0) {
      setCompleted(true);
    }
  }, [dueCards, sessionCards.length]);

  const currentCard = sessionCards[currentIndex];

  if (!dueCards) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading your practice queue...</div>
      </div>
    );
  }

  if (completed || sessionCards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">No Problems Due</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Great work! You have no practice problems due right now.
              Check back later for more review.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const familyKey = currentCard.problemFamilyId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const family = (practiceFamilyRegistry as any)[familyKey];

  if (!family) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Unknown practice family: {familyKey}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (envelope: PracticeSubmissionEnvelope) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);

    const timing = envelope.timing ? {
      startedAt: envelope.timing.startedAt,
      submittedAt: envelope.timing.submittedAt,
      wallClockMs: envelope.timing.wallClockMs,
      activeMs: envelope.timing.activeMs,
      idleMs: envelope.timing.idleMs,
      pauseCount: envelope.timing.pauseCount,
      focusLossCount: envelope.timing.focusLossCount,
      visibilityHiddenCount: envelope.timing.visibilityHiddenCount,
      confidence: envelope.timing.confidence,
      confidenceReasons: envelope.timing.confidenceReasons,
    } : undefined;

    const result = processPracticeSubmission(envelope, currentCard, timing, undefined, studentId);

    try {
      await recordReview({
        studentId: studentId as Parameters<typeof recordReview>[0]['studentId'],
        problemFamilyId: result.card.problemFamilyId,
        rating: result.rating,
        scheduledAt: result.reviewLog.scheduledAt,
        reviewedAt: result.reviewLog.reviewedAt,
        elapsedDays: result.reviewLog.elapsedDays,
        scheduledDays: result.reviewLog.scheduledDays,
        reviewDurationMs: result.reviewLog.reviewDurationMs,
        timingConfidence: result.reviewLog.timingConfidence,
        card: result.card.card,
        due: result.card.due,
        lastReview: result.card.lastReview,
        reviewCount: result.card.reviewCount,
      });
      setShowNext(true);
    } catch {
      submittedRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvance = () => {
    setShowNext(false);
    submittedRef.current = false;
    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
    setTimeout(() => {
      cardRef.current?.focus();
    }, 0);
  };

  const seed = currentCard.reviewCount + 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const problemDef = (family as any).generate(seed, undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const problemResponse = (family as any).solve(problemDef);
  const AnswerInputComponent = dailyPracticeInputRegistry[familyKey];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Practice</h1>
          <p className="text-muted-foreground text-sm">
            Problem {currentIndex + 1} of {sessionCards.length}
          </p>
        </div>
        <Badge variant="outline">
          {sessionCards.length - currentIndex - 1} remaining
        </Badge>
      </div>

      <Card ref={cardRef} tabIndex={-1} data-testid="practice-card" className="mb-4 outline-none">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {familyKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {isSubmitting && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 rounded">
              <div className="text-muted-foreground font-medium">Saving result...</div>
            </div>
          )}
          {AnswerInputComponent ? (
            <AnswerInputComponent
              family={family}
              definition={problemDef}
              onSubmit={handleSubmit}
            />
          ) : (
            <ProblemRenderer
              familyKey={familyKey}
              family={family}
              definition={problemDef}
              response={problemResponse}
              onSubmit={handleSubmit}
            />
          )}
          {showNext && (
            <div className="mt-6 pt-4 border-t">
              <Button onClick={handleAdvance} className="w-full" data-testid="next-problem-button">
                Next Problem
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProblemRenderer({
  familyKey,
  family,
  definition,
  response,
  onSubmit,
}: {
  familyKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  family: any;
  definition: unknown;
  response: unknown;
  onSubmit: (envelope: PracticeSubmissionEnvelope) => void;
}) {
  const submittedRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [gradeResult, setGradeResult] = useState<{ parts: Array<{ partId: string; rawAnswer?: unknown; isCorrect?: boolean }> } | null>(null);

  const handleGrade = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (family as any).grade(definition, response);
    setGradeResult(result);
    const envelope = buildPracticeSubmissionEnvelope({
      activityId: familyKey,
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      answers: {},
      parts: result.parts.map((p: { partId: string; rawAnswer?: unknown; isCorrect?: boolean }) => ({
        partId: p.partId,
        rawAnswer: p.rawAnswer ?? null,
        isCorrect: p.isCorrect,
      })),
    });
    onSubmit(envelope);
  };

  const renderDef = (def: unknown, path: string = ''): React.ReactNode => {
    if (def === null || def === undefined) return null;
    if (typeof def === 'string' || typeof def === 'number' || typeof def === 'boolean') {
      return <span key={path} className="font-mono bg-muted px-1 rounded">{String(def)}</span>;
    }
    if (Array.isArray(def)) {
      return (
        <ul key={path} className="list-disc pl-6 space-y-1">
          {def.map((item, i) => (
            <li key={`${path}-${i}`}>{renderDef(item, `${path}-${i}`)}</li>
          ))}
        </ul>
      );
    }
    if (typeof def === 'object') {
      return (
        <div key={path} className="space-y-2">
          {Object.entries(def as Record<string, unknown>).map(([key, value]) => (
            <div key={`${path}-${key}`} className="flex gap-2">
              <span className="font-medium text-muted-foreground">{key}:</span>
              <div>{renderDef(value, `${path}-${key}`)}</div>
            </div>
          ))}
        </div>
      );
    }
    return <span key={path}>{String(def)}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 text-sm text-muted-foreground">Problem</h3>
        {renderDef(definition)}
      </div>

      {submitted && gradeResult ? (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium mb-2 text-sm text-muted-foreground">Result</h3>
          <div className="space-y-1">
            {gradeResult.parts.map((p, i) => (
              <div key={i} className={`text-sm ${p.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {p.partId}: {p.isCorrect ? 'Correct' : 'Incorrect'}
              </div>
            ))}
          </div>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-background p-3 rounded border mt-2">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button onClick={handleGrade} className="flex-1">
            Submit Answer
          </Button>
        </div>
      )}
    </div>
  );
}