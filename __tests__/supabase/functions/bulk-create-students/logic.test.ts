import { describe, expect, it } from "vitest";

import {
  buildDisplayName,
  generateUniqueUsername,
  sanitizeInput,
  slugify,
} from "../../../../supabase/functions/bulk-create-students/logic";

describe("bulk-create-students logic", () => {
  it("sanitizes and truncates input values", () => {
    expect(sanitizeInput("  Alice   ")).toBe("Alice");
    expect(sanitizeInput("x".repeat(80))).toHaveLength(50);
    expect(sanitizeInput(undefined)).toBe("");
  });

  it("slugifies preferred username and strips accents", () => {
    expect(slugify("Élodie Marie")).toBe("elodie_marie");
  });

  it("creates unique usernames with incremental suffixes", async () => {
    const reserved = new Set<string>(["alice", "alice_02"]);

    const username = await generateUniqueUsername(
      { preferredUsername: "Alice" },
      {
        exists: async (candidate) => candidate === "alice_03",
        reserved,
      },
    );

    expect(username).toBe("alice_04");
  });

  it("builds display name from first and last names", () => {
    expect(buildDisplayName("maria", "chen", "fallback")).toBe("Maria Chen");
    expect(buildDisplayName("", "", "fallback")).toBe("fallback");
  });

  it("handles high collision scenarios in a batch (30 students)", async () => {
    const baseUsername = "class_student";
    const batchSize = 30;
    const reserved = new Set<string>();
    
    // Mock exists: always returns false (simulating new usernames)
    // The collision logic primarily relies on the 'reserved' set for the current batch
    const exists = async () => false;

    const results: string[] = [];

    for (let i = 0; i < batchSize; i++) {
      const username = await generateUniqueUsername(
        { preferredUsername: baseUsername },
        { exists, reserved }
      );
      results.push(username);
    }

    expect(results).toHaveLength(batchSize);
    expect(results[0]).toBe("class_student");
    expect(results[1]).toBe("class_student_02");
    expect(results[29]).toBe("class_student_30");
    expect(new Set(results).size).toBe(batchSize);
  });
});
