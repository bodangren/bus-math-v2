import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { WeakFamiliesPanel } from "../../../../components/teacher/srs/WeakFamiliesPanel";
import type { FamilyPerformance } from "../../../../components/teacher/srs/WeakFamiliesPanel";

describe("WeakFamiliesPanel", () => {
  const sampleFamilies: FamilyPerformance[] = [
    {
      problemFamilyId: "transaction-effects",
      displayName: "Transaction Effects",
      againCount: 15,
      hardCount: 5,
      goodCount: 20,
      easyCount: 10,
      totalReviews: 50,
      againRate: 0.3,
      averageRating: 2.5,
    },
    {
      problemFamilyId: "balance-sheet",
      displayName: "Balance Sheet",
      againCount: 5,
      hardCount: 3,
      goodCount: 12,
      easyCount: 20,
      totalReviews: 40,
      againRate: 0.125,
      averageRating: 3.4,
    },
    {
      problemFamilyId: "income-statement",
      displayName: "Income Statement",
      againCount: 8,
      hardCount: 4,
      goodCount: 10,
      easyCount: 8,
      totalReviews: 30,
      againRate: 0.267,
      averageRating: 2.87,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    render(<WeakFamiliesPanel families={null} isLoading={true} />);

    expect(screen.getByText("Weak Families")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders empty state when no families", () => {
    render(<WeakFamiliesPanel families={[]} isLoading={false} />);

    expect(screen.getByText("Weak Families")).toBeInTheDocument();
    expect(
      screen.getByText(/No family performance data available yet/i)
    ).toBeInTheDocument();
  });

  it("renders families sorted by again rate descending", () => {
    render(<WeakFamiliesPanel families={sampleFamilies} isLoading={false} />);

    const familyNames = screen.getAllByText(/Transaction Effects|Income Statement|Balance Sheet/);
    expect(familyNames.length).toBe(3);

    expect(screen.getByText("Transaction Effects")).toBeInTheDocument();
    expect(screen.getByText("Income Statement")).toBeInTheDocument();
    expect(screen.getByText("Balance Sheet")).toBeInTheDocument();
  });

  it("shows again rate percentage correctly", () => {
    render(<WeakFamiliesPanel families={sampleFamilies} isLoading={false} />);

    expect(screen.getByText("30% Again")).toBeInTheDocument();
    expect(screen.getByText("27% Again")).toBeInTheDocument();
    expect(screen.getByText("13% Again")).toBeInTheDocument();
  });

  it("shows average rating", () => {
    render(<WeakFamiliesPanel families={sampleFamilies} isLoading={false} />);

    expect(screen.getByText("Avg: 2.50")).toBeInTheDocument();
    expect(screen.getByText("Avg: 2.87")).toBeInTheDocument();
    expect(screen.getByText("Avg: 3.40")).toBeInTheDocument();
  });

  it("shows review counts", () => {
    render(<WeakFamiliesPanel families={sampleFamilies} isLoading={false} />);

    expect(screen.getByText("50 reviews")).toBeInTheDocument();
    expect(screen.getByText("40 reviews")).toBeInTheDocument();
    expect(screen.getByText("30 reviews")).toBeInTheDocument();
  });

  it("calls onBumpPriority when button is clicked", () => {
    const handleBump = vi.fn();
    render(
      <WeakFamiliesPanel
        families={sampleFamilies}
        onBumpPriority={handleBump}
        isLoading={false}
      />
    );

    const bumpButtons = screen.getAllByText("Bump Priority");
    expect(bumpButtons.length).toBe(3);

    fireEvent.click(bumpButtons[0]);
    expect(handleBump).toHaveBeenCalledWith("transaction-effects");
  });

  it("expands family details when clicked", () => {
    render(<WeakFamiliesPanel families={sampleFamilies} isLoading={false} />);

    const transactionEffects = screen.getByText("Transaction Effects");
    fireEvent.click(transactionEffects);

    expect(screen.getByText("Again")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });
});