import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("tsconfig vitest types", () => {
  it("includes vitest/globals in compilerOptions.types", () => {
    const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
    const raw = fs.readFileSync(tsconfigPath, "utf-8");
    const parsed = JSON.parse(raw) as {
      compilerOptions?: { types?: string[] };
    };

    expect(parsed.compilerOptions?.types).toContain("vitest/globals");
  });
});
