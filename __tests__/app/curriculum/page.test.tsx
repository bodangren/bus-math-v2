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

  it("labels the capstone as a distinct culminating experience instead of Unit 9", async () => {
    mockQuery.mockResolvedValueOnce([
      {
        unitNumber: 9,
        title: "Capstone: Investor-Ready Plan",
        description: "Build the final investor-ready workbook and pitch.",
        objectives: ["Defend one integrated business plan."],
        lessons: [
          {
            id: "capstone-lesson",
            title: "Capstone: Investor-Ready Plan",
            slug: "capstone-investor-ready-plan",
            description: "Final textbook experience",
            orderIndex: 1,
          },
        ],
      },
    ]);

    const page = await CurriculumPage();
    render(page);

    expect(screen.getByText(/^Capstone$/)).toBeInTheDocument();
    expect(screen.queryByText(/^Unit 9$/)).not.toBeInTheDocument();
    expect(screen.getAllByText("Capstone: Investor-Ready Plan").length).toBeGreaterThan(0);
  });

  it("shows empty state when no lessons exist", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const page = await CurriculumPage();
    render(page);

    expect(
      screen.getByText(/Curriculum data isn't available yet/i)
    ).toBeInTheDocument();
  });

  it("describes the curriculum as browsable before sign-in instead of claiming lesson study is public", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const page = await CurriculumPage();
    render(page);

    expect(
      screen.getByText(/browse the sequence before signing in to study/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/jump into any lesson without signing in/i)
    ).not.toBeInTheDocument();
  });
});
