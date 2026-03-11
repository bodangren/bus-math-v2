import { BookCheck, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PhaseGuidance } from '@/lib/curriculum/phase-guidance';

interface PhaseGuidanceCardProps {
  guidance: PhaseGuidance;
  learningObjectives: string[] | null;
}

export function PhaseGuidanceCard({
  guidance,
  learningObjectives,
}: PhaseGuidanceCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Phase Focus</Badge>
          <Badge variant="outline" className="capitalize">
            {guidance.lessonType}
          </Badge>
        </div>
        <CardTitle className="text-xl">{guidance.phaseLabel}</CardTitle>
        <p className="text-sm text-muted-foreground">{guidance.goal}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 text-primary" />
            What success looks like
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {guidance.successCriteria.map((criterion) => (
              <li key={criterion} className="rounded-md border border-border/50 bg-background/80 px-3 py-2">
                {criterion}
              </li>
            ))}
          </ul>
        </section>

        {learningObjectives && learningObjectives.length > 0 ? (
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookCheck className="h-4 w-4 text-primary" />
              This phase advances these lesson objectives
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {learningObjectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
