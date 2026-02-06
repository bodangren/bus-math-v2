import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calculator,
  CheckSquare,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface CurriculumStats {
  unitCount: number;
  lessonCount: number;
  activityCount: number;
}

interface HeroProps {
  stats: CurriculumStats | null;
}

export function Hero({ stats }: HeroProps) {
  return (
    <section aria-labelledby="hero-heading" className="py-16 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
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
            <div className="flex justify-start">
              <Button
                asChild
                size="lg"
                className="gradient-financial text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link href="/curriculum" className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded">Browse Units</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center xl:justify-end mt-12 xl:mt-0">
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
  );
}
