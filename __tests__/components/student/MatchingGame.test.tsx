import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { MatchingGame } from "@/components/student/MatchingGame";
import * as useStudyHooks from "@/hooks/useStudy";
import * as glossary from "@/lib/study/glossary";
import * as nextNavigation from "next/navigation";

vi.mock("@/hooks/useStudy", () => ({
  useStudyPreferences: vi.fn(),
  useRecordSession: vi.fn(),
  getGlossaryTermDisplay: vi.fn(),
}));
vi.mock("@/lib/study/glossary", () => ({
  getGlossaryTermsByUnit: vi.fn(),
  GLOSSARY: [
    { slug: "term1", term_en: "Term 1", def_en: "Definition 1", units: [1], topics: [], synonyms: [], related: [] },
    { slug: "term2", term_en: "Term 2", def_en: "Definition 2", units: [1], topics: [], synonyms: [], related: [] },
    { slug: "term3", term_en: "Term 3", def_en: "Definition 3", units: [1], topics: [], synonyms: [], related: [] },
    { slug: "term4", term_en: "Term 4", def_en: "Definition 4", units: [1], topics: [], synonyms: [], related: [] },
    { slug: "term5", term_en: "Term 5", def_en: "Definition 5", units: [1], topics: [], synonyms: [], related: [] },
    { slug: "term6", term_en: "Term 6", def_en: "Definition 6", units: [1], topics: [], synonyms: [], related: [] },
  ],
}));
vi.mock("next/navigation");

describe("MatchingGame", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useStudyHooks.useStudyPreferences as Mock).mockReturnValue({
      preferences: { languageMode: "en_to_en" },
      languageMode: "en_to_en",
      updatePreferences: vi.fn(),
    });
    (useStudyHooks.useRecordSession as Mock).mockReturnValue(vi.fn());
    (useStudyHooks.getGlossaryTermDisplay as Mock).mockImplementation((term, mode) => {
      if (mode === "en_to_en") {
        return { prompt: term.term_en, answer: term.def_en };
      }
      return { prompt: "", answer: "" };
    });
    (glossary.getGlossaryTermsByUnit as Mock).mockReturnValue([
      { slug: "term1", term_en: "Term 1", def_en: "Definition 1", units: [1], topics: [], synonyms: [], related: [] },
      { slug: "term2", term_en: "Term 2", def_en: "Definition 2", units: [1], topics: [], synonyms: [], related: [] },
      { slug: "term3", term_en: "Term 3", def_en: "Definition 3", units: [1], topics: [], synonyms: [], related: [] },
      { slug: "term4", term_en: "Term 4", def_en: "Definition 4", units: [1], topics: [], synonyms: [], related: [] },
      { slug: "term5", term_en: "Term 5", def_en: "Definition 5", units: [1], topics: [], synonyms: [], related: [] },
      { slug: "term6", term_en: "Term 6", def_en: "Definition 6", units: [1], topics: [], synonyms: [], related: [] },
    ]);
    (nextNavigation.useSearchParams as Mock).mockReturnValue({
      get: vi.fn(() => null),
    });
  });

  it("renders the matching game with 6 pairs", () => {
    render(<MatchingGame />);
    expect(screen.getByText("Matching Game")).toBeInTheDocument();
  });

  it("selects a term and a definition", async () => {
    render(<MatchingGame />);
    const term1Text = await screen.findByText("Term 1");
    const term1Card = term1Text.closest(".rounded-xl") as HTMLElement;
    const def1Text = await screen.findByText("Definition 1");
    const def1Card = def1Text.closest(".rounded-xl") as HTMLElement;
    fireEvent.click(term1Card);
    expect(term1Card).toHaveClass("bg-primary/10");
    fireEvent.click(def1Card);
    await waitFor(() => {
      expect(term1Card).toHaveClass("bg-emerald-100");
    });
  });

  it("shows flash feedback for wrong matches", async () => {
    render(<MatchingGame />);
    const term1Text = await screen.findByText("Term 1");
    const term1Card = term1Text.closest(".rounded-xl") as HTMLElement;
    const def2Text = await screen.findByText("Definition 2");
    const def2Card = def2Text.closest(".rounded-xl") as HTMLElement;
    fireEvent.click(term1Card);
    fireEvent.click(def2Card);
    await waitFor(() => {
      expect(term1Card).toHaveClass("bg-red-100");
    });
  });

  it("shows summary when all pairs are matched", async () => {
    render(<MatchingGame />);
    const pairs = [
      ["Term 1", "Definition 1"],
      ["Term 2", "Definition 2"],
      ["Term 3", "Definition 3"],
      ["Term 4", "Definition 4"],
      ["Term 5", "Definition 5"],
    ];
    for (const [term, def] of pairs) {
      const termText = await screen.findByText(term);
      const termCard = termText.closest(".rounded-xl") as HTMLElement;
      const defText = await screen.findByText(def);
      const defCard = defText.closest(".rounded-xl") as HTMLElement;
      fireEvent.click(termCard);
      fireEvent.click(defCard);
      await waitFor(() => {
        expect(termCard).toHaveClass("bg-emerald-100");
      });
    }
    // Match the last pair
    const term6Text = await screen.findByText("Term 6");
    const term6Card = term6Text.closest(".rounded-xl") as HTMLElement;
    const def6Text = await screen.findByText("Definition 6");
    const def6Card = def6Text.closest(".rounded-xl") as HTMLElement;
    fireEvent.click(term6Card);
    fireEvent.click(def6Card);
    await waitFor(() => {
      expect(screen.getByText("Game Complete!")).toBeInTheDocument();
    });
  });
});
