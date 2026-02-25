import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CurriculumPage from "../../../app/curriculum/page";

const mockQuery = vi.fn();
vi.mock("convex/browser", () => ({
  ConvexHttpClient: class {
    constructor() {}
    query = mockQuery;
  },
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    public: {
      getCurriculum: "api.public.getCurriculum",
    },
  },
}));

describe("CurriculumPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders units with their lessons from Convex", async () => {
    mockQuery.mockResolvedValueOnce([
      {
        unitNumber: 1,
        title: "Balance by Design",
        description: "How do we keep the books balanced?",
        objectives: ["Understand balance"],
        lessons: [
          {
            id: "lesson-1",
            title: "Lesson 1",
            slug: "lesson-1",
            description: "Intro lesson",
            orderIndex: 1,
          },
          {
            id: "lesson-2",
            title: "Lesson 2",
            slug: "lesson-2",
            description: "Follow up lesson",
            orderIndex: 2,
          }
        ]
      }
    ]);

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
    mockQuery.mockResolvedValueOnce([]);

    const page = await CurriculumPage();
    render(page);

    expect(
      screen.getByText(/Curriculum data isn't available yet/i)
    ).toBeInTheDocument();
  });
});
