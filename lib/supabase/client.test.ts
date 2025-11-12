import { describe, expect, it, vi, beforeEach } from "vitest";
import { createClient } from "./client";

// Mock the @supabase/ssr module
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn((url: string, key: string) => ({
    url,
    key,
    type: "browser",
  })),
}));

describe("lib/supabase/client", () => {
  beforeEach(() => {
    // Set up environment variables for testing
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-anon-key";
  });

  it("creates a browser client with correct environment variables", () => {
    const client = createClient();

    expect(client).toBeDefined();
    expect(client).toHaveProperty("url", "https://test.supabase.co");
    expect(client).toHaveProperty("key", "test-anon-key");
    expect(client).toHaveProperty("type", "browser");
  });

  it("uses NEXT_PUBLIC_ prefixed environment variables", () => {
    const client = createClient();

    // Browser client should use public env vars
    expect(client.url).toBe(process.env.NEXT_PUBLIC_SUPABASE_URL);
    expect(client.key).toBe(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  });
});
