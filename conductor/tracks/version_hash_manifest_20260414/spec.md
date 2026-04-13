# Version Hash Build-Time Manifest

## Overview

Replace the current runtime `Function.prototype.toString()` approach for computing component version hashes with a build-time generated manifest. This eliminates minifier sensitivity and dev/prod drift.

## Problem

Currently, `computeComponentVersionHash` in `convex/component_approvals.ts` uses `Function.prototype.toString()` on practice/activity components to generate version hashes. This is problematic because:

1. **Minifier sensitivity**: Minification changes function.toString() output, causing hashes to differ between dev and production
2. **Dev/prod drift**: The same code produces different hashes after bundling/minification
3. **Stale detection unreliable**: Stale approval detection becomes unreliable across environments

## Solution

Generate a version manifest at build time that maps component keys to content hashes derived from source files. The manifest is generated via a Node.js script during `npm run build` and imported at runtime.

## Functional Requirements

1. Create a build-time script that scans component source files and computes content hashes
2. Generate a version manifest JSON file (`lib/component-versions.json`) with component key → hash mappings
3. Update `computeComponentVersionHash` to look up hashes from the manifest instead of using `Function.prototype.toString()`
4. Ensure the build script runs as part of `npm run build`
5. Handle missing manifest gracefully (fallback or error)

## Non-Functional Requirements

- Manifest must be reproducible (same content → same hash)
- Hash computation must use a stable algorithm (e.g., SHA-256 truncated)
- Build should fail clearly if manifest generation fails
- Components not in manifest should still work (error or fallback)

## Out of Scope

- Retroactive hashing of historical submissions
- Example component support (already deferred per tech debt)
- Changes to how approvals are stored or retrieved

## Acceptance Criteria

- [ ] Build script computes hashes from source file content
- [ ] Manifest JSON is generated at build time
- [ ] `computeComponentVersionHash` reads from manifest
- [ ] Dev and production builds produce identical hashes for same content
- [ ] Missing manifest causes build failure with clear error
- [ ] All existing tests pass
- [ ] Lint passes
- [ ] Build passes