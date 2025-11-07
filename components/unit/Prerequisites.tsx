import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type UnitDifferentiation,
  type UnitPrerequisites,
  type UnitResource
} from '@/lib/db/schema/lessons';
import { CheckSquare, Download, ExternalLink, Monitor } from 'lucide-react';

interface PrerequisitesProps {
  prerequisites: UnitPrerequisites;
  differentiation?: UnitDifferentiation;
}

const getResourceIcon = (type: UnitResource['type']) => {
  switch (type) {
    case 'download':
      return <Download className="h-4 w-4" />;
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
};

export function Prerequisites({ prerequisites, differentiation }: PrerequisitesProps) {
  const renderSupportList = (label: string, items: string[], accentClass: string) =>
    items.length ? (
      <div>
        <h4 className={`mb-2 font-medium ${accentClass}`}>{label}</h4>
        <ul className="space-y-1 text-sm">
          {items.map((item, index) => (
            <li key={`${label}-${index}`} className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Prerequisites &amp; Preparation</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              Before You Begin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Required Knowledge:</h4>
              <ul className="space-y-1 text-sm">
                {prerequisites.knowledge.map((item, index) => (
                  <li key={`knowledge-${index}`} className="flex items-start gap-2">
                    <span className="mt-1 text-blue-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-medium">Technology Requirements:</h4>
              <ul className="space-y-1 text-sm">
                {prerequisites.technology.map((item, index) => (
                  <li key={`tech-${index}`} className="flex items-start gap-2">
                    <Monitor className="h-4 w-4 text-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Downloads &amp; Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prerequisites.resources.map((resource, index) => (
              <div key={`resource-${index}`} className="flex items-center justify-between gap-4 rounded border p-2">
                <span className="text-sm font-medium">{resource.title}</span>
                {resource.url ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8"
                    aria-label={`Open ${resource.title}`}
                  >
                    <a href={resource.url} target="_blank" rel="noreferrer">
                      {getResourceIcon(resource.type)}
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="h-8" disabled>
                    {getResourceIcon(resource.type)}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {differentiation ? (
        <Card>
          <CardHeader>
            <CardTitle>Differentiation &amp; Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {renderSupportList('For Struggling Students', differentiation.struggling, 'text-yellow-700')}
              {renderSupportList('For Advanced Students', differentiation.advanced, 'text-green-700')}
              {renderSupportList('For English Language Learners', differentiation.ell, 'text-blue-700')}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
