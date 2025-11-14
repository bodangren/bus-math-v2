import { createClient } from "@/lib/supabase/server";

const EDGE_FUNCTION_PATH = "/functions/v1/create-student";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return Response.json({ error: "Supabase URL is not configured" }, { status: 500 });
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
        Authorization: `Bearer ${session.access_token}`,
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
