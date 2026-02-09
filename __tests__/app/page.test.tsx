import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import Home from "../../app/page";

const mockCreateClient = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock("@/components/hero", () => ({
  Hero: ({
    stats,
  }: {
    stats: { unitCount: number; lessonCount: number; activityCount: number };
  }) => (
    <div data-testid="hero-stats">
      {stats.unitCount}|{stats.lessonCount}|{stats.activityCount}
    </div>
  ),
}));

function buildSupabaseClient({
  rpcResult,
  lessonCount,
  activityCount,
  lessonUnitRows,
  unitsRows,
}: {
  rpcResult: { data: unknown; error: { message: string } | null };
  lessonCount: number;
  activityCount: number;
  lessonUnitRows: Array<{ unit_number: number }>;
  unitsRows: Array<Record<string, unknown>>;
}) {
  return {
    rpc: vi.fn().mockResolvedValue(rpcResult),
    from: vi.fn((table: string) => ({
      select: vi.fn((fields: string, options?: { count?: "exact"; head?: boolean }) => {
        if (table === "activities" && options?.head) {
          return Promise.resolve({ count: activityCount, error: null });
        }

        if (table === "lessons" && options?.head) {
          return Promise.resolve({ count: lessonCount, error: null });
        }

        if (table === "lessons" && fields === "unit_number") {
          return Promise.resolve({ data: lessonUnitRows, error: null });
        }

        if (table === "lessons" && fields === "*") {
          return {
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({ data: unitsRows, error: null }),
            })),
          };
        }

        return Promise.resolve({ data: [], error: null });
      }),
    })),
  };
}

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses RPC stats when available", async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabaseClient({
        rpcResult: {
          data: {
            unitCount: 8,
            lessonCount: 40,
            activityCount: 120,
          },
          error: null,
        },
        lessonCount: 0,
        activityCount: 0,
        lessonUnitRows: [],
        unitsRows: [],
      }),
    );

    const page = await Home();
    render(page);

    expect(screen.getByTestId("hero-stats")).toHaveTextContent("8|40|120");
  });

  it("falls back to manual counts when RPC is unavailable", async () => {
    mockCreateClient.mockResolvedValue(
      buildSupabaseClient({
        rpcResult: {
          data: null,
          error: { message: "function get_curriculum_stats does not exist" },
        },
        lessonCount: 2,
        activityCount: 7,
        lessonUnitRows: [{ unit_number: 1 }, { unit_number: 1 }, { unit_number: 2 }],
        unitsRows: [
          {
            id: "lesson-1",
            unit_number: 1,
            title: "Lesson 1",
            slug: "lesson-1",
            description: "Desc",
            learning_objectives: null,
            order_index: 1,
            metadata: {},
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    );

    const page = await Home();
    render(page);

    expect(screen.getByTestId("hero-stats")).toHaveTextContent("2|2|7");
  });
});
