import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import {
  applyInterventionFilter,
  buildInterventionSummary,
  deriveStudentIntervention,
  prioritizeInterventionRows,
  type StudentDashboardRow,
} from "@/lib/teacher/intervention";

const students: StudentDashboardRow[] = [
  {
    id: "risk",
    username: "risk_student",
    displayName: "Risk Student",
    completedPhases: 10,
    totalPhases: 40,
    progressPercentage: 25,
    lastActive: "2025-11-01T09:00:00.000Z",
  },
  {
    id: "inactive",
    username: "inactive_student",
    displayName: "Inactive Student",
    completedPhases: 28,
    totalPhases: 40,
    progressPercentage: 70,
    lastActive: "2025-11-01T08:00:00.000Z",
  },
  {
    id: "complete",
    username: "complete_student",
    displayName: "Complete Student",
    completedPhases: 40,
    totalPhases: 40,
    progressPercentage: 100,
    lastActive: "2025-11-08T09:00:00.000Z",
  },
  {
    id: "track",
    username: "track_student",
    displayName: "Track Student",
    completedPhases: 30,
    totalPhases: 40,
    progressPercentage: 75,
    lastActive: "2025-11-08T11:00:00.000Z",
  },
  {
    id: "never",
    username: "never_student",
    displayName: null,
    completedPhases: 0,
    totalPhases: 40,
    progressPercentage: 0,
    lastActive: null,
  },
];

describe("teacher intervention utilities", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-11-09T12:00:00.000Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("derives intervention statuses and needs-attention flags", () => {
    expect(deriveStudentIntervention(students[0]).status).toBe("at_risk");
    expect(deriveStudentIntervention(students[1]).status).toBe("inactive");
    expect(deriveStudentIntervention(students[2]).status).toBe("completed");
    expect(deriveStudentIntervention(students[3]).status).toBe("on_track");
    expect(deriveStudentIntervention(students[4]).needsAttention).toBe(true);
  });

  it("prioritizes at-risk and inactive students ahead of on-track and completed", () => {
    const ordered = prioritizeInterventionRows(students).map((student) => student.username);

    expect(ordered.slice(0, 3)).toEqual([
      "never_student",
      "risk_student",
      "inactive_student",
    ]);
    expect(ordered.at(-1)).toBe("complete_student");
  });

  it("filters derived students by intervention segment", () => {
    expect(applyInterventionFilter(students, "inactive")).toHaveLength(3);
    expect(applyInterventionFilter(students, "at_risk")).toHaveLength(2);
    expect(applyInterventionFilter(students, "completed")).toHaveLength(1);
    expect(applyInterventionFilter(students, "on_track")[0]?.username).toBe("track_student");
  });

  it("builds summary counts from derived student rows", () => {
    expect(buildInterventionSummary(students)).toEqual({
      total: 5,
      activeThisWeek: 2,
      atRisk: 2,
      inactive: 3,
      completed: 1,
      onTrack: 1,
      needsAttention: 3,
    });
  });
});
