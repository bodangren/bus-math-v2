"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PracticeTestEngine from "@/components/student/PracticeTestEngine";
import { getUnitConfig } from "@/lib/practice-tests/question-banks";
import { useSavePracticeTestResult, useRecordSession } from "@/hooks/useStudy";
import { useRef } from "react";

interface PracticeTestPageProps {
  unitNumber: number;
}

export function PracticeTestPage({ unitNumber }: PracticeTestPageProps) {
  const unitConfig = getUnitConfig(unitNumber);
  const savePracticeTestResult = useSavePracticeTestResult();
  const recordSession = useRecordSession();
  const startedAtRef = useRef<number>(Date.now());

  if (!unitConfig) {
    notFound();
  }

  const handleTestComplete = async (result: {
    unitNumber: number;
    lessonsTested: string[];
    questionCount: number;
    score: number;
    perLessonBreakdown: Array<{
      lessonId: string;
      correct: number;
      total: number;
    }>;
  }) => {
    try {
      await Promise.all([
        savePracticeTestResult(result),
        recordSession({
          activityType: "practice_test",
          curriculumScope: {
            type: "unit",
            unitNumber: result.unitNumber,
          },
          results: {
            itemsSeen: result.questionCount,
            itemsCorrect: result.score,
            itemsIncorrect: result.questionCount - result.score,
            durationSeconds: Math.floor((Date.now() - startedAtRef.current) / 1000),
          },
          startedAt: startedAtRef.current,
          endedAt: Date.now(),
        }),
      ]);
    } catch (error) {
      console.error("Failed to save practice test result:", error);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-6">
      <div className="container mx-auto px-4 mb-6">
        <Button variant="secondary" asChild>
          <Link href="/student/study/practice-tests">Back to Practice Tests</Link>
        </Button>
      </div>
      <PracticeTestEngine unitConfig={unitConfig} onComplete={handleTestComplete} />
    </div>
  );
}
