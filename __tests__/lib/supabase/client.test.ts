import { describe, expect, it, vi, beforeEach } from "vitest";
import { createClient } from "../../../lib/supabase/client";
import { createBrowserClient } from "@supabase/ssr";

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
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key"
    );
  });

  it("uses NEXT_PUBLIC_ prefixed environment variables", () => {
    createClient();
    const mockedCreateBrowserClient = vi.mocked(createBrowserClient);
    const [urlArg, keyArg] = mockedCreateBrowserClient.mock.calls[0] ?? [];

    // Browser client should use public env vars
    expect(urlArg).toBe(process.env.NEXT_PUBLIC_SUPABASE_URL);
    expect(keyArg).toBe(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  });
});
