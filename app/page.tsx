import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  // Fetch concurrently from Convex
  const [stats, units] = await Promise.all([
    convex.query(api.public.getCurriculumStats),
    convex.query(api.public.getUnits)
  ]);
  const landingUnits = units as LandingUnit[];

  return (
    <>
      <Hero stats={stats} />

      {/* Search Section */}
      <section aria-labelledby="search-heading" className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 id="search-heading" className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              Search Course Content
            </h2>
            <p className="text-lg text-muted-foreground">
              Find lessons, concepts, formulas, and examples instantly.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-2">
              <Input
                type="search"
                placeholder="Search for lessons, topics, formulas, or examples..."
                className="flex-1 h-12 text-base border-border/50 bg-background/80 focus:bg-background transition-colors"
              />
              <Button
                size="lg"
                className="h-12 px-6 shrink-0"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section aria-labelledby="course-structure-heading" className="py-16 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="course-structure-heading" className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Course Structure
            </h2>
            <p className="text-xl text-muted-foreground">
              8 Units + Capstone
            </p>
          </div>

          {/* Desktop grid view */}
          <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {landingUnits.map((unit) => (
              <Link
                key={unit.id}
                href={`/student/lesson/${unit.slug}`}
                className="group block outline-none focus-visible:outline-none"
              >
                <Card
                  className="card-ledger h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-border/50 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2"
                >
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      Unit {unit.unit_number}: {unit.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {unit.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">
                        {unit.metadata?.duration || "2-3 weeks"}
                      </span>
                      {unit.metadata?.difficulty && (
                        <span
                          className={`px-2 py-1 rounded-md border text-xs font-medium ${getDifficultyColor(
                            unit.metadata.difficulty
                          )}`}
                        >
                          {formatDifficulty(unit.metadata.difficulty)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Mobile/Tablet carousel view */}
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
                  <Card
                    className="card-ledger hover:shadow-lg transition-all duration-300 group-hover:scale-105 border-border/50 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        Unit {unit.unit_number}: {unit.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {unit.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">
                          {unit.metadata?.duration || "2-3 weeks"}
                        </span>
                        {unit.metadata?.difficulty && (
                          <span
                            className={`px-2 py-1 rounded-md border text-xs font-medium ${getDifficultyColor(
                              unit.metadata.difficulty
                            )}`}
                          >
                            {formatDifficulty(unit.metadata.difficulty)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </Carousel>
          </div>

          <nav aria-labelledby="getting-started-heading" className="mt-12 grid grid-cols-1 md:grid-cols-1 gap-6">
            <Card className="card-statement border-primary/20">
              <CardHeader className="excel-header">
                <CardTitle id="getting-started-heading" className="text-primary">Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/preface"
                  className="block text-sm hover:text-primary transition-colors p-2 rounded hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                  Preface
                </Link>
                <Link
                  href="/acknowledgments"
                  className="block text-sm hover:text-primary transition-colors p-2 rounded hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                  Acknowledgments
                </Link>
              </CardContent>
            </Card>
          </nav>
        </div>
      </section>

      {/* Features highlight */}
      <section aria-labelledby="features-heading" className="py-16 bg-gradient-to-br from-muted/10 via-background to-muted/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Interactive Learning Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for hands-on business math education with
              Excel integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="card-ledger text-center hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50 group"
              >
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
