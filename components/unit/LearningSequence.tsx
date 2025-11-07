import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type UnitLearningSequence } from '@/lib/db/schema/lessons';
import { BookOpen, Calendar, Target } from 'lucide-react';

interface LearningSequenceProps {
  learningSequence: UnitLearningSequence;
}

export function LearningSequence({ learningSequence }: LearningSequenceProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Calendar className="h-6 w-6 text-purple-600" />
        Learning Sequence
      </h2>

      <div className="space-y-6">
        {learningSequence.weeks.map((week) => (
          <Card key={week.weekNumber} className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                  Week {week.weekNumber}
                </Badge>
                <span>{week.title}</span>
              </CardTitle>
              <p className="text-muted-foreground">{week.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {week.days.map((day) => (
                  <div key={`${week.weekNumber}-day-${day.day}`} className="border-l-2 border-purple-200 pl-4">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        Day {day.day}
                      </Badge>
                      <h4 className="font-medium">{day.focus}</h4>
                      {day.milestone ? (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs text-yellow-800">
                          <Target className="h-3 w-3" />
                          Milestone
                        </Badge>
                      ) : null}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <h5 className="mb-1 flex items-center gap-1 font-medium text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          Activities
                        </h5>
                        <ul className="ml-4 space-y-1">
                          {day.activities.map((activity, index) => (
                            <li key={`activity-${week.weekNumber}-${day.day}-${index}`} className="flex items-start gap-2">
                              <span className="text-purple-600">•</span>
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {day.resources.length ? (
                        <div>
                          <h5 className="mb-1 font-medium text-muted-foreground">Resources</h5>
                          <div className="ml-4 flex flex-wrap gap-1">
                            {day.resources.map((resource, index) => (
                              <Badge key={`resource-${week.weekNumber}-${day.day}-${index}`} variant="outline" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {day.milestone ? (
                        <div className="rounded border-l-2 border-yellow-400 bg-yellow-50 p-2 text-xs text-yellow-800">
                          📍 {day.milestone}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
