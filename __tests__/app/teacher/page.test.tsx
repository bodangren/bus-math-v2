import { beforeEach, describe, expect, it, vi } from "vitest";

import TeacherDashboardPage from "../../../app/teacher/page";

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1", email: "teacher@example.com" } },
      }),
    },
  }),
}));

const mockQuery = vi.fn();
vi.mock("convex/browser", () => ({
  ConvexHttpClient: class {
    constructor() {}
    query = mockQuery;
  },
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    teacher: {
      getTeacherDashboardData: "api.teacher.getTeacherDashboardData",
    },
  },
}));

vi.mock("@/lib/teacher/course-overview-data", () => ({
  fetchCourseOverviewData: vi.fn().mockResolvedValue([]),
}));

describe("TeacherDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches dashboard data from Convex and renders content", async () => {
    mockQuery.mockResolvedValueOnce({
      teacher: {
        username: "teacher_smith",
        organizationName: "Test High School",
        organizationId: "org-1",
      },
      students: [
        {
          id: "student-1",
          username: "student_a",
          displayName: "Alice",
          completedPhases: 5,
          totalPhases: 10,
          progressPercentage: 50,
          lastActive: "2025-01-01T10:00:00.000Z",
        },
      ],
    });

    const jsx = await TeacherDashboardPage();
    
    expect(jsx).toBeDefined();
    
    // Verify Convex was called with the correct user ID
    expect(mockQuery).toHaveBeenCalledWith("api.teacher.getTeacherDashboardData", {
      userId: "user-1",
    });
  });
});
