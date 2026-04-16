import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { StrugglingStudentsPanel } from "../../../../components/teacher/srs/StrugglingStudentsPanel";
import type { StudentStruggleMetrics } from "../../../../components/teacher/srs/StrugglingStudentsPanel";

describe("StrugglingStudentsPanel", () => {
  const sampleStudents: StudentStruggleMetrics[] = [
    {
      studentId: "student-1",
      username: "struggling_student",
      displayName: "Struggling Student",
      overdueCards: 12,
      totalCards: 30,
      totalReviews: 45,
      againRate: 0.45,
      lastActive: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
      studentId: "student-2",
      username: "moderate_student",
      displayName: "Moderate Student",
      overdueCards: 6,
      totalCards: 25,
      totalReviews: 40,
      againRate: 0.2,
      lastActive: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
    {
      studentId: "student-3",
      username: "good_student",
      displayName: null,
      overdueCards: 1,
      totalCards: 20,
      totalReviews: 35,
      againRate: 0.05,
      lastActive: Date.now() - 1000 * 60 * 60 * 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    render(<StrugglingStudentsPanel students={null} isLoading={true} />);

    expect(screen.getByText("Struggling Students")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders empty state when no students", () => {
    render(<StrugglingStudentsPanel students={[]} isLoading={false} />);

    expect(screen.getByText("Struggling Students")).toBeInTheDocument();
    expect(
      screen.getByText(/No students with struggling cards right now/i)
    ).toBeInTheDocument();
  });

  it("renders students with correct data", () => {
    render(<StrugglingStudentsPanel students={sampleStudents} isLoading={false} />);

    expect(screen.getByText("Struggling Student")).toBeInTheDocument();
    expect(screen.getByText("@struggling_student")).toBeInTheDocument();
    expect(screen.getByText("Moderate Student")).toBeInTheDocument();
    expect(screen.getByText("good_student")).toBeInTheDocument();
  });

  it("shows overdue card count", () => {
    render(<StrugglingStudentsPanel students={sampleStudents} isLoading={false} />);

    expect(screen.getAllByText("12").length).toBeGreaterThan(0);
    expect(screen.getAllByText("6").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });

  it("shows again rate as percentage", () => {
    render(<StrugglingStudentsPanel students={sampleStudents} isLoading={false} />);

    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();
  });

  it("shows struggle level badges", () => {
    render(<StrugglingStudentsPanel students={sampleStudents} isLoading={false} />);

    expect(screen.getAllByText("Critical").length).toBeGreaterThan(0);
    expect(screen.getAllByText("At Risk").length).toBeGreaterThan(0);
    expect(screen.getAllByText("On Track").length).toBeGreaterThan(0);
  });

  it("calls onResetCard when button is clicked", () => {
    const handleReset = vi.fn();
    render(
      <StrugglingStudentsPanel
        students={sampleStudents}
        onResetCard={handleReset}
        isLoading={false}
      />
    );

    const resetButtons = screen.getAllByText("Reset Card");
    expect(resetButtons.length).toBe(3);

    fireEvent.click(resetButtons[0]);
    expect(handleReset).toHaveBeenCalledWith("student-1", "Struggling Student");
  });

  it("shows total cards count", () => {
    render(<StrugglingStudentsPanel students={sampleStudents} isLoading={false} />);

    expect(screen.getAllByText("30").length).toBeGreaterThan(0);
    expect(screen.getAllByText("25").length).toBeGreaterThan(0);
    expect(screen.getAllByText("20").length).toBeGreaterThan(0);
  });

  it("shows last active timestamps", () => {
    render(<StrugglingStudentsPanel students={sampleStudents} isLoading={false} />);

    expect(screen.getByText("3 days ago")).toBeInTheDocument();
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });
});