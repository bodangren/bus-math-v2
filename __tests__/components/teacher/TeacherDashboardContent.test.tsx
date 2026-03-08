import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import {
  TeacherDashboardContent,
  formatLastActive,
} from "../../../components/teacher/TeacherDashboardContent";
import type { StudentDashboardRow } from "../../../lib/teacher/intervention";

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

const emptyCourseOverview = { rows: [], units: [] };

const sampleCourseOverview = {
  rows: [
    {
      studentId: "student-1",
      displayName: "Demo Student",
      username: "demo_student",
      cells: [{ unitNumber: 1, avgMastery: 75, color: "yellow" as const }],
    },
    {
      studentId: "student-2",
      displayName: "quiet_student",
      username: "quiet_student",
      cells: [{ unitNumber: 1, avgMastery: 90, color: "green" as const }],
    },
  ],
  units: [{ unitNumber: 1 }],
};

describe("TeacherDashboardContent", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-11-14T12:00:00.000Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("renders teacher metadata and summary metrics", () => {
    render(
      <TeacherDashboardContent
        teacher={{ username: "demo_teacher", organizationName: "Demo School" }}
        students={sampleStudents}
        courseOverview={sampleCourseOverview}
      />,
    );

    expect(
      screen.getByText(/Teacher Dashboard — demo_teacher/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Demo School")).toBeInTheDocument();
    expect(screen.getByText("1 active in the last 7 days")).toBeInTheDocument();
    expect(screen.getByText("0 students need attention")).toBeInTheDocument();
    expect(screen.getAllByText("At Risk").length).toBeGreaterThan(0);
    expect(screen.getByText("Students at 100% completion")).toBeInTheDocument();
    expect(screen.getByText("Course Overview")).toBeInTheDocument();
  });

  it("renders the intervention roster with status badges and default priority ordering", () => {
    render(
      <TeacherDashboardContent
        teacher={{ username: "demo_teacher", organizationName: "Demo School" }}
        students={sampleStudents}
        courseOverview={sampleCourseOverview}
      />,
    );

    expect(screen.getByText("Student Intervention Queue")).toBeInTheDocument();
    const roster = within(screen.getByTestId("intervention-roster"));
    expect(roster.getAllByText("@demo_student").length).toBeGreaterThan(0);
    expect(roster.getAllByText("@quiet_student").length).toBeGreaterThan(0);
  });

  it("filters the intervention roster by selected status", async () => {
    render(
      <TeacherDashboardContent
        teacher={{ username: "demo_teacher", organizationName: "Demo School" }}
        students={sampleStudents}
        courseOverview={sampleCourseOverview}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^completed$/i }));

    const roster = within(screen.getByTestId("intervention-roster"));
    expect(roster.getAllByText("@quiet_student").length).toBeGreaterThan(0);
    expect(roster.queryByText("@demo_student")).not.toBeInTheDocument();
  });

  it("shows the CourseOverviewGrid in the main content area", () => {
    render(
      <TeacherDashboardContent
        teacher={{ username: "demo_teacher", organizationName: "Demo School" }}
        students={sampleStudents}
        courseOverview={sampleCourseOverview}
      />,
    );

    // Grid should render with student rows from courseOverview (not the student progress list)
    expect(
      screen.getByRole("table", { name: /course overview/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Demo Student").length).toBeGreaterThan(0);
    // unit header link (exact name targets the column header, not cell aria-labels)
    expect(screen.getByRole("link", { name: "Unit 1" })).toBeInTheDocument();
  });

  it("shows CourseOverviewGrid empty state when courseOverview has no data", () => {
    render(
      <TeacherDashboardContent
        teacher={{ username: "demo_teacher", organizationName: "Demo School" }}
        students={[]}
        courseOverview={emptyCourseOverview}
      />,
    );

    expect(
      screen.getByText(/No students found in this gradebook/i),
    ).toBeInTheDocument();
  });

  it("renders action buttons in the header", () => {
    render(
      <TeacherDashboardContent
        teacher={{ username: "demo_teacher", organizationName: "Demo School" }}
        students={sampleStudents}
        courseOverview={sampleCourseOverview}
      />,
    );

    expect(screen.getByRole("button", { name: /bulk import/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create student/i })).toBeInTheDocument();
  });
});

describe("formatLastActive", () => {
  it("formats timestamps and handles missing values", () => {
    expect(formatLastActive("2025-11-14T09:15:00.000Z")).toMatch(/2025/);
    expect(formatLastActive(null)).toBe("No activity recorded");
    expect(formatLastActive("invalid")).toBe("No activity recorded");
  });
});
