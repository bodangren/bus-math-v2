import Link from "next/link";
import Image from "next/image";
import { BookOpen, Calculator, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-background border-b border-border"
    >
      <div className="relative container mx-auto px-4 py-20 md:py-28">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="space-y-8">
            <div className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
              Grade 12 · Applied Math
            </div>

            <h1
              id="hero-heading"
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight"
            >
              Math for <br />
              <span className="text-muted-foreground">Business Operations</span>
            </h1>

            <p className="text-lg text-muted-foreground font-body leading-relaxed max-w-lg">
              High-density, low-chroma financial modeling. 
              Every unit produces a workbook you designed from scratch.
            </p>

            {/* Stats as styled cell-badges */}
            {stats && stats.unitCount > 0 && (
              <div className="flex flex-wrap gap-px bg-border border border-border">
                {[
                  { label: "Units", value: stats.unitCount, Icon: BookOpen },
                  { label: "Lessons", value: stats.lessonCount, Icon: Calculator },
                  { label: "Activities", value: `${stats.activityCount}+`, Icon: CheckSquare },
                ].map(({ label, value, Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 bg-background p-4 flex-1 min-w-[140px]"
                  >
                    <Icon
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                    />
                    <div className="flex flex-col">
                      <span className="font-mono text-foreground font-bold text-base leading-none">
                        {value}
                      </span>
                      <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="h-12 px-8">
                <Link href="/curriculum">
                  Browse Units
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <Link href="/preface">
                  Read Preface
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: textbook cover */}
          <div
            className="flex justify-center xl:justify-end mt-8 xl:mt-0"
          >
            <div className="relative w-full max-w-[320px] md:max-w-[380px]">
              <div className="absolute -inset-4 border border-border pointer-events-none" aria-hidden="true" />
              
              <Image
                src="/cover.png"
                alt="Math for Business Operations textbook cover"
                width={400}
                height={533}
                className="relative w-full h-auto border border-border grayscale hover:grayscale-0 transition-all duration-500"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
