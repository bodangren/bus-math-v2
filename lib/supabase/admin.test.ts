import { describe, expect, it, vi, beforeEach } from "vitest";
import { createAdminClient } from "./admin";

// Mock the @supabase/supabase-js module
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(
    (url: string, key: string, options: { auth: { autoRefreshToken: boolean; persistSession: boolean } }) => ({
      url,
      key,
      options,
      type: "admin",
    })
  ),
}));

describe("lib/supabase/admin", () => {
  beforeEach(() => {
    // Set up environment variables for testing
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  });

  it("creates an admin client with service role key", () => {
    const client = createAdminClient();

    expect(client).toBeDefined();
    expect(client).toHaveProperty("url", "https://test.supabase.co");
    expect(client).toHaveProperty("key", "test-service-role-key");
    expect(client).toHaveProperty("type", "admin");
  });

  it("configures auth options correctly", () => {
    const client = createAdminClient();

    expect(client.options.auth).toEqual({
      autoRefreshToken: false,
      persistSession: false,
    });
  });

  it("throws error if SUPABASE_URL is not set", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    expect(() => createAdminClient()).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL is not set"
    );
  });

  it("throws error if SUPABASE_SERVICE_ROLE_KEY is not set", () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminClient()).toThrow(
      "SUPABASE_SERVICE_ROLE_KEY is not set"
    );
  });

  it("uses non-public service role key (security check)", () => {
    const client = createAdminClient();

    // Service role key should NOT use NEXT_PUBLIC_ prefix
    expect(client.key).not.toContain("NEXT_PUBLIC");
    expect(client.key).toBe(process.env.SUPABASE_SERVICE_ROLE_KEY);
  });
});
