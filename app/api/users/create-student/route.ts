import { getRequestSessionClaims } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EDGE_FUNCTION_PATH = "/functions/v1/create-student";

export async function POST(request: Request) {
  try {
    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: teacherProfile, error: teacherError } = await admin
      .from("profiles")
      .select("id, role, organization_id")
      .eq("id", claims.sub)
      .maybeSingle();

    if (teacherError || !teacherProfile) {
      return Response.json({ error: "Teacher profile not found" }, { status: 403 });
    }

    if (teacherProfile.role !== "teacher" && teacherProfile.role !== "admin") {
      return Response.json({ error: "Only teachers can create students" }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl) {
      return Response.json({ error: "Supabase URL is not configured" }, { status: 500 });
    }
    if (!supabaseServiceRoleKey) {
      return Response.json({ error: "Supabase service role key is not configured" }, { status: 500 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const response = await fetch(`${supabaseUrl}${EDGE_FUNCTION_PATH}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
    });

    const payload = await safeParseJson(response);
    return Response.json(payload, { status: response.status });
  } catch (error) {
    console.error("Failed to invoke create-student edge function", error);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}

async function safeParseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return { error: "Unexpected response from edge function" };
  }
}
