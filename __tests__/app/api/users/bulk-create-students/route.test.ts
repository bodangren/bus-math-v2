import { describe, expect, it, vi, beforeEach, afterAll, beforeAll } from "vitest";

const mockCreateClient = vi.fn();
const mockGetSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const { POST } = await import("../../../../../app/api/users/bulk-create-students/route");

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

describe("POST /api/users/bulk-create-students", () => {
  it("returns 401 when no active session exists", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    const request = new Request("http://localhost/api/users/bulk-create-students", {
      method: "POST",
      body: JSON.stringify({ students: [{ firstName: "Ada" }] }),
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
      JSON.stringify({ totalCreated: 1, students: [{ username: "ada_l", password: "pass1234" }] }),
      { status: 201 },
    );
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(edgeResponse);

    const request = new Request("http://localhost/api/users/bulk-create-students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students: [{ firstName: "Ada", lastName: "L" }] }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://demo.supabase.co/functions/v1/bulk-create-students",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
          "Content-Type": "application/json",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(json.totalCreated).toBe(1);
    expect(json.students[0].username).toBe("ada_l");
  });

  it("propagates edge function errors", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });

    const edgeResponse = new Response(JSON.stringify({ error: "Maximum batch size exceeded" }), { status: 400 });
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(edgeResponse);

    const request = new Request("http://localhost/api/users/bulk-create-students", {
      method: "POST",
      body: JSON.stringify({ students: new Array(101).fill({ firstName: "Test" }) }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Maximum batch size exceeded");
  });
});
