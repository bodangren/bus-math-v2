import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CurriculumPage, { groupLessonsByUnit } from "./page";

vi.mock("@/lib/db/drizzle", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("CurriculumPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders units with their lessons", async () => {
    const { db } = await import("@/lib/db/drizzle");

    const mockLessons = [
      {
        id: "lesson-1",
        unitNumber: 1,
        title: "Lesson 1",
        slug: "lesson-1",
        description: "Intro lesson",
        learningObjectives: ["Understand balance"],
        orderIndex: 1,
        metadata: {
          unitContent: {
            introduction: {
              unitTitle: "Balance by Design",
            },
            drivingQuestion: {
              question: "How do we keep the books balanced?",
            },
            objectives: {
              content: ["Understand balance"],
              skills: [],
              deliverables: [],
            },
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "lesson-2",
        unitNumber: 1,
        title: "Lesson 2",
        slug: "lesson-2",
        description: "Follow up lesson",
        learningObjectives: null,
        orderIndex: 2,
        metadata: {
          unitContent: {
            introduction: {
              unitTitle: "Balance by Design",
            },
            drivingQuestion: {
              question: "How do we keep the books balanced?",
            },
            objectives: {
              content: ["Understand balance"],
              skills: [],
              deliverables: [],
            },
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const orderByMock = vi.fn().mockResolvedValue(mockLessons);
    const fromMock = vi.fn().mockReturnValue({ orderBy: orderByMock });

    vi.mocked(db.select).mockReturnValue({ from: fromMock } as never);

    const page = await CurriculumPage();
    render(page);

    expect(screen.getByText("Balance by Design")).toBeInTheDocument();
    expect(screen.getByText("Lesson 1")).toHaveAttribute(
      "href",
      "/student/lesson/lesson-1"
    );
    expect(screen.getByText("Lesson 2")).toHaveAttribute(
      "href",
      "/student/lesson/lesson-2"
    );
    expect(screen.getByText("2 lessons")).toBeInTheDocument();
  });

  it("shows empty state when no lessons exist", async () => {
    const { db } = await import("@/lib/db/drizzle");

    const orderByMock = vi.fn().mockResolvedValue([]);
    const fromMock = vi.fn().mockReturnValue({ orderBy: orderByMock });

    vi.mocked(db.select).mockReturnValue({ from: fromMock } as never);

    const page = await CurriculumPage();
    render(page);

    expect(
      screen.getByText(/Curriculum data isn't available yet/i)
    ).toBeInTheDocument();
  });
});

describe("groupLessonsByUnit", () => {
  it("ENSURES objectives is always an array (regression test)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const badDataScenarios: any[] = [
      // String instead of array
      {
        id: "1",
        unitNumber: 1,
        title: "L1",
        slug: "l1",
        orderIndex: 1,
        learningObjectives: "Bad string",
        metadata: null,
      },
      // Object instead of array
      {
        id: "2",
        unitNumber: 2,
        title: "L2",
        slug: "l2",
        orderIndex: 1,
        learningObjectives: { bad: "object" },
        metadata: null,
      },
      // Null
      {
        id: "3",
        unitNumber: 3,
        title: "L3",
        slug: "l3",
        orderIndex: 1,
        learningObjectives: null,
        metadata: null,
      },
    ];

    const result = groupLessonsByUnit(badDataScenarios);

    // Check Unit 1 (String input)
    const u1 = result.find((u) => u.unitNumber === 1);
    expect(Array.isArray(u1?.objectives)).toBe(true);

    // Check Unit 2 (Object input)
    const u2 = result.find((u) => u.unitNumber === 2);
    expect(Array.isArray(u2?.objectives)).toBe(true);

    // Check Unit 3 (Null input)
    const u3 = result.find((u) => u.unitNumber === 3);
    expect(Array.isArray(u3?.objectives)).toBe(true);
  });
});
