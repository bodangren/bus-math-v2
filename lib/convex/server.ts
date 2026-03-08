import { ConvexHttpClient } from "convex/browser";
import { api, internal } from "@/convex/_generated/api";
import { resolveConvexAdminAuth } from "@/lib/convex/admin";
import { getConvexUrl } from "@/lib/convex/config";

let convexClient: ConvexHttpClient | null = null;
let internalConvexClient: ConvexHttpClient | null = null;

interface ConvexHttpClientWithAdminAuth extends ConvexHttpClient {
  setAdminAuth: (token: string, actingAsIdentity?: string) => void;
}

function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(getConvexUrl());
  }
  return convexClient;
}

async function getInternalConvexClient(): Promise<ConvexHttpClient> {
  if (!internalConvexClient) {
    internalConvexClient = new ConvexHttpClient(getConvexUrl());
  }

  const adminAuth = await resolveConvexAdminAuth();
  (internalConvexClient as ConvexHttpClientWithAdminAuth).setAdminAuth(adminAuth.token);
  return internalConvexClient;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchQuery(ref: any, args: Record<string, unknown>): Promise<any> {
  return getConvexClient().query(ref, args);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchMutation(ref: any, args: Record<string, unknown>): Promise<any> {
  return getConvexClient().mutation(ref, args);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchInternalQuery(ref: any, args: Record<string, unknown>): Promise<any> {
  const client = await getInternalConvexClient();
  return client.query(ref, args);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchInternalMutation(ref: any, args: Record<string, unknown>): Promise<any> {
  const client = await getInternalConvexClient();
  return client.mutation(ref, args);
}

interface SupabaseUserLike {
  id?: string;
  email?: string | null;
  user_metadata?: {
    username?: unknown;
  } | null;
}

function extractUsername(user: SupabaseUserLike): string | null {
  const fromMetadata =
    user.user_metadata && typeof user.user_metadata.username === "string"
      ? user.user_metadata.username.trim()
      : "";

  if (fromMetadata.length > 0) {
    return fromMetadata;
  }

  if (typeof user.email === "string" && user.email.includes("@")) {
    const [localPart] = user.email.split("@");
    const username = localPart?.trim();
    if (username) return username;
  }

  return null;
}

export async function resolveConvexProfileIdFromSupabaseUser(
  user: SupabaseUserLike,
): Promise<string | null> {
  if (typeof user.id === "string" && user.id.length > 0) {
    return user.id;
  }

  const username = extractUsername(user);
  if (!username) return null;

  const profile = await fetchQuery(api.activities.getProfileByUsername, { username });
  return profile?.id ?? null;
}

export { api, internal };
