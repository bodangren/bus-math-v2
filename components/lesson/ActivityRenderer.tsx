'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { getActivityComponent } from '@/lib/activities/registry';
import type { Activity } from '@/lib/db/schema/validators';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityRendererProps {
  activityId: string;
  required?: boolean;
}

interface ActivitySubmissionPayload {
  activityId?: string;
  answers?: Record<string, unknown>;
  responses?: Record<string, unknown>;
  interactionHistory?: unknown[];
  metadata?: Record<string, unknown>;
}

interface AssessmentResponse {
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
}

/**
 * ActivityRenderer fetches an activity from the database by ID
 * and renders it using the activity registry.
 */
export function ActivityRenderer({ activityId, required = false }: ActivityRendererProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<AssessmentResponse | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true);
        setError(null);

        // Fetch activity from API
        const response = await fetch(`/api/activities/${activityId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch activity: ${response.statusText}`);
        }

        const data = await response.json();
        setActivity(data);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [activityId]);

  useEffect(() => {
    setSubmissionResult(null);
    setSubmissionError(null);
    setSubmitting(false);
  }, [activityId]);

  const handleAssessmentSubmit = useCallback(
    async (payload: ActivitySubmissionPayload) => {
      if (!activity || !activity.gradingConfig?.autoGrade) {
        return;
      }

      const answers = payload.answers ?? payload.responses;
      if (
        !answers ||
        typeof answers !== 'object' ||
        Array.isArray(answers) ||
        Object.keys(answers).length === 0
      ) {
        setSubmissionError('Please complete the assessment before submitting.');
        setSubmissionResult(null);
        return;
      }

      setSubmitting(true);
      setSubmissionError(null);
      setSubmissionResult(null);

      try {
        const response = await fetch('/api/progress/assessment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activityId: payload.activityId ?? activity.id,
            answers,
            interactionHistory: payload.interactionHistory,
            metadata: payload.metadata,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? 'Unable to submit assessment');
        }

        setSubmissionResult({
          score: data.score,
          maxScore: data.maxScore,
          percentage: data.percentage,
          feedback: data.feedback,
        });
      } catch (submitError) {
        setSubmissionResult(null);
        setSubmissionError(
          submitError instanceof Error
            ? submitError.message
            : 'Unable to submit assessment',
        );
      } finally {
        setSubmitting(false);
      }
    },
    [activity],
  );

  if (loading) {
    return (
      <Card className="my-4">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !activity) {
    return (
      <Card className="my-4 border-red-200 bg-red-50">
        <CardContent className="py-4">
          <p className="text-red-700">
            Failed to load activity: {error || 'Activity not found'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const ActivityComponent = getActivityComponent(activity.componentKey);

  if (!ActivityComponent) {
    return (
      <Card className="my-4 border-yellow-200 bg-yellow-50">
        <CardContent className="py-4">
          <p className="text-yellow-700">
            Activity component not found: {activity.componentKey}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{activity.displayName}</CardTitle>
          {required && (
            <Badge variant="destructive">Required</Badge>
          )}
        </div>
        {activity.description && (
          <p className="text-sm text-muted-foreground">{activity.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ActivityComponent
          activity={activity}
          onSubmit={activity.gradingConfig?.autoGrade ? handleAssessmentSubmit : undefined}
        />
        {submitting && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Submitting answers…</AlertTitle>
            <AlertDescription>
              <p>We&apos;re recording your work and calculating your score.</p>
            </AlertDescription>
          </Alert>
        )}
        {submissionResult && (
          <Alert>
            <AlertTitle>Assessment submitted</AlertTitle>
            <AlertDescription>
              <p>
                Score: {submissionResult.score}/{submissionResult.maxScore} ({submissionResult.percentage}%)
              </p>
              {submissionResult.feedback && <p>{submissionResult.feedback}</p>}
            </AlertDescription>
          </Alert>
        )}
        {submissionError && !submitting && (
          <Alert variant="destructive">
            <AlertTitle>Submission failed</AlertTitle>
            <AlertDescription>
              <p>{submissionError}</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
