"use client";

import { useMemo } from "react";
import {
  ChevronRight,
  Calendar,
  TrendingUp,
  BookOpen,
  Award,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useTermMastery,
  useRecentSessions,
} from "@/hooks/useStudy";
import { getAllGlossaryUnits, getGlossaryTermsByUnit } from "@/lib/study/glossary";

function UnitProgressCard({ unitNumber }: { unitNumber: number }) {
  const termMastery = useTermMastery(unitNumber);

  const stats = useMemo(() => {
    const unitTerms = getGlossaryTermsByUnit(unitNumber) || [];
    if (!termMastery || termMastery.length === 0) {
      return {
        total: unitTerms.length,
        studied: 0,
        mastered: 0,
        familiar: 0,
        learning: 0,
        averageMastery: 0,
      };
    }

    const total = unitTerms.length;
    const studied = termMastery.length;
    const mastered = termMastery.filter((t) => t.proficiencyBand === "mastered").length;
    const familiar = termMastery.filter((t) => t.proficiencyBand === "familiar").length;
    const learning = termMastery.filter((t) => t.proficiencyBand === "learning").length;
    const averageMastery = termMastery.reduce((sum, t) => sum + t.mastery, 0) / studied;

    return { total, studied, mastered, familiar, learning, averageMastery };
  }, [termMastery, unitNumber]);

  return (
    <Card key={unitNumber} className="border-border/60 bg-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Unit {unitNumber}</CardTitle>
          <Badge variant="outline">
            {Math.round(stats.averageMastery * 100)}%
          </Badge>
        </div>
        <CardDescription>
          {stats.studied}/{stats.total} terms studied
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={stats.total > 0 ? (stats.studied / stats.total) * 100 : 0} className="h-2" />
        <div className="flex gap-2">
          <Badge variant="default" className="bg-green-600">
            {stats.mastered} Mastered
          </Badge>
          <Badge variant="default" className="bg-yellow-600">
            {stats.familiar} Familiar
          </Badge>
          <Badge variant="default" className="bg-red-600">
            {stats.learning} Learning
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgressDashboard() {
  const termMastery = useTermMastery();
  const recentSessions = useRecentSessions(10);
  const availableUnits = getAllGlossaryUnits();

  const aggregateStats = useMemo(() => {
    if (!termMastery) {
      return {
        totalTerms: 0,
        totalSessions: 0,
        overallAccuracy: 0,
        currentStreak: 0,
      };
    }

    const totalTerms = termMastery.length;
    const totalSessions = recentSessions?.length ?? 0;
    const totalCorrect = termMastery.reduce((sum, t) => sum + t.correctCount, 0);
    const totalSeen = termMastery.reduce((sum, t) => sum + t.seenCount, 0);
    const overallAccuracy = totalSeen > 0 ? (totalCorrect / totalSeen) * 100 : 0;

    return {
      totalTerms,
      totalSessions,
      overallAccuracy,
      currentStreak: 0,
    };
  }, [termMastery, recentSessions]);

  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
            <Card className="border-primary/20 bg-background">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  Progress
                </Badge>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Progress Dashboard
                </h1>
                <CardDescription className="max-w-2xl text-base">
                  Track your learning progress, mastery levels, and study history.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Overall Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Terms Studied</span>
                  </div>
                  <span className="text-lg font-semibold">{aggregateStats.totalTerms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Sessions</span>
                  </div>
                  <span className="text-lg font-semibold">{aggregateStats.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Overall Accuracy</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {Math.round(aggregateStats.overallAccuracy)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Current Streak</span>
                  </div>
                  <span className="text-lg font-semibold">{aggregateStats.currentStreak}</span>
                </div>
              </CardContent>
            </Card>
          </header>

          <section aria-label="Per-unit mastery">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Per-Unit Mastery</CardTitle>
                <CardDescription>See how you’re doing in each unit</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {availableUnits.map((unit) => (
                  <UnitProgressCard key={unit} unitNumber={unit} />
                ))}
              </CardContent>
            </Card>
          </section>

          <section aria-label="Session history">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Session History</CardTitle>
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
                          {new Date(session.endedAt).toLocaleDateString()} • {session.results?.itemsSeen ?? 0} terms • {session.results?.itemsCorrect ?? 0} correct
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
