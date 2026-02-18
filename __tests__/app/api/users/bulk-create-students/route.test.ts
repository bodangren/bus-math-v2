import { describe, expect, it, vi, beforeEach } from "vitest";

// ── mocks ────────────────────────────────────────────────────────────────────

const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}));

const mockFrom = vi.fn();
const mockCreateUser = vi.fn();
const mockDeleteUser = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
    auth: { admin: { createUser: mockCreateUser, deleteUser: mockDeleteUser } },
  })),
}));

const { POST } = await import("../../../../../app/api/users/bulk-create-students/route");

// ── helpers ───────────────────────────────────────────────────────────────────

const TEACHER_PROFILE = { id: "teacher-1", role: "teacher", organization_id: "org-1" };
const STUDENT_USER = { user: { id: "student-uid-1" } };

/** Returns a Supabase-style query builder that resolves to `value` when awaited
 *  and also supports `.maybeSingle()` and `.insert()`. */
function makeQueryBuilder(value: unknown) {
  const self: Record<string, unknown> = {
    select: vi.fn(() => self),
    eq: vi.fn(() => self),
    maybeSingle: vi.fn().mockResolvedValue(value),
    insert: vi.fn().mockResolvedValue(value),
    upsert: vi.fn().mockResolvedValue(value),
    then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(value).then(resolve, reject),
  };
  return self;
}

function sessionWith(userId = "teacher-1") {
  return { data: { user: { id: userId } }, error: null };
}

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/users/bulk-create-students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── tests ────────────────────────────────────────────────────────────────────

describe("POST /api/users/bulk-create-students", () => {
  it("returns 401 when there is no active session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(makeRequest({ students: [{ firstName: "Ada" }] }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns 400 for an empty students array", async () => {
    mockGetUser.mockResolvedValue(sessionWith());

    const response = await POST(makeRequest({ students: [] }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/non-empty/i);
  });

  it("returns 400 when batch exceeds 100 students", async () => {
    mockGetUser.mockResolvedValue(sessionWith());

    const response = await POST(makeRequest({ students: new Array(101).fill({ firstName: "X" }) }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/maximum batch size/i);
  });

  it("returns 403 when teacher profile is not found", async () => {
    mockGetUser.mockResolvedValue(sessionWith());
    mockFrom.mockReturnValue(makeQueryBuilder({ data: null, error: null }));

    const response = await POST(makeRequest({ students: [{ firstName: "Ada" }] }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/teacher profile not found/i);
  });

  it("returns 403 when the caller is not a teacher or admin", async () => {
    mockGetUser.mockResolvedValue(sessionWith());
    mockFrom.mockReturnValue(
      makeQueryBuilder({ data: { ...TEACHER_PROFILE, role: "student" }, error: null }),
    );

    const response = await POST(makeRequest({ students: [{ firstName: "Ada" }] }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/only teachers/i);
  });

  it("returns 201 and creates the student account", async () => {
    mockGetUser.mockResolvedValue(sessionWith());

    // First from() call → teacher profile lookup
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ data: TEACHER_PROFILE, error: null }));
    // Second from() call → username existence check (count: 0 = username free)
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ count: 0, error: null }));
    // Third from() call → profile insert
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ error: null }));

    mockCreateUser.mockResolvedValue({ data: STUDENT_USER, error: null });

    const response = await POST(makeRequest({ students: [{ firstName: "Ada", lastName: "Lovelace" }] }));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.totalCreated).toBe(1);
    expect(json.students[0].username).toBe("ada_lovelace");
    expect(json.students[0]).toHaveProperty("password");
    expect(mockCreateUser).toHaveBeenCalledOnce();
  });

  it("rolls back created users and returns 500 when a profile insert fails", async () => {
    mockGetUser.mockResolvedValue(sessionWith());

    mockFrom.mockReturnValueOnce(makeQueryBuilder({ data: TEACHER_PROFILE, error: null }));
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ count: 0, error: null }));
    // Profile insert fails
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ error: { message: "insert failed" } }));

    mockCreateUser.mockResolvedValue({ data: STUDENT_USER, error: null });
    mockDeleteUser.mockResolvedValue({ error: null });

    const response = await POST(makeRequest({ students: [{ firstName: "Ada" }] }));
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toMatch(/no accounts were created/i);
    expect(mockDeleteUser).toHaveBeenCalledWith("student-uid-1");
  });
});
