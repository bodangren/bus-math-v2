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

beforeEach(() => {
  vi.clearAllMocks();
});

// ── tests ────────────────────────────────────────────────────────────────────

describe("POST /api/users/bulk-create-students (Integration)", () => {
  it("successfully creates a class of 30 students with unique usernames", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "teacher-1" } },
      error: null,
    });

    // First call → teacher profile
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ data: TEACHER_PROFILE, error: null }));

    // Remaining calls → username check (count: 0) or profile insert (error: null)
    // Both resolve to the same shape when awaited via the generic builder
    mockFrom.mockReturnValue(makeQueryBuilder({ count: 0, error: null }));

    // Each student gets a unique auth user with a sequential ID
    mockCreateUser.mockImplementation(({ email }: { email: string }) =>
      Promise.resolve({ data: { user: { id: `uid-${email}` } }, error: null }),
    );

    const students = Array.from({ length: 30 }, (_, i) => ({
      firstName: `Student${i}`,
      lastName: `Test${i}`,
    }));

    const request = new Request("http://localhost/api/users/bulk-create-students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.totalCreated).toBe(30);
    expect(json.students).toHaveLength(30);

    // All usernames must be unique
    const usernames = json.students.map((s: { username: string }) => s.username);
    expect(new Set(usernames).size).toBe(30);

    // Every student has a password
    expect(json.students.every((s: { password: string }) => s.password.length >= 8)).toBe(true);

    // Auth admin.createUser called once per student
    expect(mockCreateUser).toHaveBeenCalledTimes(30);
  });

  it("rolls back all created users when one profile insert fails mid-batch", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "teacher-1" } },
      error: null,
    });

    mockFrom.mockReturnValueOnce(makeQueryBuilder({ data: TEACHER_PROFILE, error: null }));

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      // Fail the profile insert for the 3rd student (6th from() call: 1 teacher + 2*(check+insert) = calls 5 and 6)
      // We fail on the 6th subsequent call which is the insert for student 3
      if (fromCallCount === 6) {
        return makeQueryBuilder({ error: { message: "insert failed" } });
      }
      return makeQueryBuilder({ count: 0, error: null });
    });

    mockCreateUser.mockImplementation((_: unknown, idx = fromCallCount) =>
      Promise.resolve({ data: { user: { id: `uid-${idx}` } }, error: null }),
    );
    mockDeleteUser.mockResolvedValue({ error: null });

    const students = Array.from({ length: 5 }, (_, i) => ({
      firstName: `Student`,
      lastName: `${i}`,
    }));

    const request = new Request("http://localhost/api/users/bulk-create-students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toMatch(/no accounts were created/i);
    // Rollback must be called for every user created before the failure
    expect(mockDeleteUser).toHaveBeenCalled();
  });
});
