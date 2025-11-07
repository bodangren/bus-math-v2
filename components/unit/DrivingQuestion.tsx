import { Card, CardContent } from '@/components/ui/card';
import { type UnitDrivingQuestion } from '@/lib/db/schema/lessons';
import { HelpCircle } from 'lucide-react';

interface DrivingQuestionProps {
  drivingQuestion?: UnitDrivingQuestion;
}

export function DrivingQuestion({ drivingQuestion }: DrivingQuestionProps) {
  if (!drivingQuestion) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <HelpCircle className="h-6 w-6 text-blue-600" />
        Driving Question
      </h2>

      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-blue-50/50 to-transparent">
        <CardContent className="pt-6 space-y-4">
          <blockquote className="text-lg font-semibold text-primary">
            &ldquo;{drivingQuestion.question}&rdquo;
          </blockquote>

          <p className="text-muted-foreground leading-relaxed">{drivingQuestion.context}</p>

          {drivingQuestion.scenario ? (
            <div className="mt-2 rounded-lg border bg-muted/40 p-4 text-sm">
              <strong>Scenario:</strong> {drivingQuestion.scenario}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
