import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TeacherBulkImportDialog } from "@/components/teacher/TeacherBulkImportDialog";

// Mock createPortal to render in the same DOM tree for easier testing
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe("TeacherBulkImportDialog", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock window.fetch
    global.fetch = vi.fn();
  });

  it("renders the trigger button initially", () => {
    render(<TeacherBulkImportDialog />);
    expect(screen.getByRole("button", { name: /bulk import/i })).toBeInTheDocument();
  });

  it("opens the dialog when trigger button is clicked", () => {
    render(<TeacherBulkImportDialog />);
    fireEvent.click(screen.getByRole("button", { name: /bulk import/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/paste student names/i)).toBeInTheDocument();
  });

  it("parses input and moves to review step", async () => {
    render(<TeacherBulkImportDialog />);
    fireEvent.click(screen.getByRole("button", { name: /bulk import/i }));

    const textarea = screen.getByLabelText(/student names/i);
    fireEvent.change(textarea, { target: { value: "John Doe\nJane Smith" } });

    const nextButton = screen.getByRole("button", { name: /next: review/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john_doe")).toBeInTheDocument();
    });
  });

  it("normalizes duplicate and invalid usernames in the review step", async () => {
    render(<TeacherBulkImportDialog />);
    fireEvent.click(screen.getByRole("button", { name: /bulk import/i }));

    const textarea = screen.getByLabelText(/student names/i);
    fireEvent.change(textarea, {
      target: { value: "John Doe\nJohn Doe\nPrince" },
    });

    fireEvent.click(screen.getByRole("button", { name: /next: review/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("john_doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john_doe_02")).toBeInTheDocument();
      expect(screen.getByDisplayValue("prince")).toBeInTheDocument();
      expect(
        screen.getByText(/usernames are normalized before account creation/i),
      ).toBeInTheDocument();
    });
  });

  it("submits the form and shows success state", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        totalCreated: 2,
        students: [
          { username: "john.doe", password: "p1", displayName: "John Doe", email: "" },
          { username: "jane.smith", password: "p2", displayName: "Jane Smith", email: "" },
        ],
      }),
    });

    render(<TeacherBulkImportDialog />);
    fireEvent.click(screen.getByRole("button", { name: /bulk import/i }));

    const textarea = screen.getByLabelText(/student names/i);
    fireEvent.change(textarea, { target: { value: "John Doe\nJane Smith" } });
    fireEvent.click(screen.getByRole("button", { name: /next: review/i }));

    const submitButton = screen.getByRole("button", { name: /create 2 accounts/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/successfully created 2 student accounts/i)).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Simulated API Error" }),
    });

    render(<TeacherBulkImportDialog />);
    fireEvent.click(screen.getByRole("button", { name: /bulk import/i }));

    const textarea = screen.getByLabelText(/student names/i);
    fireEvent.change(textarea, { target: { value: "John Doe" } });
    fireEvent.click(screen.getByRole("button", { name: /next: review/i }));

    const submitButton = screen.getByRole("button", { name: /create 1 accounts/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Simulated API Error")).toBeInTheDocument();
    });
  });
});
