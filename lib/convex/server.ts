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

export { api, internal };
