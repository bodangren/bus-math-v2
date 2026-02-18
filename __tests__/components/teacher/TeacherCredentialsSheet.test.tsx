import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TeacherCredentialsSheet } from "@/components/teacher/TeacherCredentialsSheet";

// The component opens a new window and calls win.print() inside win.setTimeout.
// We mock window.open to return a fake window and execute setTimeout immediately
// so we can assert on win.print without real timers.
const mockPrint = vi.fn();
const mockClose = vi.fn();
const mockFocus = vi.fn();
const mockWrite = vi.fn();
const mockDocClose = vi.fn();

const fakeWindow = {
  document: { write: mockWrite, close: mockDocClose },
  focus: mockFocus,
  close: mockClose,
  print: mockPrint,
  setTimeout: (fn: () => void) => fn(), // execute synchronously; extra args ignored
  location: { origin: 'http://localhost' },
} as unknown as Window;

vi.spyOn(window, 'open').mockReturnValue(fakeWindow);

describe("TeacherCredentialsSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStudents = [
    { username: "john.doe", password: "p1", displayName: "John Doe", email: "j@d.com" },
    { username: "jane.smith", password: "p2", displayName: "Jane Smith", email: "j@s.com" },
  ];

  it("renders student credentials correctly", () => {
    render(<TeacherCredentialsSheet students={mockStudents} onClose={() => {}} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe")).toBeInTheDocument();
    expect(screen.getByText("p1")).toBeInTheDocument();

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane.smith")).toBeInTheDocument();
    expect(screen.getByText("p2")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(<TeacherCredentialsSheet students={mockStudents} onClose={handleClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it("triggers window.print when print button is clicked", () => {
    render(<TeacherCredentialsSheet students={mockStudents} onClose={() => {}} />);

    const printButton = screen.getByRole("button", { name: /print/i });
    fireEvent.click(printButton);

    expect(mockPrint).toHaveBeenCalled();
  });
});
