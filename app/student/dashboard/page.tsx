import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const dynamic = 'force-dynamic';

export default async function StudentDashboard() {
  // Temporary: we still use Supabase for Auth until Task 4
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Use Convex HTTP client for server-side fetching
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const convex = new ConvexHttpClient(convexUrl!);

  // Fetch the dashboard data from Convex
  const studentUnits = await convex.query(api.student.getDashboardData, {
    userId: user.id as Id<"profiles">,
  });

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Student Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Welcome back to your learning journey, {user.user_metadata?.username || user.email}!
        </p>

        {studentUnits.length === 0 ? (
          <div className="text-center text-muted-foreground border rounded-xl p-12 bg-background">
            No lessons available yet. Please check back later or contact your teacher.
          </div>
        ) : (
          <div className="space-y-8">
            {studentUnits.map((unit: any) => (
              <div key={unit.unitNumber}>
                <h2 className="text-3xl font-semibold mb-4">{unit.unitTitle}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {unit.lessons.map((lesson: any) => (
                    <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">
                          Unit {lesson.unitNumber}
                        </Badge>
                        <CardTitle className="text-xl">
                          <Link href={`/student/lesson/${lesson.slug}`} className="hover:underline">
                            {lesson.title}
                          </Link>
                        </CardTitle>
                        {lesson.description && (
                          <CardDescription>{lesson.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>Progress</span>
                          <span>{lesson.completedPhases}/{lesson.totalPhases} phases ({lesson.progressPercentage}%)</span>
                        </div>
                        <Progress value={lesson.progressPercentage} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
