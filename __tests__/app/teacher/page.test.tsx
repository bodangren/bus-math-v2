import { beforeEach, describe, expect, it, vi } from "vitest";

import { getStudentProgressSnapshots } from "@/app/teacher/page";

vi.mock("@/lib/db/drizzle", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("getStudentProgressSnapshots", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("uses versioned phase IDs when available", async () => {
    const { db } = await import("@/lib/db/drizzle");

    const versionedPhaseRows = [{ id: "pv-1" }, { id: "pv-2" }];
    const progressRows = [
      {
        userId: "student-1",
        phaseId: "pv-1",
        status: "completed",
        updatedAt: new Date("2025-01-01T10:00:00.000Z"),
      },
      {
        userId: "student-1",
        phaseId: "legacy-phase-1",
        status: "completed",
        updatedAt: new Date("2025-01-01T12:00:00.000Z"),
      },
      {
        userId: "student-2",
        phaseId: "pv-2",
        status: "in_progress",
        updatedAt: new Date("2025-01-02T10:00:00.000Z"),
      },
    ];

    let call = 0;
    vi.mocked(db.select).mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          from: () => Promise.resolve(versionedPhaseRows),
        } as never;
      }
      return {
        from: () => ({
          where: () => Promise.resolve(progressRows),
        }),
      } as never;
    });

    const snapshots = await getStudentProgressSnapshots(["student-1", "student-2"]);

    expect(snapshots.get("student-1")).toMatchObject({
      completedPhases: 1,
      totalPhases: 2,
      progressPercentage: 50,
      lastActive: "2025-01-01T10:00:00.000Z",
    });
    expect(snapshots.get("student-2")).toMatchObject({
      completedPhases: 0,
      totalPhases: 2,
      progressPercentage: 0,
      lastActive: "2025-01-02T10:00:00.000Z",
    });
  });

  it("returns zero totals when no versioned phases are available", async () => {
    const { db } = await import("@/lib/db/drizzle");

    let call = 0;
    vi.mocked(db.select).mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          from: () => Promise.resolve([]),
        } as never;
      }
      return {
        from: () => ({
          where: () =>
            Promise.resolve([
              {
                userId: "student-1",
                phaseId: "legacy-1",
                status: "completed",
                updatedAt: new Date("2025-01-03T10:00:00.000Z"),
              },
            ]),
        }),
      } as never;
    });

    const snapshots = await getStudentProgressSnapshots(["student-1"]);

    expect(snapshots.get("student-1")).toMatchObject({
      completedPhases: 0,
      totalPhases: 0,
      progressPercentage: 0,
      lastActive: null,
    });
  });
});
