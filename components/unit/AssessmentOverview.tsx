import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type UnitAssessment } from '@/lib/db/schema/lessons';
import { CheckCircle, Star, Target } from 'lucide-react';

interface AssessmentOverviewProps {
  assessment: UnitAssessment;
}

export function AssessmentOverview({ assessment }: AssessmentOverviewProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Target className="h-6 w-6 text-green-600" />
        Assessment Overview
      </h2>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Final Performance Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold">{assessment.performanceTask.title}</h4>
            <p className="text-muted-foreground">{assessment.performanceTask.description}</p>
          </div>

          {assessment.performanceTask.context ? (
            <div className="rounded-lg bg-blue-50 p-3 text-sm">
              <strong>Context:</strong> {assessment.performanceTask.context}
            </div>
          ) : null}

          <div>
            <h5 className="font-medium mb-2">Requirements:</h5>
            <ul className="space-y-1">
              {assessment.performanceTask.requirements.map((requirement, index) => (
                <li key={`requirement-${index}`} className="text-sm flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Key Milestones</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {assessment.milestones.map((milestone) => (
            <Card key={milestone.id} className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>{milestone.title}</span>
                  <Badge variant="outline">Day {milestone.day}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">{milestone.description}</p>
                <ul className="space-y-1 text-xs">
                  {milestone.criteria.map((criterion, index) => (
                    <li key={`${milestone.id}-criterion-${index}`} className="flex items-start gap-2">
                      <span className="mt-1 text-blue-600">•</span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assessment Rubric</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessment.rubric.map((criteria, index) => (
            <div key={`rubric-${index}`} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium">{criteria.name}</h4>
                <Badge variant="secondary">{criteria.weight}</Badge>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <div className="font-medium text-green-700">Exemplary</div>
                  <p className="text-muted-foreground">{criteria.exemplary}</p>
                </div>
                <div>
                  <div className="font-medium text-yellow-700">Proficient</div>
                  <p className="text-muted-foreground">{criteria.proficient}</p>
                </div>
                <div>
                  <div className="font-medium text-red-700">Developing</div>
                  <p className="text-muted-foreground">{criteria.developing}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
