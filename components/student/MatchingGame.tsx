"use client";

import { useState, useEffect, useMemo } from "react";
import { RotateCcw, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudyPreferences, useRecordSession, getGlossaryTermDisplay } from "@/hooks/useStudy";
import { getGlossaryTermsByUnit, GLOSSARY } from "@/lib/study/glossary";
import { shuffleArray } from "@/lib/study/utils";
import { useSearchParams } from "next/navigation";

type CardItem = {
  id: string;
  content: string;
  pairId: string;
  type: "term" | "definition";
};

type MatchState = "idle" | "selected" | "matched" | "wrong";

export function MatchingGame() {
  const { languageMode } = useStudyPreferences();
  const recordSession = useRecordSession();
  const searchParams = useSearchParams();
  const unitParam = searchParams.get("unit");

  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<Set<string>>(new Set());
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  const terms = useMemo(() => {
    let availableTerms = unitParam
      ? getGlossaryTermsByUnit(parseInt(unitParam, 10))
      : GLOSSARY;
    if (availableTerms.length < 6) {
      availableTerms = GLOSSARY;
    }
    return shuffleArray(availableTerms).slice(0, 6);
  }, [unitParam]);

  useEffect(() => {
    const termCards: CardItem[] = terms.map((term) => {
      const display = getGlossaryTermDisplay(term, languageMode);
      return {
        id: `term-${term.slug}`,
        content: display.prompt,
        pairId: term.slug,
        type: "term",
      };
    });
    const defCards: CardItem[] = terms.map((term) => {
      const display = getGlossaryTermDisplay(term, languageMode);
      return {
        id: `def-${term.slug}`,
        content: display.answer,
        pairId: term.slug,
        type: "definition",
      };
    });
    setCards(shuffleArray([...termCards, ...defCards]));
    setMatchedPairs(new Set());
    setSelectedCard(null);
    setWrongPair(new Set());
    setGameComplete(false);
    setStartTime(Date.now());
  }, [terms, languageMode]);

  useEffect(() => {
    if (gameComplete) return;
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, gameComplete]);

  const getCardState = (card: CardItem): MatchState => {
    if (matchedPairs.has(card.pairId)) return "matched";
    if (wrongPair.has(card.id)) return "wrong";
    if (selectedCard?.id === card.id) return "selected";
    return "idle";
  };

  const handleCardClick = (card: CardItem) => {
    if (matchedPairs.has(card.pairId)) return;
    if (wrongPair.size > 0) return;

    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    if (selectedCard.pairId === card.pairId) {
      const newMatched = new Set(matchedPairs);
      newMatched.add(card.pairId);
      setMatchedPairs(newMatched);
      setSelectedCard(null);

      if (newMatched.size === terms.length) {
        setGameComplete(true);
        recordSession({
          activityType: "matching_game",
          termCount: terms.length,
        });
      }
    } else {
      const wrong = new Set<string>();
      wrong.add(selectedCard.id);
      wrong.add(card.id);
      setWrongPair(wrong);
      setSelectedCard(null);
      setTimeout(() => {
        setWrongPair(new Set());
      }, 800);
    }
  };

  const resetGame = () => {
    const termCards: CardItem[] = terms.map((term) => {
      const display = getGlossaryTermDisplay(term, languageMode);
      return {
        id: `term-${term.slug}`,
        content: display.prompt,
        pairId: term.slug,
        type: "term",
      };
    });
    const defCards: CardItem[] = terms.map((term) => {
      const display = getGlossaryTermDisplay(term, languageMode);
      return {
        id: `def-${term.slug}`,
        content: display.answer,
        pairId: term.slug,
        type: "definition",
      };
    });
    setCards(shuffleArray([...termCards, ...defCards]));
    setMatchedPairs(new Set());
    setSelectedCard(null);
    setWrongPair(new Set());
    setGameComplete(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (gameComplete) {
    return (
      <main className="min-h-screen bg-muted/20 py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl space-y-8">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Game Complete!</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  You matched all {terms.length} pairs in {formatTime(elapsedTime)}!
                </p>
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
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Matching Game</h1>
              <p className="text-sm text-muted-foreground">Match terms with their definitions</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </header>

          <div className="grid grid-cols-3 gap-4">
            {cards.map((card) => {
              const state = getCardState(card);
              let bgClass = "bg-background hover:bg-muted/50";
              if (state === "selected") bgClass = "bg-primary/10 border-primary";
              if (state === "matched") bgClass = "bg-emerald-100 border-emerald-300";
              if (state === "wrong") bgClass = "bg-red-100 border-red-300";

              return (
                <Card
                  key={card.id}
                  className={`cursor-pointer transition-all ${bgClass}`}
                  onClick={() => handleCardClick(card)}
                >
                  <CardContent className="p-4 min-h-[100px] flex items-center justify-center">
                    <p className="text-center text-sm">{card.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

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
