import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockFetchInternalQuery, mockFetchInternalMutation } = vi.hoisted(() => ({
  mockFetchInternalQuery: vi.fn(),
  mockFetchInternalMutation: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  __esModule: true,
  default: () => ({}),
}));

vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  api: {
    srs: {
      getClassSrsHealth: "api.srs.getClassSrsHealth",
      getWeakFamilies: "api.srs.getWeakFamilies",
      getStrugglingStudents: "api.srs.getStrugglingStudents",
      resetStudentCard: "api.srs.resetStudentCard",
      bumpFamilyPriority: "api.srs.bumpFamilyPriority",
    },
  },
}));

import { TeacherSRSDashboardClient } from "../../../../components/teacher/srs/TeacherSRSDashboardClient";

describe("TeacherSRSDashboardClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchInternalQuery.mockResolvedValue(null);
    mockFetchInternalMutation.mockResolvedValue(null);
  });

  it("shows empty state when there are no classes", () => {
    render(
      <TeacherSRSDashboardClient organizationName="Test School" classes={[]} />
    );

    expect(
      screen.getByText(
        /You don't have any classes yet\. Create a class to start tracking SRS data\./i
      )
    ).toBeInTheDocument();
  });

  it("renders dashboard with initial class data", async () => {
    mockFetchInternalQuery.mockImplementation((ref: string) => {
      if (ref === "api.srs.getClassSrsHealth") {
        return Promise.resolve({
          totalStudents: 20,
          studentsWithCards: 15,
          averageRetentionRate: 75,
          overdueCardCount: 3,
          cardsDueToday: 5,
          totalCards: 100,
          classId: "class-1",
        });
      }
      if (ref === "api.srs.getWeakFamilies") {
        return Promise.resolve([
          {
            problemFamilyId: "family-a",
            displayName: "Family A",
            againCount: 5,
            hardCount: 3,
            goodCount: 10,
            easyCount: 2,
            totalReviews: 20,
            againRate: 0.25,
            averageRating: 2.5,
          },
        ]);
      }
      if (ref === "api.srs.getStrugglingStudents") {
        return Promise.resolve({
          students: [
            {
              studentId: "student-1",
              username: "student1",
              displayName: "Student One",
              overdueCards: 4,
              totalCards: 10,
              totalReviews: 15,
              againRate: 0.3,
              lastActive: Date.now() - 86400000,
            },
          ],
        });
      }
      return Promise.resolve(null);
    });

    render(
      <TeacherSRSDashboardClient
        organizationName="Test School"
        classes={[
          {
            id: "class-1",
            name: "Class A",
            description: null,
            academicYear: "2026",
          },
        ]}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "SRS Practice Analytics" })).toBeInTheDocument();
    });

    expect(screen.getByText("Test School")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Class A (2026)")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("20")).toBeInTheDocument();
    });
  });

  it("loads new class data when class selection changes", async () => {
    mockFetchInternalQuery.mockImplementation((ref: string) => {
      if (ref === "api.srs.getClassSrsHealth") {
        return Promise.resolve({
          totalStudents: 10,
          studentsWithCards: 8,
          averageRetentionRate: 80,
          overdueCardCount: 1,
          cardsDueToday: 2,
          totalCards: 50,
          classId: "class-1",
        });
      }
      if (ref === "api.srs.getWeakFamilies") {
        return Promise.resolve([]);
      }
      if (ref === "api.srs.getStrugglingStudents") {
        return Promise.resolve({ students: [] });
      }
      return Promise.resolve(null);
    });

    render(
      <TeacherSRSDashboardClient
        organizationName="Test School"
        classes={[
          {
            id: "class-1",
            name: "Class A",
            description: null,
            academicYear: "2026",
          },
          {
            id: "class-2",
            name: "Class B",
            description: null,
            academicYear: "2026",
          },
        ]}
      />
    );

    await waitFor(() => {
      expect(mockFetchInternalQuery).toHaveBeenCalledWith(
        "api.srs.getClassSrsHealth",
        expect.objectContaining({ classId: "class-1" })
      );
    });

    mockFetchInternalQuery.mockImplementation((ref: string) => {
      if (ref === "api.srs.getClassSrsHealth") {
        return Promise.resolve({
          totalStudents: 30,
          studentsWithCards: 25,
          averageRetentionRate: 85,
          overdueCardCount: 2,
          cardsDueToday: 4,
          totalCards: 120,
          classId: "class-2",
        });
      }
      if (ref === "api.srs.getWeakFamilies") {
        return Promise.resolve([]);
      }
      if (ref === "api.srs.getStrugglingStudents") {
        return Promise.resolve({ students: [] });
      }
      return Promise.resolve(null);
    });

    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "class-2");

    await waitFor(() => {
      expect(mockFetchInternalQuery).toHaveBeenCalledWith(
        "api.srs.getClassSrsHealth",
        expect.objectContaining({ classId: "class-2" })
      );
    });
  });

  it("opens reset card modal and calls mutation on confirm", async () => {
    mockFetchInternalQuery.mockImplementation((ref: string) => {
      if (ref === "api.srs.getClassSrsHealth") {
        return Promise.resolve({
          totalStudents: 1,
          studentsWithCards: 1,
          averageRetentionRate: 50,
          overdueCardCount: 1,
          cardsDueToday: 0,
          totalCards: 5,
          classId: "class-1",
        });
      }
      if (ref === "api.srs.getWeakFamilies") {
        return Promise.resolve([
          {
            problemFamilyId: "family-a",
            displayName: "Family A",
            againCount: 5,
            hardCount: 3,
            goodCount: 10,
            easyCount: 2,
            totalReviews: 20,
            againRate: 0.25,
            averageRating: 2.5,
          },
        ]);
      }
      if (ref === "api.srs.getStrugglingStudents") {
        return Promise.resolve({
          students: [
            {
              studentId: "student-1",
              username: "student1",
              displayName: "Student One",
              overdueCards: 1,
              totalCards: 5,
              totalReviews: 3,
              againRate: 0.5,
              lastActive: null,
            },
          ],
        });
      }
      return Promise.resolve(null);
    });

    render(
      <TeacherSRSDashboardClient
        organizationName="Test School"
        classes={[
          {
            id: "class-1",
            name: "Class A",
            description: null,
            academicYear: "2026",
          },
        ]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Student One")).toBeInTheDocument();
    });

    const resetButton = screen.getByRole("button", { name: /Reset Card/i });
    await userEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText("Reset Student Card")).toBeInTheDocument();
    });

    const familySelect = screen.getByLabelText(/Problem Family/i);
    await userEvent.selectOptions(familySelect, "family-a");

    mockFetchInternalMutation.mockResolvedValueOnce(undefined);

    const modal = screen.getByRole("dialog");
    const confirmButton = within(modal).getByRole("button", { name: /Reset Card$/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockFetchInternalMutation).toHaveBeenCalledWith(
        "api.srs.resetStudentCard",
        expect.objectContaining({
          studentId: "student-1",
          problemFamilyId: "family-a",
        })
      );
    });
  });

  it("opens bump priority modal and calls mutation on confirm", async () => {
    mockFetchInternalQuery.mockImplementation((ref: string) => {
      if (ref === "api.srs.getClassSrsHealth") {
        return Promise.resolve({
          totalStudents: 5,
          studentsWithCards: 5,
          averageRetentionRate: 60,
          overdueCardCount: 0,
          cardsDueToday: 1,
          totalCards: 10,
          classId: "class-1",
        });
      }
      if (ref === "api.srs.getWeakFamilies") {
        return Promise.resolve([
          {
            problemFamilyId: "family-a",
            displayName: "Family A",
            againCount: 5,
            hardCount: 2,
            goodCount: 3,
            easyCount: 0,
            totalReviews: 10,
            againRate: 0.5,
            averageRating: 1.7,
          },
        ]);
      }
      if (ref === "api.srs.getStrugglingStudents") {
        return Promise.resolve({ students: [] });
      }
      return Promise.resolve(null);
    });

    render(
      <TeacherSRSDashboardClient
        organizationName="Test School"
        classes={[
          {
            id: "class-1",
            name: "Class A",
            description: null,
            academicYear: "2026",
          },
        ]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Family A")).toBeInTheDocument();
    });

    const bumpButton = screen.getByRole("button", { name: "Bump Priority" });
    await userEvent.click(bumpButton);

    await waitFor(() => {
      expect(screen.getByText("Bump Family Priority")).toBeInTheDocument();
    });

    const familySelect = screen.getByLabelText(/Problem Family/i);
    await userEvent.selectOptions(familySelect, "family-a");

    mockFetchInternalMutation.mockResolvedValueOnce(undefined);

    const modal = screen.getByRole("dialog");
    const confirmButton = within(modal).getByRole("button", { name: /Bump Priority$/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockFetchInternalMutation).toHaveBeenCalledWith(
        "api.srs.bumpFamilyPriority",
        expect.objectContaining({
          classId: "class-1",
          problemFamilyId: "family-a",
        })
      );
    });
  });
});
