import { describe, expect, it, vi, beforeEach, afterAll, beforeAll } from "vitest";

const mockCreateClient = vi.fn();
const mockGetSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const { POST } = await import("./route");

const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
  if (originalSupabaseUrl) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  } else {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
});

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateClient.mockResolvedValue({
    auth: {
      getSession: mockGetSession,
    },
  });
});

describe("POST /api/users/create-student", () => {
  it("returns 401 when no active session exists", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const request = new Request("http://localhost/api/users/create-student", {
      method: "POST",
      body: JSON.stringify({ firstName: "Ada" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("forwards payload to edge function and surfaces success", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });

    const edgeResponse = new Response(
      JSON.stringify({ username: "ada_l", password: "pass1234" }),
      { status: 201 },
    );
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(edgeResponse);

    const request = new Request("http://localhost/api/users/create-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Ada", lastName: "L" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://demo.supabase.co/functions/v1/create-student",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
          "Content-Type": "application/json",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(json.username).toBe("ada_l");
  });

  it("propagates edge function errors", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });

    const edgeResponse = new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(edgeResponse);

    const request = new Request("http://localhost/api/users/create-student", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe("Forbidden");
  });
});
