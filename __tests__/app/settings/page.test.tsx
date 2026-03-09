import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import SettingsPage from "../../../app/settings/page";

const { mockGetServerSessionClaims, mockFetchInternalQuery } = vi.hoisted(() => ({
  mockGetServerSessionClaims: vi.fn(),
  mockFetchInternalQuery: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  getServerSessionClaims: mockGetServerSessionClaims,
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    auth: {
      getAccountSettingsContext: "internal.auth.getAccountSettingsContext",
    },
  },
}));

describe("/settings page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders account context and the password form for authenticated users", async () => {
    mockGetServerSessionClaims.mockResolvedValue({
      sub: "profile-1",
      username: "demo_student",
      role: "student",
      organizationId: "org-1",
      iat: 1,
      exp: 2,
    });
    mockFetchInternalQuery.mockResolvedValue({
      id: "profile-1",
      username: "demo_student",
      role: "student",
      displayName: "Demo Student",
      organizationName: "Demo Organization",
    });

    const component = await SettingsPage();
    render(component);

    expect(screen.getByRole("heading", { name: /account settings/i })).toBeInTheDocument();
    expect(screen.getByText(/demo student/i)).toBeInTheDocument();
    expect(screen.getAllByText(/demo organization/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
  });

  it("shows a sign-in prompt when no session exists", async () => {
    mockGetServerSessionClaims.mockResolvedValue(null);

    const component = await SettingsPage();
    render(component);

    expect(screen.getByText(/sign in to manage your account/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to login/i })).toHaveAttribute(
      "href",
      "/auth/login?redirect=%2Fsettings",
    );
  });
});
