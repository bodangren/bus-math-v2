"use client";

import { useState, useRef, ReactNode } from "react";
import { RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useStudyPreferences,
  useDueTerms,
  useProcessReview,
  useRecordSession,
  getGlossaryTermDisplay,
} from "@/hooks/useStudy";
import { getGlossaryTermBySlug } from "@/lib/study/glossary";

interface BaseReviewSessionProps {
  activityType: "flashcards" | "srs_review";
  renderHeader: (currentIndex: number, totalTerms: number) => ReactNode;
  noTermsTitle: string;
  noTermsMessage: string;
}

export function BaseReviewSession({
  activityType,
  renderHeader,
  noTermsTitle,
  noTermsMessage,
}: BaseReviewSessionProps) {
  const { languageMode } = useStudyPreferences();
  const dueTerms = useDueTerms();
  const processReview = useProcessReview();
  const recordSession = useRecordSession();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const isSubmittingRef = useRef(false);

  const currentTermSlug = dueTerms?.[currentIndex]?.termSlug;
  const currentTerm = currentTermSlug ? getGlossaryTermBySlug(currentTermSlug) : undefined;
  const display = currentTerm ? getGlossaryTermDisplay(currentTerm, languageMode) : { prompt: "", answer: "" };

  if (dueTerms === undefined) {
    return (
      <main className="min-h-screen bg-muted/20 py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl space-y-8">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Loading...</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  const handleRating = async (rating: "again" | "hard" | "good" | "easy") => {
    if (!currentTermSlug || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      await processReview({
        termSlug: currentTermSlug,
        rating,
      });

      if (currentIndex + 1 < (dueTerms?.length ?? 0)) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        setSessionComplete(true);
        await recordSession({
          activityType,
          termCount: dueTerms?.length ?? 0,
        });
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
  };

  if (sessionComplete) {
    return (
      <main className="min-h-screen bg-muted/20 py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl space-y-8">
            <Card>
              <CardHeader className="text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <CardTitle className="text-2xl">Session Complete!</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  You reviewed {dueTerms?.length ?? 0} terms. Great job!
                </p>
                <Button onClick={resetSession} className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Review Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (!currentTerm || dueTerms.length === 0) {
    return (
      <main className="min-h-screen bg-muted/20 py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl space-y-8">
            <Card>
              <CardHeader className="text-center">
                <XCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <CardTitle className="text-2xl">{noTermsTitle}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                 <p className="text-muted-foreground">
                   {noTermsMessage}
                 </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl space-y-8">
          {renderHeader(currentIndex, dueTerms?.length ?? 0)}

          <Card
            className="cursor-pointer min-h-[300px] flex items-center justify-center"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <CardContent className="text-center space-y-4 p-8">
              <p className="text-3xl font-semibold">
                {isFlipped ? display.answer : display.prompt}
              </p>
              {!isFlipped && (
                <p className="text-sm text-muted-foreground">
                  Click to reveal the answer
                </p>
              )}
            </CardContent>
          </Card>

          {isFlipped && (
            <div className="grid grid-cols-2 gap-4">
              <Button variant="destructive" onClick={() => handleRating("again")}>
                Again
              </Button>
              <Button variant="secondary" onClick={() => handleRating("hard")}>
                Hard
              </Button>
              <Button variant="default" onClick={() => handleRating("good")}>
                Good
              </Button>
              <Button variant="outline" onClick={() => handleRating("easy")}>
                Easy
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
