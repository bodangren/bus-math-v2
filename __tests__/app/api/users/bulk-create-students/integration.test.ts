import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetRequestSessionClaims = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
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
  mockGetRequestSessionClaims.mockResolvedValue({
    sub: "teacher-1",
    username: "teacher",
    role: "teacher",
    iat: 1,
    exp: 2,
  });
});

describe("POST /api/users/bulk-create-students (Integration)", () => {
  it("successfully creates a class of 30 students with unique usernames", async () => {
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ data: TEACHER_PROFILE, error: null }));
    mockFrom.mockReturnValue(makeQueryBuilder({ count: 0, error: null }));

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

    const usernames = json.students.map((s: { username: string }) => s.username);
    expect(new Set(usernames).size).toBe(30);
    expect(json.students.every((s: { password: string }) => s.password.length >= 8)).toBe(true);
    expect(mockCreateUser).toHaveBeenCalledTimes(30);
  });

  it("rolls back all created users when one profile insert fails mid-batch", async () => {
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ data: TEACHER_PROFILE, error: null }));

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
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
    expect(mockDeleteUser).toHaveBeenCalled();
  });
});
