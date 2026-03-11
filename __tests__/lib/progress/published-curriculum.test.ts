import { describe, expect, it } from "vitest";

import {
  buildLessonPhaseProgress,
  buildLatestPublishedLessonVersionMap,
  buildPublishedLessonPhaseIdsByLessonId,
  buildPublishedProgressSnapshot,
  buildPublishedUnitProgressRows,
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

  it("builds shared published unit progress rows with versioned lesson details and completed-phase math", () => {
    const rows = buildPublishedUnitProgressRows({
      lessons: [
        {
          _id: "lesson-1",
          unitNumber: 1,
          orderIndex: 2,
          title: "Fallback Title",
          slug: "lesson-1",
          description: "Fallback description",
          metadata: {},
        },
        {
          _id: "lesson-2",
          unitNumber: 1,
          orderIndex: 1,
          title: "Earlier Lesson",
          slug: "lesson-2",
          description: null,
          metadata: {
            unitContent: {
              introduction: {
                unitTitle: "Operations Foundations",
              },
            },
          },
        },
      ],
      lessonVersions: [
        { _id: "version-draft", lessonId: "lesson-1", version: 3, status: "draft", title: "Draft", description: "Draft desc" },
        { _id: "version-published", lessonId: "lesson-1", version: 2, status: "published", title: "Published Title", description: "Published description" },
        { _id: "version-lesson-2", lessonId: "lesson-2", version: 1, status: "published", title: "Earlier Lesson Published", description: null },
      ],
      phaseVersions: [
        { _id: "phase-1", lessonVersionId: "version-published" },
        { _id: "phase-2", lessonVersionId: "version-published" },
        { _id: "phase-draft", lessonVersionId: "version-draft" },
        { _id: "phase-3", lessonVersionId: "version-lesson-2" },
      ],
      progressRows: [
        { phaseId: "phase-1", status: "completed" },
        { phaseId: "phase-draft", status: "completed" },
      ],
    });

    expect(rows).toEqual([
      {
        unitNumber: 1,
        unitTitle: "Operations Foundations",
        lessons: [
          {
            id: "lesson-2",
            unitNumber: 1,
            title: "Earlier Lesson Published",
            slug: "lesson-2",
            description: null,
            totalPhases: 1,
            completedPhases: 0,
            progressPercentage: 0,
          },
          {
            id: "lesson-1",
            unitNumber: 1,
            title: "Published Title",
            slug: "lesson-1",
            description: "Published description",
            totalPhases: 2,
            completedPhases: 1,
            progressPercentage: 50,
          },
        ],
      },
    ]);
  });

  it("builds ordered lesson phase progress with current and locked transitions from student progress", () => {
    const phases = buildLessonPhaseProgress({
      phases: [
        { _id: "phase-1", phaseNumber: 1 },
        { _id: "phase-2", phaseNumber: 2 },
        { _id: "phase-3", phaseNumber: 3 },
        { _id: "phase-4", phaseNumber: 4 },
      ],
      progressRows: [
        {
          phaseId: "phase-1",
          status: "completed",
          startedAt: Date.parse("2026-03-10T08:00:00.000Z"),
          completedAt: Date.parse("2026-03-10T08:10:00.000Z"),
          timeSpentSeconds: 600,
        },
        {
          phaseId: "phase-2",
          status: "in_progress",
          startedAt: Date.parse("2026-03-10T08:11:00.000Z"),
          timeSpentSeconds: 120,
        },
      ],
    });

    expect(phases).toEqual([
      {
        phaseNumber: 1,
        phaseId: "phase-1",
        status: "completed",
        startedAt: "2026-03-10T08:00:00.000Z",
        completedAt: "2026-03-10T08:10:00.000Z",
        timeSpentSeconds: 600,
      },
      {
        phaseNumber: 2,
        phaseId: "phase-2",
        status: "current",
        startedAt: "2026-03-10T08:11:00.000Z",
        completedAt: null,
        timeSpentSeconds: 120,
      },
      {
        phaseNumber: 3,
        phaseId: "phase-3",
        status: "locked",
        startedAt: null,
        completedAt: null,
        timeSpentSeconds: null,
      },
      {
        phaseNumber: 4,
        phaseId: "phase-4",
        status: "locked",
        startedAt: null,
        completedAt: null,
        timeSpentSeconds: null,
      },
    ]);
  });
});
