import { describe, expect, it, vi, beforeEach, afterAll, beforeAll } from "vitest";

const mockCreateClient = vi.fn();
const mockGetSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Ideally we'd test logic, but let's test the route proxy first
let route: { POST: (req: Request) => Promise<Response> };

const originalFetch = global.fetch;

beforeAll(async () => {
  global.fetch = vi.fn() as unknown as typeof fetch;
  route = await import("../../../../../app/api/users/bulk-create-students/route");
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
  mockCreateClient.mockReturnValue({
    auth: {
      getSession: mockGetSession,
    },
  });
});

describe("POST /api/users/bulk-create-students (Integration)", () => {
  it("successfully processes a class of 30 students", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });

    // Generate 30 students
    const students = Array.from({ length: 30 }, (_, i) => ({
      firstName: `Student${i}`,
      lastName: `Test${i}`,
      preferredUsername: `student${i}`
    }));

    // Mock the edge function response
    const mockEdgeResponse = {
      totalCreated: 30,
      students: students.map((s, i) => ({
        username: s.preferredUsername,
        password: `pass${i}`,
        id: `uuid-${i}`
      }))
    };

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(new Response(
      JSON.stringify(mockEdgeResponse),
      { status: 201 }
    ));

    const request = new Request("http://localhost/api/users/bulk-create-students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students }),
    });

    const response = await route.POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.totalCreated).toBe(30);
    expect(json.students).toHaveLength(30);
    
    // Verify the payload sent to the edge function
    expect(global.fetch).toHaveBeenCalledWith(
      "https://demo.supabase.co/functions/v1/bulk-create-students",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"firstName":"Student29"'),
      })
    );
  });
});
