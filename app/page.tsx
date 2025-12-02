import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Calculator,
  CheckSquare,
  Dice6,
  TrendingUp,
  Search,
  BarChart3,
} from "lucide-react";
import { Carousel } from "@/components/ui/carousel";
import { createClient } from "@/lib/supabase/server";

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

interface CurriculumStats {
  unitCount: number;
  lessonCount: number;
  activityCount: number;
}

interface LessonMetadata {
  duration?: string;
  difficulty?: string;
  tags?: string[];
}

interface Lesson {
  id: string;
  unit_number: number;
  title: string;
  slug: string;
  description: string | null;
  learning_objectives: string[] | null;
  order_index: number;
  metadata: LessonMetadata | null;
  created_at: string;
  updated_at: string;
}

async function getCurriculumStats(): Promise<CurriculumStats> {
  const supabase = await createClient();

  // Try using the RPC function first
  const { data, error } = await supabase.rpc("get_curriculum_stats");

  if (error) {
    // If RPC fails, fall back to manual counting
    // This can happen if PostgREST schema cache hasn't refreshed yet
    try {
      const [lessonsResult, activitiesResult] = await Promise.all([
        supabase.from("lessons").select("*", { count: "exact", head: true }),
        supabase.from("activities").select("*", { count: "exact", head: true }),
      ]);

      // Get distinct unit count by querying all lessons and counting unique unit_numbers
      const { data: lessons } = await supabase.from("lessons").select("unit_number");
      const uniqueUnits = new Set(lessons?.map(l => l.unit_number) || []);

      return {
        unitCount: uniqueUnits.size,
        lessonCount: lessonsResult.count || 0,
        activityCount: activitiesResult.count || 0,
      };
    } catch (fallbackError) {
      console.error("Error fetching curriculum stats (fallback):", fallbackError);
      return { unitCount: 0, lessonCount: 0, activityCount: 0 };
    }
  }

  return data as CurriculumStats;
}

async function getUnits() {
  const supabase = await createClient();

  // Fetch first lesson of each unit (order_index = 1) to represent the unit
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("order_index", 1)
    .order("unit_number", { ascending: true });

  if (error) {
    console.error("Error fetching units:", error);
    return [];
  }

  return lessons as Lesson[];
}

export default async function Home() {
  const stats = await getCurriculumStats();
  const units = await getUnits();

  return (
    <>
      {/* Hero section */}
      <section aria-labelledby="hero-heading" className="py-24 bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Calculator className="h-8 w-8 text-primary" />
                <BarChart3 className="h-7 w-7 text-accent" />
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Math for Business Operations
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Master accounting principles, spreadsheet modeling, and
                entrepreneurship through hands-on Excel projects and real-world
                business applications.
              </p>
              {/* Stats display - only show if we have actual data */}
              {stats && stats.unitCount > 0 && (
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex items-baseline gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>
                      <strong className="text-foreground">
                        {stats.unitCount}
                      </strong>{" "}
                      Units
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Calculator className="h-4 w-4 text-accent" />
                    <span>
                      <strong className="text-foreground">
                        {stats.lessonCount}
                      </strong>{" "}
                      Lessons
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                    <span>
                      <strong className="text-foreground">
                        {stats.activityCount}+
                      </strong>{" "}
                      Activities
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="gradient-financial text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Link href="/curriculum" className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded">Browse Units</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end mt-12 lg:mt-0">
              <div className="w-full max-w-sm md:max-w-md relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-lg blur-xl opacity-30"></div>
                <Image
                  src="/cover.png"
                  alt="Math for Business Operations textbook cover showing business charts and Excel spreadsheets"
                  width={400}
                  height={533}
                  className="relative w-full h-auto rounded-lg shadow-2xl border border-border/50"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <section aria-labelledby="course-structure-heading" className="py-24 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="course-structure-heading" className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Course Structure
            </h2>
            <p className="text-xl text-muted-foreground">
              Hands-on units plus a comprehensive capstone project.
            </p>
          </div>

          {/* Desktop grid view */}
          <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {units.map((unit) => (
              <Card
                key={unit.id}
                className="card-ledger hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50"
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link
                      href={`/student/lesson/${unit.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      Unit {unit.unit_number}: {unit.title}
                    </Link>
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
            ))}
          </div>

          {/* Mobile/Tablet carousel view */}
          <div className="lg:hidden">
            <Carousel 
              itemsPerView={1} 
              className="max-w-md mx-auto"
              gap="gap-4"
            >
              {units.map((unit) => (
                <Card
                  key={unit.id}
                className="card-ledger hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/student/lesson/${unit.slug}`}
                      className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded"
                      >
                        Unit {unit.unit_number}: {unit.title}
                      </Link>
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
      <section aria-labelledby="features-heading" className="py-24 bg-gradient-to-br from-muted/10 via-background to-muted/5">
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
