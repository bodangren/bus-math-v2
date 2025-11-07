import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type UnitStudentChoices } from '@/lib/db/schema/lessons';
import { Presentation, UserCheck, Users } from 'lucide-react';

interface StudentChoicesProps {
  studentChoices?: UnitStudentChoices;
}

export function StudentChoices({ studentChoices }: StudentChoicesProps) {
  const ventures = studentChoices?.ventures ?? [];
  const roles = studentChoices?.roles ?? [];
  const presentationFormats = studentChoices?.presentationFormats ?? [];

  const hasContent = ventures.length || roles.length || presentationFormats.length;

  if (!hasContent) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Users className="h-6 w-6 text-indigo-600" />
        Student Voice & Choice
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {ventures.length ? (
          <Card className="border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                  📈
                </Badge>
                Venture Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Choose from suggested startups or pitch your own:
              </p>
              <div className="flex flex-wrap gap-2">
                {ventures.map((venture, index) => (
                  <Badge key={`venture-${index}`} variant="outline" className="text-xs">
                    {venture}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {roles.length ? (
          <Card className="border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5 text-indigo-600" />
                Team Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Select a role that matches your strengths:
              </p>
              <div className="space-y-2">
                {roles.map((role, index) => (
                  <Badge key={`role-${index}`} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {presentationFormats.length ? (
          <Card className="border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Presentation className="h-5 w-5 text-indigo-600" />
                Presentation Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Choose how you want to showcase your work:
              </p>
              <div className="flex flex-wrap gap-2">
                {presentationFormats.map((format, index) => (
                  <Badge key={`format-${index}`} variant="outline" className="text-xs">
                    {format}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
