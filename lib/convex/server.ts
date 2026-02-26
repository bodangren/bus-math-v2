import { ConvexHttpClient } from "convex/browser";
import { api, internal } from "@/convex/_generated/api";

let convexClient: ConvexHttpClient | null = null;
let internalConvexClient: ConvexHttpClient | null = null;

interface ConvexHttpClientWithAdminAuth extends ConvexHttpClient {
  setAdminAuth: (token: string, actingAsIdentity?: string) => void;
}

function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";
    convexClient = new ConvexHttpClient(url);
  }
  return convexClient;
}

function getInternalConvexClient(): ConvexHttpClient {
  if (!internalConvexClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";
    internalConvexClient = new ConvexHttpClient(url);
  }

  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  if (!deployKey) {
    throw new Error("Missing CONVEX_DEPLOY_KEY for internal Convex calls");
  }

  (internalConvexClient as ConvexHttpClientWithAdminAuth).setAdminAuth(deployKey);
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
  return getInternalConvexClient().query(ref, args);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchInternalMutation(ref: any, args: Record<string, unknown>): Promise<any> {
  return getInternalConvexClient().mutation(ref, args);
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
