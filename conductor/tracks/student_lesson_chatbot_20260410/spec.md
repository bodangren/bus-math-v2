# Track Specification: Student One-Shot Lesson Chatbot

## Overview

Add a small bottom-right lesson helper that lets authenticated students ask a single question about the current lesson. The chatbot is strictly one-shot: no multi-turn conversation, no persistent memory, and the interaction resets after each response. This provides bounded, low-cost lesson clarification without turning the product into an open-ended chat tool.

## Functional Requirements

1. **AI provider integration**
   - Add an OpenRouter provider alongside the existing OpenAI provider in `lib/ai/providers.ts`
   - Use `openrouter/free` as the default model tier for student-facing chatbot calls
   - Support the existing retry wrapper and abort signal patterns from `lib/ai/retry.ts`
   - Configure via environment variables (`OPENROUTER_API_KEY`, model selection)

2. **Lesson context packaging**
   - Define a narrow lesson context package that the AI receives:
     - lesson title and unit context
     - current phase title and learning objectives
     - selected content summary from the published phase content
     - relevant accounting principles for the unit
   - Context must be assembled server-side from Convex published curriculum data
   - Context must be bounded: limit total prompt size to prevent token abuse

3. **API route**
   - Create `app/api/student/lesson-chatbot/route.ts` (POST)
   - Require authenticated student role
   - Accept: lesson ID, phase number, student question
   - Return: AI response scoped to lesson context
   - Enforce one-shot constraint: no session or conversation state stored
   - Add request rate limiting (per-student, per-lesson: max N requests per time window)
   - Log requests defensively for abuse monitoring

4. **Student UI component**
   - Bottom-right floating button on lesson pages, visible only to authenticated students
   - Expands to a single input field with submit button
   - Shows AI response inline after submission
   - Resets after each response: input clears, no conversation history
   - No second-turn capability enforced in UI design (input disabled or hidden after response)
   - Dismissible (student can close the helper)
   - Accessible: keyboard navigable, screen reader compatible

5. **Safety and guardrails**
   - Role check: only authenticated students can call the chatbot endpoint
   - Lesson scope enforcement: AI prompt explicitly constrains responses to the current lesson content
   - Input sanitization: strip markdown, code blocks, and excessively long input
   - Output filtering: responses should be lesson-relevant; add basic relevance check or system prompt constraint
   - Rate limiting: per-student throttle to prevent abuse
   - Analytics: log usage (lesson, phase, question length, response length) for monitoring before expanding scope

## Non-Functional Requirements

- Response latency: target < 5 seconds for the AI response
- OpenRouter free tier may have variable availability; handle gracefully with loading state and timeout
- No new runtime database tables required (stateless by design)
- Keep the existing teacher-facing AI provider infrastructure unchanged
- No new npm dependencies without explicit approval (use fetch for OpenRouter API)

## Acceptance Criteria

1. Authenticated students see a chatbot button on lesson pages
2. Student can submit one question and receive a lesson-scoped response
3. No second-turn conversation is possible (UI resets after response)
4. Unauthenticated users cannot access the chatbot endpoint
5. Rate limiting prevents abuse from individual students
6. Responses are scoped to the current lesson content, not general internet knowledge
7. Usage is logged for analytics
8. All verification gates pass: `npm run lint`, `npm test`, `npm run build`

## Out of Scope

- Multi-turn conversation or chat history
- Teacher-facing chatbot features
- AI feedback on submitted work (separate track)
- Changes to the existing teacher error analysis AI pipeline
- Content generation or curriculum authoring assistance
- Moderation queue or human review of responses
