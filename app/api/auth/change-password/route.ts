import { z } from "zod";

import { PASSWORD_HASH_ITERATIONS } from "@/lib/auth/constants";
import { getRequestSessionClaims } from "@/lib/auth/server";
import { generatePasswordSalt, hashPassword, verifyPassword } from "@/lib/auth/session";
import { getPasswordRequirementText, validatePasswordForRole } from "@/lib/auth/password-policy";
import { fetchInternalMutation, fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";

const requestSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(1, "New password is required"),
  confirmPassword: z.string().min(1, "Password confirmation is required"),
});

export async function POST(request: Request) {
  try {
    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsedBody = requestSchema.safeParse(body);
    if (!parsedBody.success) {
      return Response.json(
        { error: "Invalid request payload", details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword, confirmPassword } = parsedBody.data;

    if (newPassword !== confirmPassword) {
      return Response.json(
        { error: "New password and confirmation do not match." },
        { status: 400 },
      );
    }

    const policyError = validatePasswordForRole(claims.role, newPassword);
    if (policyError) {
      return Response.json(
        { error: policyError, requirement: getPasswordRequirementText(claims.role) },
        { status: 400 },
      );
    }

    const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, {
      username: claims.username,
    });

    if (!credential || credential.profileId !== claims.sub) {
      return Response.json({ error: "Credential not found" }, { status: 404 });
    }

    const isCurrentPasswordValid = await verifyPassword(currentPassword, {
      salt: credential.passwordSalt,
      iterations: credential.passwordHashIterations ?? PASSWORD_HASH_ITERATIONS,
      passwordHash: credential.passwordHash,
    });

    if (!isCurrentPasswordValid) {
      return Response.json(
        { error: "Current password is incorrect." },
        { status: 403 },
      );
    }

    const passwordSalt = generatePasswordSalt();
    const passwordHash = await hashPassword(
      newPassword,
      passwordSalt,
      PASSWORD_HASH_ITERATIONS,
    );

    const result = await fetchInternalMutation(internal.auth.changeOwnPassword, {
      profileId: claims.sub as Id<"profiles">,
      passwordHash,
      passwordSalt,
      passwordHashIterations: PASSWORD_HASH_ITERATIONS,
    });

    if (!result.ok) {
      return Response.json({ error: "Failed to update password." }, { status: 500 });
    }

    return Response.json({
      ok: true,
      username: result.username,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Unexpected error in change-password", error);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
