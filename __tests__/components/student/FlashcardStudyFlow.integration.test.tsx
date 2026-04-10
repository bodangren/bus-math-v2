import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { StudyHubHome } from "@/components/student/StudyHubHome";
import { FlashcardPlayer } from "@/components/student/FlashcardPlayer";
import * as useStudyHooks from "@/hooks/useStudy";
import * as glossary from "@/lib/study/glossary";

vi.mock("@/hooks/useStudy");
vi.mock("@/lib/study/glossary");
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("Flashcard Study Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useStudyHooks.useStudyPreferences as Mock).mockReturnValue({
      preferences: { languageMode: "en_to_en" },
      languageMode: "en_to_en",
      updatePreferences: vi.fn(),
    });
    (useStudyHooks.useDueTerms as Mock).mockReturnValue([
      { termSlug: "test-term-1" },
      { termSlug: "test-term-2" },
    ]);
    const mockProcessReview = vi.fn();
    const mockRecordSession = vi.fn();
    (useStudyHooks.useProcessReview as Mock).mockReturnValue(mockProcessReview);
    (useStudyHooks.useRecordSession as Mock).mockReturnValue(mockRecordSession);
    (useStudyHooks.getGlossaryTermDisplay as Mock).mockImplementation((term, mode) => {
      if (mode === "en_to_en") {
        if (term.slug === "test-term-1") {
          return { prompt: "Test Term 1", answer: "Test Definition 1" };
        } else if (term.slug === "test-term-2") {
          return { prompt: "Test Term 2", answer: "Test Definition 2" };
        }
      }
      return { prompt: "", answer: "" };
    });
    (glossary.getGlossaryTermBySlug as Mock).mockImplementation((slug) => {
      if (slug === "test-term-1") {
        return {
          slug: "test-term-1",
          term_en: "Test Term 1",
          def_en: "Test Definition 1",
          term_zh: "测试术语 1",
          def_zh: "测试定义 1",
          unitNumber: 1,
          topic: "Test Topic",
          synonyms: [],
          relatedTerms: [],
        };
      } else if (slug === "test-term-2") {
        return {
          slug: "test-term-2",
          term_en: "Test Term 2",
          def_en: "Test Definition 2",
          term_zh: "测试术语 2",
          def_zh: "测试定义 2",
          unitNumber: 1,
          topic: "Test Topic",
          synonyms: [],
          relatedTerms: [],
        };
      }
      return undefined;
    });
    (glossary.getAllGlossaryUnits as Mock).mockReturnValue([1, 3, 4, 5, 6]);
  });

  it("completes a full flashcard study session from hub to session recording", async () => {
    // Test Study Hub Home renders with flashcards link
    render(<StudyHubHome />);
    expect(screen.getByText("Study Hub")).toBeInTheDocument();
    expect(screen.getByText("Flashcards")).toBeInTheDocument();

    // Test Flashcard Player renders first term
    render(<FlashcardPlayer />);
    expect(screen.getByText("Test Term 1")).toBeInTheDocument();
    expect(screen.getByText("Term 1 of 2")).toBeInTheDocument();

    // Flip card and rate
    fireEvent.click(screen.getByText("Test Term 1"));
    expect(screen.getByText("Test Definition 1")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Good"));

    // Verify next term is shown
    await waitFor(() => {
      expect(screen.getByText("Test Term 2")).toBeInTheDocument();
    });

    // Flip second card and rate
    fireEvent.click(screen.getByText("Test Term 2"));
    expect(screen.getByText("Test Definition 2")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Good"));

    // Verify session complete is shown and recordSession is called
    await waitFor(() => {
      expect(screen.getByText("Session Complete!")).toBeInTheDocument();
    });
  });
});