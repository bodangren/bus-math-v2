import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Calculator,
  CheckSquare,
  Dice6,
  TrendingUp,
  Search,
} from "lucide-react";
import { Carousel } from "@/components/ui/carousel";
import { Hero } from "@/components/hero";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getConvexUrl } from "@/lib/convex/config";

interface LandingUnit {
  id: string;
  unit_number: number;
  title: string;
  slug: string;
  description?: string | null;
  metadata?: {
    duration?: string;
    difficulty?: string;
  } | null;
}

function getConvexClient() {
  return new ConvexHttpClient(getConvexUrl());
}

const features = [
  {
    icon: BookOpen,
    title: "Interactive Spreadsheets",
    description: "Work with live Excel-like interfaces directly in your browser.",
  },
  {
    icon: Calculator,
    title: "Financial Calculators",
    description: "Built-in calculators for NPV, loan payments, and more.",
  },
  {
    icon: CheckSquare,
    title: "Comprehension Checks",
    description:
      "Immediate feedback on your understanding after each section.",
  },
  {
    icon: Dice6,
    title: "Dynamic Exercises",
    description: "Practice with different scenarios and data every time.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your learning journey and identify areas to review.",
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "beginner":
      return "text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30";
    case "intermediate":
      return "text-primary bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30";
    case "advanced":
      return "text-orange-700 dark:text-orange-300 bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/30";
    case "expert":
      return "text-red-700 dark:text-red-300 bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30";
    default:
      return "text-muted-foreground bg-muted/30 border-border/30";
  }
};

const formatDifficulty = (difficulty: string) => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

export default async function Home() {
  const convex = getConvexClient();

  const [statsFetch, unitsFetch] = await Promise.allSettled([
    convex.query(api.public.getCurriculumStats),
    convex.query(api.public.getUnits),
  ]);

  if (statsFetch.status === "rejected" || unitsFetch.status === "rejected") {
    console.error("[home] Failed to load landing data from Convex", {
      statsError: statsFetch.status === "rejected" ? statsFetch.reason : null,
      unitsError: unitsFetch.status === "rejected" ? unitsFetch.reason : null,
    });
  }

  const statsResult = statsFetch.status === "fulfilled" ? statsFetch.value : null;
  const unitsResult = unitsFetch.status === "fulfilled" ? unitsFetch.value : [];
  const stats =
    statsResult &&
    typeof statsResult === "object" &&
    "unitCount" in statsResult &&
    "lessonCount" in statsResult &&
    "activityCount" in statsResult
      ? statsResult
      : null;
  const landingUnits = Array.isArray(unitsResult) ? (unitsResult as LandingUnit[]) : [];

  return (
    <>
      <Hero stats={stats} />

      {/* Search Section */}
      <section
        aria-labelledby="search-heading"
        className="py-14 bg-background border-b border-border/40"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <span className="section-label">Find Anything</span>
            <h2
              id="search-heading"
              className="font-display text-2xl md:text-3xl font-semibold mt-4 mb-3 text-foreground"
            >
              Search Course Content
            </h2>
            <p className="text-muted-foreground font-body max-w-md mx-auto">
              Find lessons, concepts, formulas, and examples instantly.
            </p>
          </div>
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <Input
                type="search"
                placeholder="Search for lessons, topics, formulas, or examples..."
                className="flex-1 h-11 text-base border-border/60 bg-background focus:bg-background transition-colors font-body"
              />
              <Button size="lg" className="h-11 px-5 shrink-0 gradient-financial text-white">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Course Structure / Table of Contents */}
      <section
        aria-labelledby="course-structure-heading"
        className="py-16 bg-muted/20 ledger-bg"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-label">The Curriculum</span>
            <h2
              id="course-structure-heading"
              className="font-display text-3xl md:text-4xl font-bold mt-4 mb-3 text-foreground"
            >
              Course Structure
            </h2>
            <p className="text-muted-foreground font-body text-lg">
              8 Units + Capstone Project
            </p>
          </div>

          {/* Desktop grid */}
          <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {landingUnits.map((unit, index) => (
              <Link
                key={unit.id}
                href={`/student/lesson/${unit.slug}`}
                className="group block outline-none focus-visible:outline-none"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="card-workbook h-full p-5 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2">
                  <p className="font-mono-num text-[10px] text-muted-foreground mb-2 tracking-widest uppercase">
                    Unit {unit.unit_number}
                  </p>
                  <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                    {unit.title}
                  </h3>
                  {unit.description && (
                    <p className="text-xs text-muted-foreground font-body leading-relaxed mb-3">
                      {unit.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-auto pt-2">
                    <span className="text-xs text-muted-foreground font-mono-num">
                      {unit.metadata?.duration || "2–3 wks"}
                    </span>
                    {unit.metadata?.difficulty && (
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] font-mono-num font-medium ${getDifficultyColor(
                          unit.metadata.difficulty
                        )}`}
                      >
                        {formatDifficulty(unit.metadata.difficulty)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile/Tablet carousel */}
          <div className="lg:hidden">
            <Carousel
              itemsPerView={1}
              className="max-w-md mx-auto"
              gap="gap-4"
            >
              {landingUnits.map((unit) => (
                <Link
                  key={unit.id}
                  href={`/student/lesson/${unit.slug}`}
                  className="group block outline-none focus-visible:outline-none p-1"
                >
                  <div className="card-workbook p-5 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2">
                    <p className="font-mono-num text-[10px] text-muted-foreground mb-2 tracking-widest uppercase">
                      Unit {unit.unit_number}
                    </p>
                    <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                      {unit.title}
                    </h3>
                    {unit.description && (
                      <p className="text-xs text-muted-foreground font-body leading-relaxed mb-3">
                        {unit.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-mono-num">
                        {unit.metadata?.duration || "2–3 wks"}
                      </span>
                      {unit.metadata?.difficulty && (
                        <span
                          className={`px-2 py-0.5 rounded border text-[10px] font-mono-num font-medium ${getDifficultyColor(
                            unit.metadata.difficulty
                          )}`}
                        >
                          {formatDifficulty(unit.metadata.difficulty)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </Carousel>
          </div>

          {/* Getting Started nav */}
          <nav
            aria-labelledby="getting-started-heading"
            className="mt-10 max-w-sm"
          >
            <div className="card-statement rounded-lg overflow-hidden">
              <div className="excel-header px-5 py-3">
                <h3
                  id="getting-started-heading"
                  className="font-display text-sm font-semibold text-primary"
                >
                  Getting Started
                </h3>
              </div>
              <div className="px-5 py-3 space-y-1">
                <Link
                  href="/preface"
                  className="block text-sm font-body hover:text-primary transition-colors p-2 rounded hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                  Preface
                </Link>
                <Link
                  href="/acknowledgments"
                  className="block text-sm font-body hover:text-primary transition-colors p-2 rounded hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                  Acknowledgments
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </section>

      {/* Features highlight */}
      <section
        aria-labelledby="features-heading"
        className="py-16 bg-background"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-label">What You Get</span>
            <h2
              id="features-heading"
              className="font-display text-3xl md:text-4xl font-bold mt-4 mb-3 text-foreground"
            >
              Interactive Learning Features
            </h2>
            <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
              Everything you need for hands-on business math education with
              Excel integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-workbook p-6 text-center group"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div
                  className="w-14 h-14 mx-auto mb-4 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background: "oklch(0.43 0.14 157 / 0.08)",
                  }}
                >
                  <feature.icon
                    className="w-7 h-7 text-primary"
                  />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm font-body leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
