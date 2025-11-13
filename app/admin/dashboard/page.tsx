import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Welcome to the administrative control panel. This is a placeholder page for development.
        </p>

        <div className="grid gap-4">
          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              Organization management, user administration, and system configuration
              will be available here.
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
