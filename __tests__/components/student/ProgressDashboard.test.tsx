import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { ProgressDashboard } from "@/components/student/ProgressDashboard";
import * as useStudyHooks from "@/hooks/useStudy";
import * as glossary from "@/lib/study/glossary";

vi.mock("@/hooks/useStudy");
vi.mock("@/lib/study/glossary");

describe("ProgressDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useStudyHooks.useStudyPreferences as Mock).mockReturnValue({
      preferences: { languageMode: "en_to_en" },
      languageMode: "en_to_en",
      updatePreferences: vi.fn(),
    });
    (useStudyHooks.useTermMastery as Mock).mockReturnValue([]);
    (useStudyHooks.useRecentSessions as Mock).mockReturnValue([]);
    (glossary.getAllGlossaryUnits as Mock).mockReturnValue([1, 3, 4, 5, 6]);
    (glossary.getGlossaryTermsByUnit as Mock).mockReturnValue([
      { slug: "term-1" },
      { slug: "term-2" },
    ]);
  });

  it("renders the progress dashboard page", () => {
    render(<ProgressDashboard />);
    expect(screen.getByRole("heading", { name: /progress dashboard/i })).toBeInTheDocument();
  });

  it("shows per-unit mastery progress bars", () => {
    (useStudyHooks.useTermMastery as Mock).mockReturnValue([
      { termSlug: "term-1", mastery: 0.8, proficiencyBand: "mastered" },
      { termSlug: "term-2", mastery: 0.5, proficiencyBand: "familiar" },
    ]);
    render(<ProgressDashboard />);
    expect(screen.getByText(/per-unit mastery/i)).toBeInTheDocument();
  });

  it("shows aggregate stats", () => {
    render(<ProgressDashboard />);
    expect(screen.getByText(/total terms studied/i)).toBeInTheDocument();
    expect(screen.getByText(/total sessions/i)).toBeInTheDocument();
  });

  it("shows session history", () => {
    (useStudyHooks.useRecentSessions as Mock).mockReturnValue([
      { _id: "session-1", activityType: "flashcards", endedAt: Date.now() },
    ]);
    render(<ProgressDashboard />);
    expect(screen.getByText(/session history/i)).toBeInTheDocument();
  });
});
