import { describe, expect, it, vi, beforeEach, afterAll, beforeAll } from "vitest";

const mockGetRequestSessionClaims = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const { POST } = await import("../../../../../app/api/users/create-student/route");

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

  if (originalServiceRoleKey) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
  } else {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
});

function makeQueryBuilder(value: unknown) {
  const self: Record<string, unknown> = {
    select: vi.fn(() => self),
    eq: vi.fn(() => self),
    maybeSingle: vi.fn().mockResolvedValue(value),
    then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(value).then(resolve, reject),
  };
  return self;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetRequestSessionClaims.mockResolvedValue({
    sub: "teacher-1",
    username: "teacher",
    role: "teacher",
    iat: 1,
    exp: 2,
  });
  mockFrom.mockReturnValue(
    makeQueryBuilder({
      data: { id: "teacher-1", role: "teacher", organization_id: "org-1" },
      error: null,
    }),
  );
});

describe("POST /api/users/create-student", () => {
  it("returns 401 when no active session exists", async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

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

  it("returns 403 when requester is not teacher/admin", async () => {
    mockFrom.mockReturnValue(
      makeQueryBuilder({ data: { id: "teacher-1", role: "student", organization_id: "org-1" }, error: null }),
    );

    const request = new Request("http://localhost/api/users/create-student", {
      method: "POST",
      body: JSON.stringify({ firstName: "Ada" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/only teachers/i);
  });

  it("forwards payload to edge function and surfaces success", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

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
          Authorization: "Bearer service-role-key",
          "Content-Type": "application/json",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(json.username).toBe("ada_l");
  });

  it("propagates edge function errors", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

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
