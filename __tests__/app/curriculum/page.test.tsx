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

vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("CurriculumPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders units with their titles from Convex", async () => {
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

    expect(screen.getAllByText("Balance by Design").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2 lessons").length).toBeGreaterThan(0);
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

    expect(screen.queryByText(/^Unit 9$/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Capstone: Investor-Ready Plan/i).length).toBeGreaterThan(0);
  });

  it("renders the CTA section even when no units exist", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const page = await CurriculumPage();
    render(page);

    expect(
      screen.getByRole("heading", { name: /Ready to start building/i })
    ).toBeInTheDocument();
  });

  it("shows login link in final CTA", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const page = await CurriculumPage();
    render(page);

    expect(
      screen.getByRole("link", { name: /Student or teacher login/i })
    ).toHaveAttribute("href", "/auth/login");
  });
});
