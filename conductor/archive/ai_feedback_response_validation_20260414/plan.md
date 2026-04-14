# AI Feedback Response Validation — Plan

## Phase 1: Zod Schema Validation for generateAiFeedback
- [x] Add Zod schema to validate AI response fields
- [x] Replace unsafe cast with safeParse
- [x] Add fallback for validation failure
- [x] Add 2 tests for wrong-type and out-of-range responses

## Phase 2: StudyHubHome useMemo languageMode Dependency
- [x] Add languageMode to weakTopics useMemo deps

## Verification Gates
- [x] npm run lint: 0 errors, 2 warnings (pre-existing)
- [x] npm test: 1832/1832 pass (305 files)
- [x] npm run build: passes cleanly