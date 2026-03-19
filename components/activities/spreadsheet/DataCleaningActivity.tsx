'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle, Lightbulb, RotateCcw } from 'lucide-react';

import { buildPracticeSubmissionEnvelope, buildPracticeSubmissionParts, type PracticeSubmissionCallbackPayload } from '@/lib/practice/contract';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpreadsheetWrapper, type SpreadsheetData } from '@/components/activities/spreadsheet/SpreadsheetWrapper';

export const DATA_CLEANING_SUPPORTED_MODES = ['guided_practice', 'independent_practice'] as const;
const DATA_CLEANING_DEFAULT_MODE = 'guided_practice' as const;

interface DataCleaningActivityProps {
  activityId?: string;
  title: string;
  description: string;
  messyData: SpreadsheetData;
  cleanData: SpreadsheetData;
  cleaningSteps: string[];
  onComplete?: () => void;
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void;
}

export function DataCleaningActivity({
  title,
  description,
  messyData,
  cleanData,
  cleaningSteps,
  activityId,
  onComplete,
  onSubmit,
}: DataCleaningActivityProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showClean, setShowClean] = useState(false);
  const [userProgress, setUserProgress] = useState<boolean[]>(new Array(cleaningSteps.length).fill(false));
  const [submitted, setSubmitted] = useState(false);

  const completedSteps = userProgress.filter(Boolean).length;
  const progressPercentage = cleaningSteps.length === 0 ? 0 : (completedSteps / cleaningSteps.length) * 100;

  const handleStepComplete = (stepIndex: number) => {
    const nextProgress = [...userProgress];
    nextProgress[stepIndex] = true;
    setUserProgress(nextProgress);

    const isFinalStep = stepIndex === cleaningSteps.length - 1;
    if (!isFinalStep) {
      return;
    }

    setShowClean(true);
    setSubmitted(true);

    const nextAnswers = Object.fromEntries(
      cleaningSteps.map((step, index) => [
        `step-${index + 1}`,
        {
          step,
          completed: nextProgress[index],
          order: index + 1,
        },
      ]),
    );

    const parts = buildPracticeSubmissionParts(nextAnswers).map((part, index) => ({
      ...part,
      isCorrect: nextProgress[index],
      score: nextProgress[index] ? 1 : 0,
      maxScore: 1,
    }));

    const payload = buildPracticeSubmissionEnvelope({
      activityId: activityId ?? `${title}-${description}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      mode: DATA_CLEANING_DEFAULT_MODE,
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date(),
      answers: nextAnswers,
      parts,
      artifact: {
        kind: 'data_cleaning',
        title,
        description,
        messyData,
        cleanData,
        cleaningSteps,
        completedSteps: nextProgress.reduce((count, value) => count + (value ? 1 : 0), 0),
      },
      analytics: {
        completedSteps: nextProgress.filter(Boolean).length,
        totalSteps: cleaningSteps.length,
      },
    });

    if (onSubmit) {
      onSubmit(payload);
    } else {
      onComplete?.();
    }
  };

  const resetExercise = () => {
    setCurrentStep(0);
    setShowClean(false);
    setUserProgress(new Array(cleaningSteps.length).fill(false));
    setSubmitted(false);
  };

  const nextStep = () => {
    if (currentStep < cleaningSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <Card className="border-blue-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <p className="mt-2 text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="uppercase">
                {DATA_CLEANING_DEFAULT_MODE.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary">
                Step {currentStep + 1} of {cleaningSteps.length}
              </Badge>
              <Badge variant="outline">
                {completedSteps}/{cleaningSteps.length} complete
              </Badge>
            </div>
          </div>
          <div className="w-full">
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-sky-600 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 border-t pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">Purpose:</span>
              <span>Clean messy data and reveal the finished snapshot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Mode:</span>
              <span>Guided practice shell with stepwise evidence</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-800">Messy Data</CardTitle>
            <p className="text-sm text-red-600">Source data before cleaning</p>
          </CardHeader>
          <CardContent>
            <SpreadsheetWrapper
              initialData={messyData}
              readOnly
              className="overflow-hidden rounded-lg border border-red-200"
            />
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
              <Lightbulb className="h-5 w-5" />
              Current Step
            </CardTitle>
            <p className="text-sm text-blue-700">
              {cleaningSteps[currentStep]}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-white p-4 text-sm text-blue-900">
              Focus on this cleaning rule and decide what it changes in the source data.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 0}>
                Previous
              </Button>
              <Button onClick={() => handleStepComplete(currentStep)} disabled={userProgress[currentStep]} size="sm">
                {userProgress[currentStep] ? (
                  <>
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Complete
                  </>
                ) : (
                  'Mark Complete'
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={nextStep} disabled={currentStep === cleaningSteps.length - 1}>
                Next
              </Button>
            </div>

            <div className="rounded-lg border border-blue-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Step checklist</h3>
              <div className="mt-3 space-y-2">
                {cleaningSteps.map((step, index) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2 rounded-md border p-2 text-sm ${
                      userProgress[index]
                        ? 'border-green-200 bg-green-50'
                        : index === currentStep
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 ${
                      userProgress[index]
                        ? 'border-green-600 bg-green-600'
                        : index === currentStep
                          ? 'border-blue-600'
                          : 'border-slate-300'
                    }`} />
                    <span className={userProgress[index] ? 'text-green-800' : index === currentStep ? 'text-blue-800' : 'text-slate-600'}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-800">
              {showClean ? (
                <>
                  Clean Data
                  <ArrowRight className="ml-2 inline-block h-4 w-4" />
                </>
              ) : (
                'Target Snapshot'
              )}
            </CardTitle>
            <p className="text-sm text-green-600">
              {showClean
                ? 'This is the cleaned output after all steps are complete.'
                : 'Complete all steps to reveal the cleaned output.'}
            </p>
          </CardHeader>
          <CardContent>
            {showClean ? (
              <SpreadsheetWrapper
                initialData={cleanData}
                readOnly
                className="overflow-hidden rounded-lg border border-green-200"
              />
            ) : (
              <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
                <div className="space-y-2 text-slate-500">
                  <Lightbulb className="mx-auto h-8 w-8 opacity-50" />
                  <p>Complete the cleaning steps</p>
                  <p className="text-sm">to reveal the clean snapshot</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {submitted
            ? 'Submission recorded as canonical practice evidence.'
            : `Progress: ${completedSteps}/${cleaningSteps.length} cleaning steps completed`}
        </div>
        <Button variant="outline" onClick={resetExercise}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Exercise
        </Button>
      </div>
    </div>
  );
}
