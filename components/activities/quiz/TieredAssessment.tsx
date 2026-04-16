'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateProblemInstance } from '@/lib/curriculum/problem-generator';
import { type Activity } from '@/lib/db/schema/validators';
import { type TieredAssessmentActivityProps } from '@/types/activities';
import {
  buildPracticeSubmissionEnvelope,
  buildPracticeSubmissionParts,
  normalizePracticeValue,
  type PracticeSubmissionCallbackPayload,
} from '@/lib/practice/contract';

export type TieredAssessmentActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'tiered-assessment';
  props: TieredAssessmentActivityProps;
};

export const TIERED_ASSESSMENT_SUPPORTED_MODES = ['assessment'] as const;
const TIERED_ASSESSMENT_DEFAULT_MODE = 'assessment' as const;

interface TieredAssessmentProps {
  activity: TieredAssessmentActivity;
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void;
}

type Question = TieredAssessmentActivityProps['questions'][number];
type ShuffledQuestion = Question & { options: string[] };
type ApplicationProblem = NonNullable<TieredAssessmentActivityProps['applicationProblems']>[number];
type PreparedApplicationProblem = ApplicationProblem & {
  questionText: string;
  correctAnswer: number;
  tolerance: number;
};

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

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

function isCorrectNumericResponse(expected: number, provided: unknown, tolerance: number): boolean {
  if (typeof provided === 'number' && Number.isFinite(provided)) {
    return Math.abs(provided - expected) <= tolerance;
  }

  if (typeof provided !== 'string') {
    return false;
  }

  const normalized = provided.replaceAll(',', '').trim();
  if (!normalized) {
    return false;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return false;
  }

  return Math.abs(parsed - expected) <= tolerance;
}

export function TieredAssessment({ activity, onSubmit }: TieredAssessmentProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const preparedQuestions = useMemo<ShuffledQuestion[]>(() => {
    return activity.props.questions.map((question) => {
      let baseOptions = question.options;
      if (!baseOptions && question.type === 'true-false') {
        baseOptions = ['True', 'False'];
      }

      if (!baseOptions) {
        return { ...question, options: [] };
      }

      return {
        ...question,
        options: sortOptionsDeterministically(question.id, baseOptions),
      };
    });
  }, [activity.props.questions]);

  const preparedApplicationProblems = useMemo<PreparedApplicationProblem[]>(() => {
    const problems = activity.props.applicationProblems ?? [];
    return problems.map((problem) => {
      const generated = generateProblemInstance(
        problem.problemTemplate,
        stableHash(`${activity.id}:${problem.id}`),
      );

      return {
        ...problem,
        questionText: generated.questionText,
        correctAnswer: generated.correctAnswer,
        tolerance: problem.problemTemplate.tolerance ?? 1,
      };
    });
  }, [activity.id, activity.props.applicationProblems]);

  const questionEvaluations = preparedQuestions.map((question) => {
    const answer = selectedAnswers[question.id] ?? '';
    return {
      question,
      answer,
      isCorrect: Boolean(answer) && normalizePracticeValue(answer) === normalizePracticeValue(question.correctAnswer),
    };
  });
  const questionScore = questionEvaluations.reduce(
    (count, evaluation) => (evaluation.isCorrect ? count + 1 : count),
    0,
  );

  const applicationScore = preparedApplicationProblems.reduce((count, problem) => {
    const response = selectedAnswers[problem.id];
    return count + (isCorrectNumericResponse(problem.correctAnswer, response, problem.tolerance) ? 1 : 0);
  }, 0);

  const score = questionScore + applicationScore;
  const totalQuestions = preparedQuestions.length + preparedApplicationProblems.length;
  const percentage = totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100);

  const requiredIds = [
    ...preparedQuestions.map((question) => question.id),
    ...preparedApplicationProblems.map((problem) => problem.id),
  ];

  const answeredCount = requiredIds.reduce((count, itemId) => {
    const value = selectedAnswers[itemId];
    if (typeof value !== 'string' || value.trim() === '') {
      return count;
    }
    return count + 1;
  }, 0);

  const recordResponse = (questionId: string, answer: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    const questionParts = buildPracticeSubmissionParts(selectedAnswers).map((part) => {
      const evaluation = questionEvaluations.find((entry) => entry.question.id === part.partId);
      return {
        ...part,
        isCorrect: evaluation?.isCorrect ?? false,
        score: evaluation?.isCorrect ? 1 : 0,
        maxScore: 1,
      };
    });

    const applicationParts = preparedApplicationProblems.map((problem) => {
      const rawAnswer = selectedAnswers[problem.id] ?? '';
      const isCorrect = isCorrectNumericResponse(problem.correctAnswer, rawAnswer, problem.tolerance);
      return {
        partId: problem.id,
        rawAnswer,
        normalizedAnswer: normalizePracticeValue(rawAnswer),
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
          mode: TIERED_ASSESSMENT_DEFAULT_MODE,
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: new Date(),
          answers: selectedAnswers,
          parts: [...questionParts, ...applicationParts],
          analytics: {
            questionScore,
            applicationScore,
            totalQuestions,
            percentage,
          },
        }),
      );
    } catch (err) {
      console.error('TieredAssessment submission failed:', err);
      setSubmitted(false);
    }
  };

  const resetAssessment = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          {activity.props.title}
          <Badge variant="outline" className="uppercase">
            {TIERED_ASSESSMENT_DEFAULT_MODE.replace('_', ' ')}
          </Badge>
          <Badge variant="secondary" className="uppercase">
            {activity.props.tier}
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
            <span>Demonstrate mastery with tiered items and applied problems</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Save Progress:</span>
            <span>Recorded when you submit</span>
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
                    const showFeedback = submitted && option === selected;
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
                        {showFeedback && optionIsCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {showFeedback && !optionIsCorrect && <XCircle className="h-4 w-4 text-destructive" />}
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

        {preparedApplicationProblems.length > 0 && (
          <section className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Application Problems</h3>
            {preparedApplicationProblems.map((problem, problemIndex) => {
              const selected = selectedAnswers[problem.id] ?? '';
              const isCorrect = isCorrectNumericResponse(problem.correctAnswer, selected, problem.tolerance);

              return (
                <div key={problem.id} className="space-y-2">
                  <p className="font-medium">
                    {preparedQuestions.length + problemIndex + 1}. {problem.prompt}
                  </p>
                  <p className="text-sm text-muted-foreground">{problem.questionText}</p>
                  <Input
                    value={selected}
                    onChange={(event) => recordResponse(problem.id, event.target.value)}
                    placeholder="Enter your numeric answer"
                    inputMode="decimal"
                    disabled={submitted}
                  />
                  {submitted && (
                    <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-destructive'}`}>
                      {isCorrect
                        ? 'Correct'
                        : activity.props.showExplanations
                          ? `Expected answer: ${problem.correctAnswer}`
                          : 'Incorrect'}
                    </p>
                  )}
                </div>
              );
            })}
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm text-muted-foreground">
          <span>
            {answeredCount} of {totalQuestions} answered
          </span>
          <div className="flex gap-2">
            {submitted && activity.props.allowRetry && (
              <Button onClick={resetAssessment} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
            )}
            {!submitted && (
              <Button onClick={handleSubmit} disabled={answeredCount !== totalQuestions}>
                Submit answers
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
