import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import Home from "../../app/page";

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
      getCurriculumStats: "api.public.getCurriculumStats",
      getUnits: "api.public.getUnits",
    },
  },
}));

vi.mock("@/components/hero", () => ({
  Hero: ({
    stats,
  }: {
    stats: { unitCount: number; lessonCount: number; activityCount: number };
  }) => (
    <div data-testid="hero-stats">
      {stats.unitCount}|{stats.lessonCount}|{stats.activityCount}
    </div>
  ),
}));

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses Convex query stats", async () => {
    // Mock the Promise.all array order: [stats, units]
    mockQuery.mockImplementation((apiRoute) => {
      if (apiRoute === "api.public.getCurriculumStats") {
        return Promise.resolve({
          unitCount: 8,
          lessonCount: 40,
          activityCount: 120,
        });
      }
      if (apiRoute === "api.public.getUnits") {
        return Promise.resolve([
          {
            id: "lesson-1",
            unit_number: 1,
            title: "Lesson 1",
            slug: "lesson-1",
            description: "Desc",
            order_index: 1,
            metadata: {},
          },
        ]);
      }
      return Promise.resolve(null);
    });

    const page = await Home();
    render(page);

    expect(screen.getByTestId("hero-stats")).toHaveTextContent("8|40|120");
    expect(screen.getAllByText("Unit 1: Lesson 1").length).toBeGreaterThan(0);
  });
});
