// @ts-expect-error - Deno edge runtime import resolved at deploy time
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-expect-error - Supabase client import for Deno edge runtime
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  buildDisplayName,
  generateRandomPassword,
  generateUniqueUsername,
  sanitizeInput,
} from "./logic.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface BulkCreateStudentRequest {
  students?: Array<{
    firstName?: string;
    lastName?: string;
    displayName?: string;
    username?: string;
  }>;
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables for bulk-create-students edge function.");
  throw new Error("Supabase edge function misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: JSON_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const accessToken = authHeader.replace("Bearer", "").trim();

  if (!accessToken) {
    return jsonResponse({ error: "Missing access token" }, 401);
  }

  let payload: BulkCreateStudentRequest;
  try {
    payload = (await req.json()) as BulkCreateStudentRequest;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!payload.students || !Array.isArray(payload.students) || payload.students.length === 0) {
    return jsonResponse({ error: "Request must include a non-empty students array" }, 400);
  }

  if (payload.students.length > 100) {
    return jsonResponse({ error: "Maximum batch size is 100 students" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !userData?.user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const {
    data: teacherProfile,
    error: teacherProfileError,
  } = await supabase
    .from("profiles")
    .select("id, role, organization_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (teacherProfileError || !teacherProfile) {
    return jsonResponse({ error: "Teacher profile not found" }, 403);
  }

  if (teacherProfile.role !== "teacher" && teacherProfile.role !== "admin") {
    return jsonResponse({ error: "Only teachers can create students" }, 403);
  }

  const reservedUsernames = new Set<string>();
  const createdUserIds: string[] = [];
  const createdCredentials: Array<{
    username: string;
    password: string;
    displayName: string;
    email: string;
    organizationId: string;
  }> = [];

  try {
    for (const student of payload.students) {
      const firstName = sanitizeInput(student.firstName);
      const lastName = sanitizeInput(student.lastName);
      const displayName = sanitizeInput(student.displayName);
      const preferredUsername = sanitizeInput(student.username);

      const username = await generateUniqueUsername(
        { preferredUsername, firstName, lastName },
        {
          reserved: reservedUsernames,
          exists: async (candidate: string) => usernameExists(supabase, candidate),
        },
      );

      const password = generateRandomPassword();
      const resolvedDisplayName = displayName || buildDisplayName(firstName, lastName, username);

      const {
        data: createdUser,
        error: createUserError,
      } = await supabase.auth.admin.createUser({
        email: `${username}@internal.domain`,
        password,
        email_confirm: true,
        user_metadata: {
          role: "student",
          firstName,
          lastName,
          organizationId: teacherProfile.organization_id,
          createdBy: teacherProfile.id,
        },
      });

      if (createUserError || !createdUser?.user) {
        throw new Error(createUserError?.message ?? "Failed to create user");
      }

      createdUserIds.push(createdUser.user.id);

      const profilePayload = {
        id: createdUser.user.id,
        organization_id: teacherProfile.organization_id,
        username,
        role: "student",
        display_name: resolvedDisplayName,
        metadata: {
          firstName: firstName || null,
          lastName: lastName || null,
          createdBy: teacherProfile.id,
        },
      };

      const { error: profileError } = await supabase.from("profiles").insert(profilePayload);

      if (profileError) {
        throw new Error(`Failed to create profile for ${username}`);
      }

      createdCredentials.push({
        username,
        password,
        displayName: resolvedDisplayName,
        email: `${username}@internal.domain`,
        organizationId: teacherProfile.organization_id,
      });
    }
  } catch (error) {
    console.error("Bulk student creation failed. Rolling back.", error);

    await Promise.allSettled(
      createdUserIds.map((id) => supabase.auth.admin.deleteUser(id)),
    );

    return jsonResponse({ error: "Failed to create all students. No accounts were created." }, 500);
  }

  return jsonResponse(
    {
      totalCreated: createdCredentials.length,
      organizationId: teacherProfile.organization_id,
      students: createdCredentials,
    },
    201,
  );
});

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

async function usernameExists(client: SupabaseClient, candidate: string) {
  const { count, error } = await client
    .from("profiles")
    .select("id", { head: true, count: "exact" })
    .eq("username", candidate);

  if (error) {
    console.error("Failed to validate username", candidate, error.message);
    return true;
  }

  return Boolean(count);
}
