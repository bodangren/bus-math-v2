import { createAdminClient } from "@/lib/supabase/admin";
import { getRequestSessionClaims } from "@/lib/auth/server";

// ── helpers (ported from supabase/functions/bulk-create-students/logic.ts) ──

function sanitizeInput(value?: string): string {
  if (!value || typeof value !== "string") return "";
  return value.trim().slice(0, 50);
}

function slugify(value?: string): string {
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

async function generateUniqueUsername(
  opts: { preferredUsername?: string; firstName?: string; lastName?: string },
  ctx: { exists: (candidate: string) => Promise<boolean>; reserved: Set<string> },
): Promise<string> {
  const base =
    slugify(opts.preferredUsername) ||
    slugify(`${opts.firstName ?? ""}_${opts.lastName ?? ""}`) ||
    "student";

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = attempt === 0 ? base : `${base}_${(attempt + 1).toString().padStart(2, "0")}`;
    if (ctx.reserved.has(candidate)) continue;
    const taken = await ctx.exists(candidate);
    if (!taken) {
      ctx.reserved.add(candidate);
      return candidate;
    }
  }

  const fallback = `${base}_${crypto.randomUUID().slice(0, 4)}`;
  ctx.reserved.add(fallback);
  return fallback;
}

function buildDisplayName(firstName: string, lastName: string, fallback: string): string {
  const capitalize = (v: string) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : "");
  const combined = [capitalize(firstName), capitalize(lastName)].filter(Boolean).join(" ");
  return combined || fallback;
}

function generateRandomPassword(length = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet.charAt(byte % alphabet.length)).join("");
}

// ── types ────────────────────────────────────────────────────────────────────

interface StudentInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
}

// ── handler ──────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { students?: StudentInput[] };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.students || !Array.isArray(body.students) || body.students.length === 0) {
      return Response.json({ error: "Request must include a non-empty students array" }, { status: 400 });
    }

    if (body.students.length > 100) {
      return Response.json({ error: "Maximum batch size is 100 students" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: teacherProfile, error: teacherProfileError } = await admin
      .from("profiles")
      .select("id, role, organization_id")
      .eq("id", claims.sub)
      .maybeSingle();

    if (teacherProfileError || !teacherProfile) {
      return Response.json({ error: "Teacher profile not found" }, { status: 403 });
    }

    if (teacherProfile.role !== "teacher" && teacherProfile.role !== "admin") {
      return Response.json({ error: "Only teachers can create students" }, { status: 403 });
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
      for (const student of body.students) {
        const firstName = sanitizeInput(student.firstName);
        const lastName = sanitizeInput(student.lastName);
        const displayName = sanitizeInput(student.displayName);
        const preferredUsername = sanitizeInput(student.username);

        const username = await generateUniqueUsername(
          { preferredUsername, firstName, lastName },
          {
            reserved: reservedUsernames,
            exists: async (candidate) => {
              const { count, error } = await admin
                .from("profiles")
                .select("id", { head: true, count: "exact" })
                .eq("username", candidate);
              if (error) return true;
              return Boolean(count);
            },
          },
        );

        const password = generateRandomPassword();
        const resolvedDisplayName = displayName || buildDisplayName(firstName, lastName, username);

        const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
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

        // upsert: the on_auth_user_created trigger auto-creates a stub profile
        // the moment createUser fires; upsert overwrites it with the correct values.
        const { error: profileError } = await admin.from("profiles").upsert({
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
        });

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
      await Promise.allSettled(createdUserIds.map((id) => admin.auth.admin.deleteUser(id)));
      return Response.json(
        { error: "Failed to create all students. No accounts were created." },
        { status: 500 },
      );
    }

    return Response.json(
      {
        totalCreated: createdCredentials.length,
        organizationId: teacherProfile.organization_id,
        students: createdCredentials,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unexpected error in bulk-create-students", error);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
