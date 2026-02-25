import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

let convexClient: ConvexHttpClient | null = null;

function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";
    convexClient = new ConvexHttpClient(url);
  }
  return convexClient;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchQuery(ref: any, args: Record<string, unknown>): Promise<any> {
  return getConvexClient().query(ref, args);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchMutation(ref: any, args: Record<string, unknown>): Promise<any> {
  return getConvexClient().mutation(ref, args);
}

export { api };
