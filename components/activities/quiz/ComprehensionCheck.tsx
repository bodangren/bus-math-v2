'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { type ComprehensionQuizActivityProps } from '@/types/activities';
import { type Activity } from '@/lib/db/schema/validators';
import {
  buildPracticeSubmissionEnvelope,
  buildPracticeSubmissionParts,
  normalizePracticeValue,
  type PracticeSubmissionCallbackPayload,
} from '@/lib/practice/contract';

export type ComprehensionCheckActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'comprehension-quiz';
  props: ComprehensionQuizActivityProps;
};

export const COMPREHENSION_CHECK_SUPPORTED_MODES = [
  'guided_practice',
  'independent_practice',
  'assessment',
] as const;
const COMPREHENSION_CHECK_DEFAULT_MODE = 'assessment' as const;

interface ComprehensionCheckProps {
  activity: ComprehensionCheckActivity;
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void;
}

type Question = ComprehensionQuizActivityProps['questions'][number];

type ShuffledQuestion = Question & { options: string[] };

const stableHash = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const sortOptionsDeterministically = (questionId: string, options: string[]) =>
  [...options]
    .map((option, index) => ({
      option,
      index,
      weight: stableHash(`${questionId}:${option}`),
    }))
    .sort((a, b) => {
      if (a.weight !== b.weight) {
        return a.weight - b.weight;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.option);

export function ComprehensionCheck({ activity, onSubmit }: ComprehensionCheckProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = activity.props.questions;

  const preparedQuestions = useMemo<ShuffledQuestion[]>(() => {
    return questions.map((question) => {
      let baseOptions = question.options;
      if (!baseOptions && question.type === 'true-false') {
        baseOptions = ['True', 'False'];
      }

      if (baseOptions) {
        return {
          ...question,
          options: sortOptionsDeterministically(question.id, baseOptions),
        };
      }

      return {
        ...question,
        options: [],
      };
    });
  }, [questions]);

  const totalQuestions = preparedQuestions.length;
  const questionEvaluations = preparedQuestions.map((question) => {
    const answer = selectedAnswers[question.id];
    const isCorrect =
      Boolean(answer) &&
      normalizePracticeValue(answer) === normalizePracticeValue(question.correctAnswer);

    return {
      question,
      answer: answer ?? '',
      isCorrect,
    };
  });
  const score = questionEvaluations.reduce((count, evaluation) => (evaluation.isCorrect ? count + 1 : count), 0);
  const percentage = totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100);

  const recordResponse = (questionId: string, answer: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);

    const parts = buildPracticeSubmissionParts(selectedAnswers).map((part) => {
      const evaluation = questionEvaluations.find((entry) => entry.question.id === part.partId);
      return {
        ...part,
        isCorrect: evaluation?.isCorrect ?? false,
        score: evaluation?.isCorrect ? 1 : 0,
        maxScore: 1,
      };
    });

    onSubmit?.(
      buildPracticeSubmissionEnvelope({
        activityId: activity.id,
        mode: COMPREHENSION_CHECK_DEFAULT_MODE,
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date(),
        answers: selectedAnswers,
        parts,
        analytics: {
          totalQuestions,
          score,
          percentage,
        },
      }),
    );
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          {activity.props.title}
          <Badge variant="outline" className="uppercase">
            {COMPREHENSION_CHECK_DEFAULT_MODE.replace('_', ' ')}
          </Badge>
          {submitted && (
            <Badge variant={percentage >= 70 ? 'default' : 'destructive'}>
              {score}/{totalQuestions} correct ({percentage}%)
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{activity.props.description ?? activity.description}</CardDescription>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Purpose:</span>
            <span>Check your understanding of key concepts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Time:</span>
            <span>~5 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Save Progress:</span>
            <span>Auto-saved locally</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {preparedQuestions.map((question, questionIndex) => {
          const selected = selectedAnswers[question.id];

          return (
            <div key={question.id} className="space-y-3">
              <p className="text-lg font-semibold">
                {questionIndex + 1}. {question.text}
              </p>

              {question.options.length > 0 ? (
                <div className="grid gap-2">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selected === option;
                    const showCorrect = submitted && option === selected;
                    const optionIsCorrect =
                      normalizePracticeValue(option) === normalizePracticeValue(question.correctAnswer);

                    return (
                      <Button
                        key={`${question.id}-${option}-${optionIndex}`}
                        variant={isSelected ? 'secondary' : 'outline'}
                        className="justify-start text-left h-auto p-4"
                        onClick={() => recordResponse(question.id, option)}
                        disabled={submitted}
                      >
                        <span className="flex-1">{option}</span>
                        {showCorrect && optionIsCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {showCorrect && !optionIsCorrect && <XCircle className="h-4 w-4 text-destructive" />}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <Input
                  value={selected ?? ''}
                  onChange={(event) => recordResponse(question.id, event.target.value)}
                  placeholder="Type your answer"
                  disabled={submitted}
                />
              )}

              {submitted && activity.props.showExplanations && question.explanation && (
                <p className="text-sm text-muted-foreground">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              )}
            </div>
          );
        })}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm text-muted-foreground">
          <span>
            {Object.keys(selectedAnswers).length} of {totalQuestions} answered
          </span>
          <div className="flex gap-2">
            {submitted && activity.props.allowRetry && (
              <Button onClick={resetQuiz} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
            )}
            {!submitted && (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length !== totalQuestions}
              >
                Submit answers
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
