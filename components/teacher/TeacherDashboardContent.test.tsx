import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import {
  TeacherDashboardContent,
  formatLastActive,
  type StudentDashboardRow,
} from "./TeacherDashboardContent";

const sampleStudents: StudentDashboardRow[] = [
  {
    id: "student-1",
    username: "demo_student",
    displayName: "Demo Student",
    completedPhases: 12,
    totalPhases: 18,
    progressPercentage: 66.7,
    lastActive: "2025-11-13T09:00:00.000Z",
  },
  {
    id: "student-2",
    username: "quiet_student",
    displayName: null,
    completedPhases: 18,
    totalPhases: 18,
    progressPercentage: 100,
    lastActive: "2025-10-20T09:00:00.000Z",
  },
];

describe("TeacherDashboardContent", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-11-14T12:00:00.000Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("renders teacher metadata and student progress table", () => {
    render(
      <TeacherDashboardContent
        teacher={{ username: "demo_teacher", organizationName: "Demo School" }}
        students={sampleStudents}
      />,
    );

    expect(
      screen.getByText(/Teacher Dashboard — demo_teacher/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Demo School")).toBeInTheDocument();
    expect(screen.getByText("Demo Student")).toBeInTheDocument();
    expect(screen.getByText("@quiet_student")).toBeInTheDocument();
    expect(screen.getByText("12 / 18")).toBeInTheDocument();
    expect(screen.getByText("18 / 18")).toBeInTheDocument();
    expect(screen.getByText("1 active in the last 7 days")).toBeInTheDocument();
    expect(screen.getByText("Students at 100% completion")).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")[0]).toHaveAttribute(
      "aria-valuenow",
      "67",
    );
  });

  it("shows empty state when no students are present", () => {
    render(
      <TeacherDashboardContent
        teacher={{ username: "demo_teacher", organizationName: "Demo School" }}
        students={[]}
      />,
    );

    expect(
      screen.getByText(/no students are associated with your organization yet/i),
    ).toBeInTheDocument();
  });
});

describe("formatLastActive", () => {
  it("formats timestamps and handles missing values", () => {
    expect(formatLastActive("2025-11-14T09:15:00.000Z")).toMatch(/2025/);
    expect(formatLastActive(null)).toBe("No activity recorded");
    expect(formatLastActive("invalid")).toBe("No activity recorded");
  });
});
