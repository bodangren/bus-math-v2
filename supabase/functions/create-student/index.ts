// @ts-ignore - Deno edge runtime import resolved at deploy time
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore - Supabase client import for Deno edge runtime
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface CreateStudentRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables for create-student edge function.");
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

  let payload: CreateStudentRequest;
  try {
    payload = (await req.json()) as CreateStudentRequest;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
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
    .select("id, role, organization_id, username, display_name")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (teacherProfileError || !teacherProfile) {
    return jsonResponse({ error: "Teacher profile not found" }, 403);
  }

  if (teacherProfile.role !== "teacher" && teacherProfile.role !== "admin") {
    return jsonResponse({ error: "Only teachers can create students" }, 403);
  }

  const firstName = sanitizeInput(payload.firstName);
  const lastName = sanitizeInput(payload.lastName);
  const displayName = sanitizeInput(payload.displayName);
  const preferredUsername = sanitizeInput(payload.username);

  const username = await generateUniqueUsername(supabase, {
    preferredUsername,
    firstName,
    lastName,
  });

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
    const status = createUserError?.message?.includes("already registered") ? 409 : 400;
    return jsonResponse({ error: createUserError?.message ?? "Failed to create user" }, status);
  }

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
    console.error("Failed to create profile for", username, profileError.message);
    await supabase.auth.admin.deleteUser(createdUser.user.id);
    return jsonResponse({ error: "Failed to create profile" }, 500);
  }

  return jsonResponse(
    {
      username,
      password,
      displayName: resolvedDisplayName,
      email: `${username}@internal.domain`,
      organizationId: teacherProfile.organization_id,
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

type UsernameOptions = {
  preferredUsername?: string;
  firstName?: string;
  lastName?: string;
};

async function generateUniqueUsername(
  client: SupabaseClient,
  { preferredUsername, firstName, lastName }: UsernameOptions,
) {
  const base =
    slugify(preferredUsername) ||
    slugify(`${firstName ?? ""}_${lastName ?? ""}`) ||
    "student";

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}_${(attempt + 1).toString().padStart(2, "0")}`;
    const { count, error } = await client
      .from("profiles")
      .select("id", { head: true, count: "exact" })
      .eq("username", candidate);

    if (error) {
      console.error("Failed to validate username", candidate, error.message);
      break;
    }

    if (!count) {
      return candidate;
    }
  }

  return `${base}_${crypto.randomUUID().slice(0, 4)}`;
}

function sanitizeInput(value?: string) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 50);
}

function slugify(value?: string) {
  if (!value) return "";

  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, 24);
}

function buildDisplayName(firstName: string, lastName: string, fallback: string) {
  const formattedFirst = capitalize(firstName);
  const formattedLast = capitalize(lastName);
  const combined = [formattedFirst, formattedLast].filter(Boolean).join(" ");
  return combined || fallback;
}

function capitalize(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function generateRandomPassword(length = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet.charAt(byte % alphabet.length)).join("");
}
