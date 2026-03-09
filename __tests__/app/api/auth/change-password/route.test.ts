import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetRequestSessionClaims, mockFetchInternalMutation } = vi.hoisted(() => ({
  mockGetRequestSessionClaims: vi.fn(),
  mockFetchInternalMutation: vi.fn(),
}));
const {
  mockFetchInternalQuery,
  mockGeneratePasswordSalt,
  mockHashPassword,
  mockVerifyPassword,
} = vi.hoisted(() => ({
  mockFetchInternalQuery: vi.fn(),
  mockGeneratePasswordSalt: vi.fn(),
  mockHashPassword: vi.fn(),
  mockVerifyPassword: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    auth: {
      getCredentialByUsername: "internal.auth.getCredentialByUsername",
      changeOwnPassword: "internal.auth.changeOwnPassword",
    },
  },
}));

vi.mock("@/lib/auth/session", () => ({
  generatePasswordSalt: mockGeneratePasswordSalt,
  hashPassword: mockHashPassword,
  verifyPassword: mockVerifyPassword,
}));

const { POST } = await import("../../../../../app/api/auth/change-password/route");

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: "session=token",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/change-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: "profile-1",
      username: "demo_student",
      role: "student",
      organizationId: "org-1",
      iat: 1,
      exp: 2,
    });
    mockFetchInternalQuery.mockResolvedValue({
      profileId: "profile-1",
      username: "demo_student",
      passwordSalt: "salt-1",
      passwordHashIterations: 120000,
      passwordHash: "hash-1",
    });
    mockGeneratePasswordSalt.mockReturnValue("fresh-salt");
    mockHashPassword.mockResolvedValue("fresh-hash");
    mockVerifyPassword.mockResolvedValue(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await POST(
      buildRequest({
        currentPassword: "old-password",
        newPassword: "new-password",
        confirmPassword: "new-password",
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toMatch(/unauthorized/i);
  });

  it("returns 400 when the request body is invalid", async () => {
    const response = await POST(buildRequest({ currentPassword: "" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/invalid request payload/i);
  });

  it("returns 400 when the new password confirmation does not match", async () => {
    const response = await POST(
      buildRequest({
        currentPassword: "old-password",
        newPassword: "new-password",
        confirmPassword: "different-password",
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/do not match/i);
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it("returns 400 when the new student password is too short", async () => {
    const response = await POST(
      buildRequest({
        currentPassword: "old-password",
        newPassword: "short",
        confirmPassword: "short",
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/at least 6 characters/i);
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it("returns 403 when the current password is incorrect", async () => {
    mockVerifyPassword.mockResolvedValue(false);

    const response = await POST(
      buildRequest({
        currentPassword: "wrong-password",
        newPassword: "new-password",
        confirmPassword: "new-password",
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/current password/i);
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it("changes the password when the request is valid", async () => {
    mockFetchInternalMutation.mockResolvedValue({
      ok: true,
      profileId: "profile-1",
      username: "demo_student",
    });

    const response = await POST(
      buildRequest({
        currentPassword: "old-password",
        newPassword: "new-password",
        confirmPassword: "new-password",
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.username).toBe("demo_student");
    expect(mockFetchInternalQuery).toHaveBeenCalledWith(
      "internal.auth.getCredentialByUsername",
      { username: "demo_student" },
    );
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      "internal.auth.changeOwnPassword",
      expect.objectContaining({
        profileId: "profile-1",
        passwordHash: "fresh-hash",
        passwordSalt: "fresh-salt",
        passwordHashIterations: expect.any(Number),
      }),
    );
  });
});
