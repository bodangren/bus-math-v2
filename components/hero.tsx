import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookOpen, Calculator, CheckSquare } from "lucide-react";

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
      className="relative overflow-hidden hero-gradient"
    >
      {/* Spreadsheet grid overlay */}
      <div
        className="absolute inset-0 accounting-grid-dark pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 py-20 md:py-28">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="space-y-7 animate-fade-up">
            <span className="section-label section-label-light">
              Grade 12 · Applied Math
            </span>

            <h1
              id="hero-heading"
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              Math for Business{" "}
              <span style={{ color: "oklch(0.68 0.17 157)" }}>Operations</span>
            </h1>

            <p className="text-lg text-white/65 font-body leading-relaxed max-w-lg">
              Master accounting principles, spreadsheet modeling, and
              entrepreneurship through hands-on Excel projects and real-world
              business applications.
            </p>

            {/* Stats as styled cell-badges */}
            {stats && stats.unitCount > 0 && (
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Units", value: stats.unitCount, Icon: BookOpen },
                  { label: "Lessons", value: stats.lessonCount, Icon: Calculator },
                  { label: "Activities", value: `${stats.activityCount}+`, Icon: CheckSquare },
                ].map(({ label, value, Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-md px-3 py-2 border"
                    style={{
                      background: "oklch(1 0 0 / 0.07)",
                      borderColor: "oklch(1 0 0 / 0.12)",
                    }}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: "oklch(0.68 0.17 157)" }}
                    />
                    <span className="font-mono-num text-white font-semibold text-sm">
                      {value}
                    </span>
                    <span className="text-white/45 text-xs font-body">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                asChild
                size="lg"
                className="gradient-cta text-white font-body font-semibold shadow-lg hover:opacity-90 transition-opacity"
              >
                <Link
                  href="/curriculum"
                  className="focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 rounded"
                >
                  Browse Units
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 font-body transition-all"
              >
                <Link href="/preface">Read Preface</Link>
              </Button>
            </div>
          </div>

          {/* Right: textbook cover */}
          <div
            className="flex justify-center xl:justify-end mt-8 xl:mt-0 animate-fade-up-3"
          >
            <div className="relative w-full max-w-[320px] md:max-w-[380px]">
              {/* Decorative column letters above the cover */}
              <div
                className="absolute -top-7 left-0 right-0 flex font-mono-num text-[10px] text-white/20 pointer-events-none"
                aria-hidden="true"
              >
                {["A", "B", "C"].map((col) => (
                  <div
                    key={col}
                    className="flex-1 text-center py-1 border border-white/[0.07]"
                  >
                    {col}
                  </div>
                ))}
              </div>
              {/* Decorative row numbers beside the cover */}
              <div
                className="absolute -left-7 top-0 bottom-0 flex flex-col font-mono-num text-[10px] text-white/20 pointer-events-none"
                aria-hidden="true"
              >
                {["1", "2", "3", "4", "5"].map((row) => (
                  <div
                    key={row}
                    className="flex-1 flex items-center justify-center px-1.5 border border-white/[0.07]"
                  >
                    {row}
                  </div>
                ))}
              </div>

              {/* Soft glow behind the cover */}
              <div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  boxShadow: "0 0 60px oklch(0.43 0.14 157 / 0.35)",
                }}
                aria-hidden="true"
              />

              <Image
                src="/cover.png"
                alt="Math for Business Operations textbook cover showing business charts and Excel spreadsheets"
                width={400}
                height={533}
                className="relative w-full h-auto rounded-lg shadow-2xl"
                style={{ border: "1px solid oklch(1 0 0 / 0.15)" }}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
