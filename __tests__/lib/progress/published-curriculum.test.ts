import { describe, expect, it } from "vitest";

import {
  buildLatestPublishedLessonVersionMap,
  buildPublishedLessonPhaseIdsByLessonId,
  buildPublishedProgressSnapshot,
  resolveLatestPublishedLessonVersion,
} from "@/lib/progress/published-curriculum";

describe("published curriculum helpers", () => {
  it("selects the latest published lesson version instead of the newest draft", () => {
    const lessonVersions = [
      {
        _id: "version-draft",
        lessonId: "lesson-1",
        version: 3,
        status: "draft",
      },
      {
        _id: "version-published-new",
        lessonId: "lesson-1",
        version: 2,
        status: "published",
      },
      {
        _id: "version-published-old",
        lessonId: "lesson-1",
        version: 1,
        status: "published",
      },
    ];

    expect(resolveLatestPublishedLessonVersion(lessonVersions)).toMatchObject({
      _id: "version-published-new",
      version: 2,
    });
    expect(
      buildLatestPublishedLessonVersionMap(lessonVersions).get("lesson-1"),
    ).toMatchObject({
      _id: "version-published-new",
      version: 2,
    });
  });

  it("maps published phase ids by lesson using only the latest published lesson version", () => {
    const lessonVersions = [
      {
        _id: "version-1",
        lessonId: "lesson-1",
        version: 1,
        status: "published",
      },
      {
        _id: "version-2",
        lessonId: "lesson-1",
        version: 2,
        status: "published",
      },
      {
        _id: "version-3",
        lessonId: "lesson-1",
        version: 3,
        status: "draft",
      },
      {
        _id: "version-4",
        lessonId: "lesson-2",
        version: 1,
        status: "draft",
      },
    ];

    const phases = [
      { _id: "phase-old", lessonVersionId: "version-1" },
      { _id: "phase-new-a", lessonVersionId: "version-2" },
      { _id: "phase-new-b", lessonVersionId: "version-2" },
      { _id: "phase-draft", lessonVersionId: "version-3" },
      { _id: "phase-unpublished", lessonVersionId: "version-4" },
    ];

    expect(
      buildPublishedLessonPhaseIdsByLessonId({
        lessonIds: ["lesson-1", "lesson-2"],
        lessonVersions,
        phaseVersions: phases,
      }),
    ).toEqual(
      new Map([
        ["lesson-1", ["phase-new-a", "phase-new-b"]],
        ["lesson-2", []],
      ]),
    );
  });

  it("builds progress snapshots from published phase ids only", () => {
    const snapshot = buildPublishedProgressSnapshot({
      activePhaseIds: new Set(["phase-1", "phase-2"]),
      progressRows: [
        {
          phaseId: "phase-1",
          status: "completed",
          updatedAt: Date.parse("2026-03-10T10:00:00.000Z"),
        },
        {
          phaseId: "phase-2",
          status: "in_progress",
          updatedAt: Date.parse("2026-03-10T11:00:00.000Z"),
        },
        {
          phaseId: "phase-draft",
          status: "completed",
          updatedAt: Date.parse("2026-03-10T12:00:00.000Z"),
        },
      ],
    });

    expect(snapshot).toEqual({
      completedPhases: 1,
      totalPhases: 2,
      progressPercentage: 50,
      lastActive: "2026-03-10T11:00:00.000Z",
    });
  });
});
