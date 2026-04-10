# Implementation Plan: Student One-Shot Lesson Chatbot

## Phase 1: Provider and Infrastructure
- [x] Add OpenRouter provider configuration to `lib/ai/providers.ts` (or new provider file)
- [x] Add `OPENROUTER_API_KEY` environment variable support
- [x] Define the lesson context package type and assembly function
- [x] Write failing tests for lesson context packaging (bounded size, correct fields, Convex data integration)
- [x] Implement lesson context assembly from Convex published curriculum data
- [x] Verify the AI provider and retry wrapper work with OpenRouter endpoint

## Phase 2: API Route and Safety
- [x] Create `app/api/student/lesson-chatbot/route.ts` with POST handler
- [x] Add student role authentication check (reuse existing auth guards)
- [x] Add input validation and sanitization (question length, content type checks)
- [x] Implement rate limiting middleware or per-student throttle
- [x] Write failing tests for the API route: auth check, input validation, rate limiting, response shape
- [x] Implement the route: assemble context, call AI provider, return response
- [x] Add request logging for analytics
- [x] Verify all route tests pass

## Phase 3: Student UI Component
- [x] Write failing tests for the chatbot UI component (render, submit, reset, dismiss, accessibility)
- [x] Implement the floating bottom-right chatbot button component
- [x] Implement the expandable input and response display
- [x] Enforce one-shot constraint in UI (reset after response, no conversation history)
- [x] Add dismiss/close behavior
- [x] Add loading state and error handling for AI call failures
- [x] Integrate the chatbot component into the lesson page layout (student-only, authenticated-only)
- [x] Verify all UI component tests pass

## Phase 4: Integration and Verification
- [x] Write integration tests for the full chatbot flow (button → question → response → reset)
- [x] Verify lesson context scoping: responses reference lesson content, not general knowledge
- [x] Verify rate limiting works correctly under simulated load
- [x] Verify unauthenticated and non-student users cannot access the chatbot
- [x] Test on both desktop and mobile viewports
- [x] Run `npm run lint`, `npm test`, and `npm run build`
- [x] Update Conductor docs with the student AI infrastructure and chatbot conventions
- [x] Prepare the track for archive with verification evidence
