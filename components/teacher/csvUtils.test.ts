import { describe, expect, it } from "vitest";
import type { StudentDashboardRow } from "./TeacherDashboardContent";
import { buildCsvFilename, studentRowsToCsv } from "./csvUtils";

const demoRows: StudentDashboardRow[] = [
  {
    id: "1",
    username: "demo_student",
    displayName: "Demo Student",
    completedPhases: 120,
    totalPhases: 180,
    progressPercentage: 66.666,
    lastActive: "2025-11-14T12:15:00.000Z",
  },
  {
    id: "2",
    username: "quiet_student",
    displayName: null,
    completedPhases: 180,
    totalPhases: 180,
    progressPercentage: 100,
    lastActive: null,
  },
];

describe("studentRowsToCsv", () => {
  it("creates CSV output with headers and formatted values", () => {
    const csv = studentRowsToCsv(demoRows);
    const lines = csv.split("\n");

    expect(lines[0]).toBe("Username,Progress %,Completed Phases,Total Phases,Last Active");
    expect(lines[1]).toBe("demo_student,66.7%,120,180,2025-11-14");
    expect(lines[2]).toBe("quiet_student,100%,180,180,");
  });

  it("escapes commas and quotes in values", () => {
    const trickyRows: StudentDashboardRow[] = [
      {
        id: "3",
        username: 'student,"comma"',
        displayName: null,
        completedPhases: 0,
        totalPhases: 0,
        progressPercentage: 0,
        lastActive: "2025-11-14T12:00:00.000Z",
      },
    ];

    const csv = studentRowsToCsv(trickyRows);
    expect(csv).toContain('"student,""comma"""');
  });

  it("returns only headers when no students exist", () => {
    expect(studentRowsToCsv([])).toBe(
      "Username,Progress %,Completed Phases,Total Phases,Last Active",
    );
  });
});

describe("buildCsvFilename", () => {
  it("generates filename with timestamp", () => {
    const reference = new Date("2025-11-14T08:05:00.000Z");
    expect(buildCsvFilename(reference)).toBe("bus-math-grades-2025-11-14-0805.csv");
  });
});
