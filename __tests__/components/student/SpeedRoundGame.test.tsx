import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import { SpeedRoundGame } from "@/components/student/SpeedRoundGame";
import * as useStudyHooks from "@/hooks/useStudy";
import * as glossary from "@/lib/study/glossary";
import * as nextNavigation from "next/navigation";

vi.mock("@/lib/study/utils", () => ({
  shuffleArray: <T,>(array: T[]) => [...array],
}));
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

describe("SpeedRoundGame", () => {
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

  it("renders the speed round game with countdown timer", () => {
    render(<SpeedRoundGame />);
    expect(screen.getByText("Speed Round")).toBeInTheDocument();
  });

  it("shows multiple-choice question with term and 4 definition options", async () => {
    render(<SpeedRoundGame />);
    await waitFor(() => {
      expect(screen.getByText(/Term \d/)).toBeInTheDocument();
    });
    const options = screen.getAllByRole("button", { name: /Definition \d/ });
    expect(options.length).toBeGreaterThanOrEqual(3);
  });

  it("submits a correct answer and increments streak", async () => {
    render(<SpeedRoundGame />);
    // Since shuffleArray is mocked to return the array as-is, Term 1 should be first
    const def1Button = await screen.findByText("Definition 1");
    fireEvent.click(def1Button);
    await waitFor(() => {
      expect(screen.getByText("Streak: 1")).toBeInTheDocument();
    });
  });

  it("submits a wrong answer and loses a life", async () => {
    render(<SpeedRoundGame />);
    const def2Button = await screen.findByText("Definition 2");
    fireEvent.click(def2Button);
    await waitFor(() => {
      expect(screen.getByText("Lives: 2")).toBeInTheDocument();
    });
  });
});