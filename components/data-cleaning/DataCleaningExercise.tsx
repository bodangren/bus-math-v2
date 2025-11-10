'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpreadsheetWrapper, type SpreadsheetData } from '@/components/spreadsheet/SpreadsheetWrapper';
import { CheckCircle, RotateCcw, Lightbulb, ArrowRight } from 'lucide-react';

interface DataCleaningExerciseProps {
  title: string;
  description: string;
  messyData: SpreadsheetData;
  cleanData: SpreadsheetData;
  cleaningSteps: string[];
  onComplete?: () => void;
}

export default function DataCleaningExercise({
  title,
  description,
  messyData,
  cleanData,
  cleaningSteps,
  onComplete
}: DataCleaningExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showClean, setShowClean] = useState(false);
  const [userProgress, setUserProgress] = useState<boolean[]>(new Array(cleaningSteps.length).fill(false));

  const handleStepComplete = (stepIndex: number) => {
    const newProgress = [...userProgress];
    newProgress[stepIndex] = true;
    setUserProgress(newProgress);

    if (stepIndex === cleaningSteps.length - 1) {
      setShowClean(true);
      onComplete?.();
    }
  };

  const resetExercise = () => {
    setCurrentStep(0);
    setShowClean(false);
    setUserProgress(new Array(cleaningSteps.length).fill(false));
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

  const completedSteps = userProgress.filter(Boolean).length;
  const progressPercentage = (completedSteps / cleaningSteps.length) * 100;

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="text-muted-foreground mt-2">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Step {currentStep + 1} of {cleaningSteps.length}
            </Badge>
            <Badge variant="secondary">
              {completedSteps}/{cleaningSteps.length} Complete
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Step Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Current Step: {cleaningSteps[currentStep]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-blue-700">
                Focus on this data cleaning technique. Look at the messy data and think about how this step would improve it.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handleStepComplete(currentStep)}
                  disabled={userProgress[currentStep]}
                  size="sm"
                >
                  {userProgress[currentStep] ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextStep}
                  disabled={currentStep === cleaningSteps.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messy Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                🚨 Messy Data (Before)
              </CardTitle>
              <p className="text-red-600 text-sm">
                This is the raw, problematic data that needs cleaning
              </p>
            </CardHeader>
            <CardContent>
              <SpreadsheetWrapper
                initialData={messyData}
                readOnly={true}
                className="border border-red-200"
              />
            </CardContent>
          </Card>

          {/* Clean Data - Show after completion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                {showClean ? (
                  <>
                    ✅ Clean Data (After)
                    <ArrowRight className="h-4 w-4 mx-2" />
                  </>
                ) : (
                  <>
                    🎯 Target: Clean Data
                  </>
                )}
              </CardTitle>
              <p className="text-green-600 text-sm">
                {showClean
                  ? "Congratulations! This is how the data looks after proper cleaning."
                  : "Complete all steps to see the cleaned data"
                }
              </p>
            </CardHeader>
            <CardContent>
              {showClean ? (
                <SpreadsheetWrapper
                  initialData={cleanData}
                  readOnly={true}
                  className="border border-green-200"
                />
              ) : (
                <div className="h-48 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Complete all cleaning steps</p>
                    <p className="text-sm">to reveal the clean data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Step Checklist */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Data Cleaning Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cleaningSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-3 rounded-lg border ${
                    userProgress[index]
                      ? 'border-green-300 bg-green-100'
                      : index === currentStep
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`flex-shrink-0 ${
                    userProgress[index]
                      ? 'text-green-600'
                      : index === currentStep
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}>
                    {userProgress[index] ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-current" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    userProgress[index]
                      ? 'text-green-800'
                      : index === currentStep
                      ? 'text-blue-800'
                      : 'text-gray-600'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={resetExercise}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Exercise
          </Button>

          {showClean && (
            <Button
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Exercise Complete!
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
