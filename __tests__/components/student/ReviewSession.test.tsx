import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { ReviewSession } from "@/components/student/ReviewSession";
import * as useStudyHooks from "@/hooks/useStudy";
import * as glossary from "@/lib/study/glossary";

vi.mock("@/hooks/useStudy", () => ({
  useStudyPreferences: vi.fn(),
  useDueTerms: vi.fn(),
  useProcessReview: vi.fn(),
  useRecordSession: vi.fn(),
  getGlossaryTermDisplay: vi.fn(),
}));
vi.mock("@/lib/study/glossary");
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("ReviewSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useStudyHooks.useStudyPreferences as Mock).mockReturnValue({
      preferences: { languageMode: "en_to_en" },
      languageMode: "en_to_en",
      updatePreferences: vi.fn(),
    });
    (useStudyHooks.useDueTerms as Mock).mockReturnValue([
      { termSlug: "test-term-1", scheduledFor: Date.now() - 1000 },
      { termSlug: "test-term-2", scheduledFor: Date.now() - 500 },
    ]);
    (useStudyHooks.useProcessReview as Mock).mockReturnValue(vi.fn());
    (useStudyHooks.useRecordSession as Mock).mockReturnValue(vi.fn());
    (useStudyHooks.getGlossaryTermDisplay as Mock).mockImplementation((term, mode) => {
      if (mode === "en_to_en") {
        if (term.slug === "test-term-1") {
          return { prompt: "Test Term", answer: "Test Definition" };
        } else if (term.slug === "test-term-2") {
          return { prompt: "Second Test Term", answer: "Second Test Definition" };
        }
      }
      return { prompt: "", answer: "" };
    });
    (glossary.getGlossaryTermBySlug as Mock).mockImplementation((slug) => {
      if (slug === "test-term-1") {
        return {
          slug: "test-term-1",
          term_en: "Test Term",
          def_en: "Test Definition",
          term_zh: "测试术语",
          def_zh: "测试定义",
          units: [1],
          topics: [],
          synonyms: [],
          related: [],
        };
      } else if (slug === "test-term-2") {
        return {
          slug: "test-term-2",
          term_en: "Second Test Term",
          def_en: "Second Test Definition",
          term_zh: "第二个测试术语",
          def_zh: "第二个测试定义",
          units: [1],
          topics: [],
          synonyms: [],
          related: [],
        };
      }
      return undefined;
    });
  });

  it("renders the review session with the first due term", () => {
    render(<ReviewSession />);
    expect(screen.getByText("SRS Review")).toBeInTheDocument();
    expect(screen.getByText("Test Term")).toBeInTheDocument();
  });

  it("flips the card when clicked", () => {
    render(<ReviewSession />);
    const card = screen.getByText("Test Term");
    fireEvent.click(card);
    expect(screen.getByText("Test Definition")).toBeInTheDocument();
  });

  it("shows rating buttons after flipping the card", () => {
    render(<ReviewSession />);
    const card = screen.getByText("Test Term");
    fireEvent.click(card);
    expect(screen.getByText("Again")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });

  it("calls processReview mutation when a rating is selected", async () => {
    const processReviewMock = vi.fn();
    (useStudyHooks.useProcessReview as Mock).mockReturnValue(processReviewMock);
    render(<ReviewSession />);
    const card = screen.getByText("Test Term");
    fireEvent.click(card);
    fireEvent.click(screen.getByText("Good"));
    await waitFor(() => {
      expect(processReviewMock).toHaveBeenCalledWith({
        termSlug: "test-term-1",
        rating: "good",
      });
    });
  });

  it("advances to the next term when a rating is selected", async () => {
    render(<ReviewSession />);
    const card = screen.getByText("Test Term");
    fireEvent.click(card);
    fireEvent.click(screen.getByText("Good"));
    await waitFor(() => {
      expect(glossary.getGlossaryTermBySlug).toHaveBeenCalledWith("test-term-2");
    });
  });

  it("shows a completion summary when all terms are reviewed", async () => {
    (useStudyHooks.useDueTerms as Mock).mockReturnValue([{ termSlug: "test-term-1", scheduledFor: Date.now() - 1000 }]);
    render(<ReviewSession />);
    const card = screen.getByText("Test Term");
    fireEvent.click(card);
    fireEvent.click(screen.getByText("Good"));
    await waitFor(() => {
      expect(screen.getByText("Session Complete!")).toBeInTheDocument();
    });
  });

  it("shows 'All caught up' when there are no due terms", () => {
    (useStudyHooks.useDueTerms as Mock).mockReturnValue([]);
    render(<ReviewSession />);
    expect(screen.getByText("All caught up!")).toBeInTheDocument();
  });
});
