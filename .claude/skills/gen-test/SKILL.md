---
name: gen-test
description: Generate a vitest test file following project TDD conventions
disable-model-invocation: true
---

# Generate Test

Create a vitest test file for a given source file, following this project's conventions.

## Usage

`/gen-test <path-to-source-file>`

## Steps

1. Read the source file at the provided path to understand its exports.
2. Determine the test file path by mirroring the source path under `__tests__/` (e.g., `lib/foo/bar.ts` → `__tests__/lib/foo/bar.test.ts`).
3. If the test file already exists, read it and extend it with new tests for any untested exports.
4. Generate tests following project conventions:
   - `import { describe, expect, it } from 'vitest'`
   - Import module under test via `@/` alias
   - Create typed mock data at the top of describe blocks
   - Use clear, behavior-focused test names
   - For React components: use `@testing-library/react` and `@testing-library/user-event`
5. Write the test file.
6. Run `npx vitest run <test-file-path>` to verify tests execute.
7. Report which tests pass and which fail (failures are expected in TDD when implementation is pending).
