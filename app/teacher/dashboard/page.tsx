import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Teacher Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Welcome to your teacher dashboard. This is a placeholder page for development.
        </p>

        <div className="grid gap-4">
          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              Teacher features including class management, student progress tracking,
              and lesson planning will be available here.
            </p>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Your Account</h3>
            <p className="text-sm text-muted-foreground">
              User ID: {user.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
