'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lightbulb, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { type FillInTheBlankActivityProps } from '@/types/activities';
import { type Activity } from '@/lib/db/schema/validators';
import {
  buildPracticeSubmissionEnvelope,
  buildPracticeSubmissionParts,
  normalizePracticeValue,
  type PracticeSubmissionCallbackPayload,
} from '@/lib/practice/contract';

export type FillInTheBlankActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'fill-in-the-blank';
  props: FillInTheBlankActivityProps;
};

export const FILL_IN_THE_BLANK_SUPPORTED_MODES = [
  'guided_practice',
  'independent_practice',
  'assessment',
] as const;

interface FillInTheBlankProps {
  activity: FillInTheBlankActivity;
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void;
}

interface SentenceState {
  sentenceId: string;
  answer: string;
  isCorrect: boolean;
}

function createDeterministicOrder(words: string[], seed: string): string[] {
  return [...words].sort((a, b) => {
    const scoreA = `${seed}:${a}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const scoreB = `${seed}:${b}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (scoreA === scoreB) {
      return a.localeCompare(b);
    }
    return scoreA - scoreB;
  });
}

export function FillInTheBlank({ activity, onSubmit }: FillInTheBlankProps) {
  const { sentences, showWordList, randomizeWordOrder, showHints } = activity.props;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sentenceStates, setSentenceStates] = useState<SentenceState[]>([]);
  const [hintsEnabled, setHintsEnabled] = useState(showHints);
  const practiceMode = showHints || showWordList ? 'guided_practice' : 'independent_practice';

  useEffect(() => {
    setAnswers({});
    setSentenceStates([]);
    setSubmitted(false);
  }, [sentences]);

  const wordBank = useMemo(() => {
    if (!showWordList) return [];
    const baseWords = sentences.flatMap((sentence) => [sentence.answer, ...(sentence.alternativeAnswers ?? [])]);
    const uniqueWords = Array.from(new Set(baseWords));
    if (!randomizeWordOrder) {
      return uniqueWords;
    }

    // Avoid hydration mismatches by using deterministic order for SSR+CSR.
    return createDeterministicOrder(uniqueWords, activity.id);
  }, [activity.id, sentences, showWordList, randomizeWordOrder]);

  const handleSubmit = () => {
    const updatedStates: SentenceState[] = sentences.map((sentence) => {
      const userAnswer = answers[sentence.id] ?? '';
      const acceptedAnswers = [sentence.answer, ...(sentence.alternativeAnswers ?? [])].map(normalizePracticeValue);
      return {
        sentenceId: sentence.id,
        answer: userAnswer,
        isCorrect: acceptedAnswers.includes(normalizePracticeValue(userAnswer)),
      };
    });

    setSentenceStates(updatedStates);

    const correct = updatedStates.filter((state) => state.isCorrect).length;

    const parts = buildPracticeSubmissionParts(answers).map((part) => {
      const evaluation = updatedStates.find((state) => state.sentenceId === part.partId);
      const isCorrect = Boolean(evaluation?.isCorrect);
      return {
        ...part,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
      };
    });

    try {
      setSubmitted(true);
      onSubmit?.(
        buildPracticeSubmissionEnvelope({
          activityId: activity.id,
          mode: practiceMode,
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: new Date(),
          answers,
          parts,
          analytics: {
            correctCount: correct,
            totalSentences: sentences.length,
            wordListVisible: showWordList,
            randomizedWordOrder: randomizeWordOrder,
            hintsVisible: hintsEnabled,
          },
        }),
      );
    } catch (err) {
      console.error('FillInTheBlank submission failed:', err);
      setSubmitted(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setSentenceStates([]);
    setSubmitted(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          {activity.props.title}
          <Badge variant="outline" className="uppercase">
            {practiceMode.replace('_', ' ')}
          </Badge>
        </CardTitle>
        <CardDescription>{activity.props.description ?? activity.description}</CardDescription>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Purpose:</span>
            <span>Practice key vocabulary and concepts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Time:</span>
            <span>~3 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Save Progress:</span>
            <span>Auto-saved locally</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <label className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                checked={hintsEnabled}
                onChange={() => setHintsEnabled((prev) => !prev)}
                className="h-4 w-4"
              />
              Show hints
            </label>
          </div>
          {submitted && (
            <Badge variant="outline">
              Score: {sentenceStates.filter((state) => state.isCorrect).length}/{sentences.length}
            </Badge>
          )}
        </div>

        {showWordList && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Word bank</p>
            <div className="flex flex-wrap gap-2">
              {wordBank.map((word) => (
                <Badge key={word} variant="secondary">
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {sentences.map((sentence) => {
            const state = sentenceStates.find((entry) => entry.sentenceId === sentence.id);
            const isCorrect = state?.isCorrect;
            const hasAnswer = Boolean(answers[sentence.id]);

            return (
              <div key={sentence.id} className="space-y-2">
                <p className="text-base">
                  {sentence.text.replace('{blank}', '_____')}
                </p>
                <Input
                  value={answers[sentence.id] ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    setAnswers((prev) => ({ ...prev, [sentence.id]: value }));
                  }}
                  placeholder="Type your answer"
                  disabled={submitted && isCorrect}
                  className={submitted ? (isCorrect ? 'border-green-500' : 'border-destructive') : undefined}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{(answers[sentence.id] ?? '').length} characters</span>
                  {submitted && isCorrect && <span className="text-green-600">Correct</span>}
                  {submitted && hasAnswer && !isCorrect && <span className="text-destructive">Try again</span>}
                </div>
                {hintsEnabled && sentence.hint && (
                  <p className="text-sm text-muted-foreground">Hint: {sentence.hint}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          {submitted ? (
            <Button onClick={reset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== sentences.length}>
              Check answers
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
