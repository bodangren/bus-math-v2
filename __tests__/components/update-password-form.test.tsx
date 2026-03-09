import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UpdatePasswordForm } from "../../components/update-password-form";

const mockFetch = vi.fn();

describe("UpdatePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockFetch);
  });

  it("renders the password form fields and student guidance", () => {
    render(
      <UpdatePasswordForm
        username="demo_student"
        role="student"
        organizationName="Demo Organization"
      />,
    );

    expect(screen.getByRole("heading", { name: /update your password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
  });

  it("blocks submission when the confirmation does not match", async () => {
    const user = userEvent.setup();

    render(
      <UpdatePasswordForm
        username="demo_student"
        role="student"
        organizationName="Demo Organization"
      />,
    );

    await user.type(screen.getByLabelText(/current password/i), "old-password");
    await user.type(screen.getByLabelText(/^new password$/i), "new-password");
    await user.type(screen.getByLabelText(/confirm new password/i), "different-password");
    await user.click(screen.getByRole("button", { name: /save password/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/do not match/i);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("submits to the password-change API and shows success feedback", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ ok: true, message: "Password updated successfully." }), {
        status: 200,
      }),
    );

    render(
      <UpdatePasswordForm
        username="demo_teacher"
        role="teacher"
        organizationName="Demo Organization"
      />,
    );

    await user.type(screen.getByLabelText(/current password/i), "old-password1");
    await user.type(screen.getByLabelText(/^new password$/i), "NewPassword1");
    await user.type(screen.getByLabelText(/confirm new password/i), "NewPassword1");
    await user.click(screen.getByRole("button", { name: /save password/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/change-password",
        expect.objectContaining({ method: "POST" }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
    });
  });
});
