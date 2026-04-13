# Version Hash Manifest - Implementation Plan

## Track: version_hash_manifest_20260414

## Phase 1: Analyze and Plan

- [x] Audit current `computeComponentVersionHash` implementation - uses `Function.prototype.toString()` in `lib/component-approval/version-hashes.ts`
- [x] Identify all component files - activities in `components/activities/{subdir}/*.tsx`, families in `lib/practice/engine/families/*.ts`
- [x] Determine manifest structure - JSON with `{ activities: { [key]: hash }, practices: { [key]: hash } }`
- [x] Plan build script - Node.js script that scans source files and computes SHA-256 hashes

## Phase 2: Implement Build Script

- [x] Create `scripts/generate-component-manifest.ts`
- [x] Implement activity file scanning (`components/activities/{subdir}/*.tsx`)
- [x] Implement practice family file scanning (`lib/practice/engine/families/*.ts`)
- [x] Compute SHA-256 hashes from file content
- [x] Generate `lib/component-versions.json` manifest
- [x] Add to package.json scripts

## Phase 3: Integrate with Build

- [x] Update `npm run build` to run manifest generation before build
- [x] Ensure TypeScript types are generated for manifest
- [x] Handle missing manifest gracefully

## Phase 4: Update Hash Function

- [x] Update `lib/component-approval/version-hashes.ts` to read from manifest
- [x] Replace `Function.prototype.toString()` with manifest lookup
- [x] Add clear error for missing manifest

## Phase 5: Verification

- [x] Run `npm run lint` - 0 errors (2 pre-existing warnings)
- [x] Run `npm test` - all pass (1777 tests)
- [x] Run `npm run build` - manifest generated, build passes
- [x] Verify hashes stable across multiple builds