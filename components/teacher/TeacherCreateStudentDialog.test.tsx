import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { TeacherCreateStudentDialog } from "./TeacherCreateStudentDialog";

const originalFetch = global.fetch;
const user = userEvent.setup();

beforeAll(() => {
  global.fetch = vi.fn() as unknown as typeof fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(() => {
  (global.fetch as unknown as ReturnType<typeof vi.fn>).mockReset();
});

describe("TeacherCreateStudentDialog", () => {
  it("opens dialog and focuses the first field", async () => {
    render(<TeacherCreateStudentDialog />);

    await user.click(screen.getByRole("button", { name: /create student/i }));
    const dialog = await screen.findByRole("dialog");

    expect(dialog).toBeInTheDocument();
    expect(screen.getByLabelText(/First name/i)).toHaveFocus();
  });

  it("submits form data and displays credentials", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(
        JSON.stringify({
          username: "ada_lovelace",
          password: "Pa55word",
          displayName: "Ada Lovelace",
        }),
        { status: 201 },
      ),
    );

    render(<TeacherCreateStudentDialog />);

    await user.click(screen.getByRole("button", { name: /create student/i }));
    await user.type(screen.getByLabelText(/First name/i), "Ada");
    await user.type(screen.getByLabelText(/Last name/i), "Lovelace");
    await user.click(screen.getByRole("button", { name: /Create student account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Student created/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/users/create-student",
      expect.objectContaining({ method: "POST" }),
    );
    expect(screen.getByText("ada_lovelace")).toBeInTheDocument();
    expect(screen.getByText("Pa55word")).toBeInTheDocument();
  });
});
