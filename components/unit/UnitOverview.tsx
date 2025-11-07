import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type UnitObjectives } from '@/lib/db/schema/lessons';
import { BarChart3, Target, Wrench } from 'lucide-react';

interface UnitOverviewProps {
  objectives: UnitObjectives;
}

const sections = [
  {
    title: 'Learning Objectives',
    icon: <Target className="h-5 w-5 text-blue-600" />,
    key: 'content' as const,
    accent: 'text-blue-600'
  },
  {
    title: 'Tools & Skills',
    icon: <Wrench className="h-5 w-5 text-orange-600" />,
    key: 'skills' as const,
    accent: 'text-orange-600'
  },
  {
    title: 'Final Deliverables',
    icon: <BarChart3 className="h-5 w-5 text-green-600" />,
    key: 'deliverables' as const,
    accent: 'text-green-600'
  }
];

export function UnitOverview({ objectives }: UnitOverviewProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Unit Overview</h2>

      <div className="grid gap-6 md:grid-cols-3">
        {sections.map((section) => {
          const items = objectives[section.key];
          return (
            <Card key={section.key}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length ? (
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <li key={`${section.key}-${index}`} className="text-sm flex items-start gap-2">
                        <span className={`${section.accent} mt-1`}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Details coming soon.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
