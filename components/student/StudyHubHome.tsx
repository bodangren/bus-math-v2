"use client";

import { useMemo, useState } from "react";
import {
  ChevronRight,
  Calendar,
  TrendingDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useStudyPreferences,
  useTermMastery,
  useDueTerms,
  useRecentSessions,
  useGlossaryTermDisplay,
} from "@/hooks/useStudy";
import { getAllGlossaryUnits, getGlossaryTermBySlug } from "@/lib/study/glossary";
import type { GlossaryTerm } from "@/lib/study/glossary";

function WeakTopicItem({
  term,
  mastery,
  languageMode,
}: {
  term: GlossaryTerm;
  mastery: number;
  languageMode: ReturnType<typeof useStudyPreferences>["languageMode"];
}) {
  const display = useGlossaryTermDisplay(term, languageMode);
  return (
    <div
      key={term.slug}
      className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3"
    >
      <div>
        <p className="text-sm font-medium">{display.prompt}</p>
        <p className="text-xs text-muted-foreground">{display.answer}</p>
      </div>
      <Badge variant="outline" className="text-xs">
        {Math.round(mastery * 100)}%
      </Badge>
    </div>
  );
}

export function StudyHubHome() {
  const { languageMode } = useStudyPreferences();
  const [selectedUnit, setSelectedUnit] = useState<number | "all">("all");
  const termMastery = useTermMastery(selectedUnit === "all" ? undefined : selectedUnit);
  const dueTerms = useDueTerms();
  const recentSessions = useRecentSessions(5);
  const availableUnits = getAllGlossaryUnits();

  const weakTopics = useMemo(() => {
    if (!termMastery) return [];
    return termMastery
      .filter((t) => t.mastery < 0.5)
      .slice(0, 5)
      .map((t) => {
        const term = getGlossaryTermBySlug(t.termSlug);
        return { ...t, term };
      })
      .filter((t): t is typeof t & { term: GlossaryTerm } => t.term !== undefined);
  }, [termMastery]);

  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
            <Card className="border-primary/20 bg-background">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  Study Tools
                </Badge>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Study Hub
                </h1>
                <CardDescription className="max-w-2xl text-base">
                  Reinforce your learning with flashcards, games, and practice tests tailored to
                  the curriculum.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Terms due for review</span>
                  <span>{dueTerms?.length ?? 0} terms</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg">Unit Filter</CardTitle>
                <CardDescription>Focus on terms from a specific unit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedUnit === "all" ? "default" : "outline"}
                  onClick={() => setSelectedUnit("all")}
                  className="w-full justify-start"
                >
                  All Units
                </Button>
                {availableUnits.map((unit) => (
                  <Button
                    key={unit}
                    variant={selectedUnit === unit ? "default" : "outline"}
                    onClick={() => setSelectedUnit(unit)}
                    className="w-full justify-start"
                  >
                    Unit {unit}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </header>

          <section aria-label="Study modes">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Study Modes</CardTitle>
                <CardDescription>Choose how you want to study today</CardDescription>
              </CardHeader>
              <CardContent>
                <div>Study modes coming soon!</div>
              </CardContent>
            </Card>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section aria-label="Recent study sessions">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Recent Study Sessions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!recentSessions || recentSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No study sessions yet.</p>
                  ) : (
                    recentSessions.map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {session.activityType.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.endedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </section>

            <section aria-label="Weak topics">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Weak Topics</CardTitle>
                  </div>
                  <CardDescription>Terms you should review more</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {weakTopics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No weak topics right now—great job!</p>
                  ) : (
                    weakTopics.map(({ term, mastery }) => (
                      <WeakTopicItem
                        key={term.slug}
                        term={term}
                        mastery={mastery}
                        languageMode={languageMode}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
