import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { StudyHubHome } from "@/components/student/StudyHubHome";
import * as useStudyHooks from "@/hooks/useStudy";
import * as glossary from "@/lib/study/glossary";

vi.mock("@/hooks/useStudy");
vi.mock("@/lib/study/glossary");
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("StudyHubHome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useStudyHooks.useStudyPreferences as Mock).mockReturnValue({
      preferences: { languageMode: "en_to_en" },
      languageMode: "en_to_en",
      updatePreferences: vi.fn(),
    });
    (useStudyHooks.useTermMastery as Mock).mockReturnValue([]);
    (useStudyHooks.useDueTerms as Mock).mockReturnValue([]);
    (useStudyHooks.useRecentSessions as Mock).mockReturnValue([]);
    (useStudyHooks.useGlossaryTermDisplay as Mock).mockReturnValue({
      prompt: "Test Term",
      answer: "Test Definition",
    });
    (glossary.getAllGlossaryUnits as Mock).mockReturnValue([1, 3, 4, 5, 6]);
    (glossary.getGlossaryTermBySlug as Mock).mockReturnValue({
      slug: "term-1",
      term_en: "Test Term",
      def_en: "Test Definition",
      term_zh: "测试术语",
      def_zh: "测试定义",
      unitNumber: 1,
      topic: "Test Topic",
      synonyms: [],
      relatedTerms: [],
    });
  });

  it("renders the study hub home page", () => {
    render(<StudyHubHome />);
    expect(screen.getByRole("heading", { name: /study hub/i })).toBeInTheDocument();
  });

  it("shows due review count", () => {
    (useStudyHooks.useDueTerms as Mock).mockReturnValue([
      { slug: "term-1" },
      { slug: "term-2" },
    ]);
    render(<StudyHubHome />);
    expect(screen.getByText("2 terms")).toBeInTheDocument();
  });

  it("shows recent study sessions", () => {
    (useStudyHooks.useRecentSessions as Mock).mockReturnValue([
      { _id: "session-1", activityType: "flashcards", endedAt: Date.now() },
    ]);
    render(<StudyHubHome />);
    expect(screen.getByText("Recent Study Sessions")).toBeInTheDocument();
  });

  it("shows weak topics", () => {
    (useStudyHooks.useTermMastery as Mock).mockReturnValue([
      { termSlug: "term-1", mastery: 0.2, proficiencyBand: "learning" },
    ]);
    render(<StudyHubHome />);
    expect(screen.getByText("Weak Topics")).toBeInTheDocument();
  });
});
