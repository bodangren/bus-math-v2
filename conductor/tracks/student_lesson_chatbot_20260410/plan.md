# Implementation Plan: Student One-Shot Lesson Chatbot

## Phase 1: Provider and Infrastructure
- [x] Add OpenRouter provider configuration to `lib/ai/providers.ts` (or new provider file)
- [x] Add `OPENROUTER_API_KEY` environment variable support
- [x] Define the lesson context package type and assembly function
- [x] Write failing tests for lesson context packaging (bounded size, correct fields, Convex data integration)
- [x] Implement lesson context assembly from Convex published curriculum data
- [x] Verify the AI provider and retry wrapper work with OpenRouter endpoint

## Phase 2: API Route and Safety
- [ ] Create `app/api/student/lesson-chatbot/route.ts` with POST handler
- [ ] Add student role authentication check (reuse existing auth guards)
- [ ] Add input validation and sanitization (question length, content type checks)
- [ ] Implement rate limiting middleware or per-student throttle
- [ ] Write failing tests for the API route: auth check, input validation, rate limiting, response shape
- [ ] Implement the route: assemble context, call AI provider, return response
- [ ] Add request logging for analytics
- [ ] Verify all route tests pass

## Phase 3: Student UI Component
- [ ] Write failing tests for the chatbot UI component (render, submit, reset, dismiss, accessibility)
- [ ] Implement the floating bottom-right chatbot button component
- [ ] Implement the expandable input and response display
- [ ] Enforce one-shot constraint in UI (reset after response, no conversation history)
- [ ] Add dismiss/close behavior
- [ ] Add loading state and error handling for AI call failures
- [ ] Integrate the chatbot component into the lesson page layout (student-only, authenticated-only)
- [ ] Verify all UI component tests pass

## Phase 4: Integration and Verification
- [ ] Write integration tests for the full chatbot flow (button → question → response → reset)
- [ ] Verify lesson context scoping: responses reference lesson content, not general knowledge
- [ ] Verify rate limiting works correctly under simulated load
- [ ] Verify unauthenticated and non-student users cannot access the chatbot
- [ ] Test on both desktop and mobile viewports
- [ ] Run `npm run lint`, `npm test`, and `npm run build`
- [ ] Update Conductor docs with the student AI infrastructure and chatbot conventions
- [ ] Prepare the track for archive with verification evidence
