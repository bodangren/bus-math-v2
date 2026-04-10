"use client";

import { useState, useEffect, useMemo } from "react";
import { RotateCcw, Timer, Heart, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudyPreferences, useRecordSession, getGlossaryTermDisplay } from "@/hooks/useStudy";
import { getGlossaryTermsByUnit, GLOSSARY } from "@/lib/study/glossary";
import { shuffleArray } from "@/lib/study/utils";
import { useSearchParams } from "next/navigation";

type SpeedRoundQuestion = {
  term: string;
  correctDefinition: string;
  options: string[];
  termSlug: string;
};

export function SpeedRoundGame() {
  const { languageMode } = useStudyPreferences();
  const recordSession = useRecordSession();
  const searchParams = useSearchParams();
  const unitParam = searchParams.get("unit");

  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameOver">("playing");
  const [answeredTerms, setAnsweredTerms] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const terms = useMemo(() => {
    let availableTerms = unitParam
      ? getGlossaryTermsByUnit(parseInt(unitParam, 10))
      : GLOSSARY;
    if (availableTerms.length < 4) {
      availableTerms = GLOSSARY;
    }
    return availableTerms;
  }, [unitParam]);

  const generateQuestion = useMemo(() => {
    return (excludeTerms: Set<string>) => {
      const availableTerms = terms.filter((t) => !excludeTerms.has(t.slug));
      let useTerms = availableTerms;
      let exclude = excludeTerms;
      if (useTerms.length === 0) {
        exclude = new Set();
        useTerms = terms;
      }
      const term = shuffleArray(useTerms)[0];
      const display = getGlossaryTermDisplay(term, languageMode);
      const correctDef = display.answer;
      const otherDefs = terms
        .filter((t) => t.slug !== term.slug)
        .map((t) => getGlossaryTermDisplay(t, languageMode).answer);
      const distractors = shuffleArray(otherDefs).slice(0, 3);
      const options = shuffleArray([correctDef, ...distractors]);
      return {
        term: display.prompt,
        correctDefinition: correctDef,
        options,
        termSlug: term.slug,
        newExcludeTerms: exclude,
      };
    };
  }, [terms, languageMode]);

  const [currentQuestion, setCurrentQuestion] = useState<SpeedRoundQuestion | null>(() => {
    const initialQuestion = generateQuestion(new Set());
    return {
      term: initialQuestion.term,
      correctDefinition: initialQuestion.correctDefinition,
      options: initialQuestion.options,
      termSlug: initialQuestion.termSlug,
    };
  });

  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("gameOver");
          recordSession({
            activityType: "speed_round",
            correctCount: correctAnswers,
            totalCount: totalQuestions,
            maxStreak,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, correctAnswers, totalQuestions, maxStreak, recordSession]);

  const handleAnswer = (selectedOption: string) => {
    if (!currentQuestion || feedback) return;
    setTotalQuestions((prev) => prev + 1);
    if (selectedOption === currentQuestion.correctDefinition) {
      setCorrectAnswers((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        setMaxStreak((max) => Math.max(max, newStreak));
        return newStreak;
      });
      setFeedback("correct");
      const newExclude = new Set([...answeredTerms, currentQuestion.termSlug]);
      setAnsweredTerms(newExclude);
      setTimeout(() => {
        setFeedback(null);
        const question = generateQuestion(newExclude);
        setCurrentQuestion({
          term: question.term,
          correctDefinition: question.correctDefinition,
          options: question.options,
          termSlug: question.termSlug,
        });
        if (question.newExcludeTerms.size !== newExclude.size) {
          setAnsweredTerms(question.newExcludeTerms);
        }
      }, 800);
    } else {
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState("gameOver");
          recordSession({
            activityType: "speed_round",
            correctCount: correctAnswers,
            totalCount: totalQuestions + 1,
            maxStreak,
          });
        }
        return newLives;
      });
      setStreak(0);
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        const question = generateQuestion(answeredTerms);
        setCurrentQuestion({
          term: question.term,
          correctDefinition: question.correctDefinition,
          options: question.options,
          termSlug: question.termSlug,
        });
        if (question.newExcludeTerms.size !== answeredTerms.size) {
          setAnsweredTerms(question.newExcludeTerms);
        }
      }, 800);
    }
  };

  const resetGame = () => {
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setTimeLeft(90);
    setGameState("playing");
    setAnsweredTerms(new Set());
    setFeedback(null);
    const question = generateQuestion(new Set());
    setCurrentQuestion({
      term: question.term,
      correctDefinition: question.correctDefinition,
      options: question.options,
      termSlug: question.termSlug,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (gameState === "gameOver") {
    return (
      <main className="min-h-screen bg-muted/20 py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl space-y-8">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Game Over!</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Correct</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{correctAnswers}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{totalQuestions}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <p className="text-lg">Max Streak: {maxStreak}</p>
                </div>
                <Button onClick={resetGame} className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
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
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Speed Round</h1>
              <p className="text-sm text-muted-foreground">Answer as many questions as you can!</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Lives: {lives}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
          </header>

          <div className="flex items-center justify-between text-sm">
            <p>Streak: {streak}</p>
            <p>Correct: {correctAnswers}/{totalQuestions}</p>
          </div>

          {currentQuestion && (
            <Card className={feedback === "correct" ? "border-emerald-300 bg-emerald-50" : feedback === "wrong" ? "border-red-300 bg-red-50" : ""}>
              <CardHeader>
                <CardTitle className="text-xl">{currentQuestion.term}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => handleAnswer(option)}
                    disabled={!!feedback}
                  >
                    {option}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button variant="outline" onClick={resetGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Game
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}