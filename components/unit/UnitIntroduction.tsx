import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type UnitIntroduction as UnitIntroductionData } from '@/lib/db/schema/lessons';
import {
  ArrowRight,
  Clock,
  Lightbulb,
  PlayCircle,
  Target,
  Users
} from 'lucide-react';

type UnitIntroductionProps = UnitIntroductionData;

const buildEmbedUrl = (youtubeId: string) =>
  `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`;

export function UnitIntroduction({
  unitNumber,
  unitTitle,
  drivingQuestion,
  introVideo,
  entryEvent,
  projectOverview,
  learningObjectives,
  nextSectionHref = '#'
}: UnitIntroductionProps) {
  return (
    <section className="space-y-8">
      <div className="space-y-4 text-center">
        <Badge variant="outline" className="text-sm">
          {unitNumber} Introduction
        </Badge>
        <h1 className="text-4xl font-bold">{unitTitle}</h1>
        <blockquote className="mx-auto max-w-4xl border-l-4 border-primary pl-4 text-xl italic text-muted-foreground">
          &ldquo;{drivingQuestion}&rdquo;
        </blockquote>
      </div>

      {introVideo ? (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <PlayCircle className="h-6 w-6" />
              {introVideo.title}
            </CardTitle>
            {introVideo.description ? (
              <p className="text-sm text-muted-foreground">{introVideo.description}</p>
            ) : null}
            {introVideo.duration ? (
              <p className="text-xs text-muted-foreground">Duration: {introVideo.duration}</p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
              <iframe
                src={buildEmbedUrl(introVideo.youtubeId)}
                title={introVideo.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <details className="rounded border bg-gray-50 p-4 text-left">
              <summary className="flex cursor-pointer items-center gap-2 font-medium">
                <ArrowRight className="h-4 w-4" /> Video Transcript
              </summary>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {introVideo.transcript}
              </pre>
            </details>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <PlayCircle className="h-6 w-6" />
            {entryEvent.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg leading-relaxed">{entryEvent.description}</p>
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-900">Day 1 Activities:</h4>
            <ul className="space-y-2">
              {entryEvent.activities.map((activity, index) => (
                <li key={`entry-activity-${index}`} className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-blue-600" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>
          {entryEvent.resources?.length ? (
            <div className="border-t pt-4">
              <h5 className="mb-2 text-sm font-medium text-muted-foreground">Resources Provided:</h5>
              <div className="flex flex-wrap gap-2">
                {entryEvent.resources.map((resource, index) => (
                  <Badge key={`entry-resource-${index}`} variant="secondary" className="text-xs">
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Target className="h-6 w-6" />
            Your Project Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">SCENARIO</h4>
                <p className="text-sm">{projectOverview.scenario}</p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">TEAM STRUCTURE</h4>
                <p className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  {projectOverview.teamStructure}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">FINAL DELIVERABLE</h4>
                <p className="text-sm font-medium text-green-700">{projectOverview.deliverable}</p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold text-muted-foreground">TIMELINE</h4>
                <p className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  {projectOverview.timeline}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Lightbulb className="h-6 w-6" />
            What You&apos;ll Learn &amp; Build
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: 'Content Knowledge', items: learningObjectives.content },
              { label: 'Excel Skills', items: learningObjectives.skills },
              { label: 'Deliverables', items: learningObjectives.deliverables }
            ].map((section, index) => (
              <div key={`intro-objective-${index}`}>
                <h4 className="mb-3 font-semibold text-purple-700">{section.label}</h4>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={`objective-${index}-${itemIndex}`} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-3 w-3 flex-shrink-0 text-purple-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-8">
        <Button asChild size="lg" className="flex items-center gap-2">
          <a href={nextSectionHref}>
            Start Learning: Core Concepts
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
