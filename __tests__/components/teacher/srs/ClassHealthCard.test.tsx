import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClassHealthCard } from "../../../../components/teacher/srs/ClassHealthCard";
import type { ClassHealthSummary } from "../../../../components/teacher/srs/ClassHealthCard";

describe("ClassHealthCard", () => {
  it("renders loading state when health is null", () => {
    render(<ClassHealthCard health={null} />);

    expect(screen.getByText("Class Health")).toBeInTheDocument();
    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders health data correctly", () => {
    const healthData: ClassHealthSummary = {
      totalStudents: 25,
      studentsWithCards: 20,
      averageRetentionRate: 72.5,
      overdueCardCount: 8,
      cardsDueToday: 15,
      totalCards: 200,
      classId: "class-1",
    };

    render(<ClassHealthCard health={healthData} />);

    expect(screen.getByText("Class Health")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("72.5%")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Total Students")).toBeInTheDocument();
    expect(screen.getByText("Retention Rate")).toBeInTheDocument();
    expect(screen.getByText("Overdue Cards")).toBeInTheDocument();
    expect(screen.getByText("Due Today")).toBeInTheDocument();
  });

  it("renders zero values correctly", () => {
    const healthData: ClassHealthSummary = {
      totalStudents: 0,
      studentsWithCards: 0,
      averageRetentionRate: 0,
      overdueCardCount: 0,
      cardsDueToday: 0,
      totalCards: 0,
      classId: "class-1",
    };

    render(<ClassHealthCard health={healthData} />);

    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });

  it("shows student count with cards", () => {
    const healthData: ClassHealthSummary = {
      totalStudents: 30,
      studentsWithCards: 25,
      averageRetentionRate: 80,
      overdueCardCount: 5,
      cardsDueToday: 10,
      totalCards: 150,
      classId: "class-1",
    };

    render(<ClassHealthCard health={healthData} />);

    expect(
      screen.getByText(/25 of 30 students have started SRS practice/i)
    ).toBeInTheDocument();
  });
});