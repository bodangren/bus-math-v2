# Implementation Plan: SRS Daily Practice Core

## Phase 1: SRS Contract Types

### Task 1.1: Create lib/srs/ Directory [x]
- Create `lib/srs/` directory

### Task 1.2: Create SRS Contract [x]
- Create `lib/srs/contract.ts`
- Define the following types with Zod schemas:
  ```
  SrsRating: 'Again' | 'Hard' | 'Good' | 'Easy'
  SrsCardState: { problemFamilyId, studentId, card (ts-fsrs Card JSON), due, lastReview, reviewCount, createdAt }
  SrsReviewLog: { problemFamilyId, studentId, rating, scheduledAt, reviewedAt, elapsedDays, scheduledDays, reviewDurationMs, timingConfidence }
  SrsSession: { sessionId, studentId, startedAt, completedAt, cardCount, ratings: { again, hard, good, easy } }
  DailyQueue: { cards: SrsCardState[], sessionSize, generatedAt }
  SrsReviewResult: { card: SrsCardState, reviewLog: SrsReviewLog, rating: SrsRating }
  ```
- Version as `srs.contract.v1`
- Export all types and schemas

### Task 1.3: Write Contract Tests [x]
- Create `__tests__/lib/srs/contract.test.ts`
- Test that all schemas validate correct data
- Test that invalid data is rejected
- Test that `SrsRating` accepts only the four valid values
- Run: `npx vitest run __tests__/lib/srs/contract.test.ts`

## Phase 2: SRS Scheduler

### Task 2.1: Create Scheduler Module [x]
- Create `lib/srs/scheduler.ts`
- Import `ts-fsrs`: `createEmptyCard`, `FSRS`, `Rating`, `Card`
- Implement:
  - `createNewCard(problemFamilyId: string): SrsCardState` — creates an empty ts-fsrs card, sets due to now
  - `reviewCard(cardState: SrsCardState, rating: SrsRating): SrsCardState` — calls `fsrs.repeat()` with the stored card state and rating, returns updated card
  - `getCardsDue(cards: SrsCardState[], now?: number): SrsCardState[]` — filters cards where `due <= now`
  - `serializeCard(card: Card): unknown` — serializes ts-fsrs Card to JSON-safe object
  - `deserializeCard(data: unknown): Card` — deserializes back to ts-fsrs Card

### Task 2.2: Write Scheduler Tests [x]
- Create `__tests__/lib/srs/scheduler.test.ts`
- Test `createNewCard`:
  - Returns card with `due` set to approximately now
  - Returns card with `reviewCount = 0`
- Test `reviewCard`:
  - `Again` rating sets due to very soon (within a day)
  - `Easy` rating sets due further out than `Good`
  - `Good` rating increments stability
  - `Hard` rating provides slight interval increase
- Test `getCardsDue`:
  - Returns only cards where due date has passed
  - Returns empty array when all cards are scheduled for future
- Test serialization roundtrip:
  - `serializeCard` then `deserializeCard` produces equivalent card
- Run: `npx vitest run __tests__/lib/srs/scheduler.test.ts`

## Phase 3: Review Processor

### Task 3.1: Create Review Processor [x]
- Create `lib/srs/review-processor.ts`
- Import `mapPracticeToSrsRating` from `@/lib/practice/srs-rating` (ported in Track 1)
- Import scheduler functions from `./scheduler`
- Import types from `./contract`
- Implement:
  - `processPracticeSubmission(envelope: PracticeSubmissionEnvelope, cardState: SrsCardState | null, timing?: PracticeTimingSummary): SrsReviewResult`
  - Logic:
    1. If `cardState` is null, create a new card via `createNewCard`
    2. Call `mapPracticeToSrsRating({ parts: envelope.parts, timingFeatures: deriveTimingFeatures(timing, baseline) })`
    3. Call `reviewCard(cardState, rating)` to get updated card
    4. Build `SrsReviewLog` from the review data
    5. Return `{ card, reviewLog, rating }`

### Task 3.2: Write Review Processor Tests [x]
- Create `__tests__/lib/srs/review-processor.test.ts`
- Test with all-correct submission → `Good` or `Easy` rating
- Test with incorrect submission → `Again` rating
- Test with hints used → `Hard` rating
- Test with null card state → creates new card
- Test with existing card state → updates card
- Test with timing data → rating may be adjusted
- Run: `npx vitest run __tests__/lib/srs/review-processor.test.ts`

## Phase 4: Queue Builder

### Task 4.1: Create Queue Builder [x]
- Create `lib/srs/queue.ts`
- Implement:
  - `buildDailyQueue(cards: SrsCardState[], options?: { sessionSize?: number, now?: number }): DailyQueue`
  - Logic:
    1. Filter cards where `due <= now`
    2. Sort by due date ascending (most overdue first)
    3. Cap at `sessionSize` (default: 10)
    4. Return `DailyQueue` with the selected cards
  - `getQueueSummary(cards: SrsCardState[], now?: number): { totalDue: number, totalCards: number, averageOverdue: number }`

### Task 4.2: Write Queue Builder Tests [x]
- Create `__tests__/lib/srs/queue.test.ts`
- Test with no due cards → empty queue
- Test with all cards due → returns up to sessionSize
- Test with some cards due → returns only due cards
- Test ordering: most overdue cards come first
- Test sessionSize cap
- Test `getQueueSummary` calculations
- Run: `npx vitest run __tests__/lib/srs/queue.test.ts`

## Phase 5: Practice Family Mapping

### Task 5.1: Create Family-to-ProblemFamilyId Map [x]
- Create `lib/srs/family-map.ts`
- List all practice families A–U from `lib/practice/engine/family-registry.ts`
- Map each family key to a `problemFamilyId` string (use the family key directly)
- Export `getProblemFamilyId(gamilyKey: string): string`
- Export `getFamilyForProblemFamilyId(problemFamilyId: string): string | null`
- Export `getAllProblemFamilyIds(): string[]`

### Task 5.2: Write Family Map Tests [x]
- Create `__tests__/lib/srs/family-map.test.ts`
- Test that all registered practice families have a mapping
- Test roundtrip: `getFamilyForProblemFamilyId(getProblemFamilyId(key)) === key`
- Test unknown family key → returns the key as-is (no crash)
- Run: `npx vitest run __tests__/lib/srs/family-map.test.ts`

## Phase 6: Convex Schema and Functions

### Task 6.1: Add Convex Tables [x]
- Open the Convex schema file (likely `convex/schema.ts` or equivalent)
- Add `srs_cards` table:
  ```
  defineTable({
    studentId: v.id("profiles"),
    problemFamilyId: v.string(),
    card: v.any(), // serialized ts-fsrs Card
    due: v.number(),
    lastReview: v.number(),
    reviewCount: v.number(),
    createdAt: v.number(),
  }).index("by_student", ["studentId"])
    .index("by_student_due", ["studentId", "due"])
    .index("by_student_family", ["studentId", "problemFamilyId"])
  ```
- Add `srs_review_log` table:
  ```
  defineTable({
    studentId: v.id("profiles"),
    problemFamilyId: v.string(),
    rating: v.string(),
    scheduledAt: v.number(),
    reviewedAt: v.number(),
    elapsedDays: v.number(),
    scheduledDays: v.number(),
    reviewDurationMs: v.number().optional(),
    timingConfidence: v.string().optional(),
  }).index("by_student", ["studentId"])
    .index("by_student_family", ["studentId", "problemFamilyId"])
    .index("by_student_date", ["studentId", "reviewedAt"])
  ```

### Task 6.2: Create Convex Mutations [x]
- Create `convex/srs/mutations.ts` (or add to existing file)
- `upsertSrsCard(studentId, problemFamilyId, card, due, lastReview, reviewCount)`:
  - Check if card exists for `(studentId, problemFamilyId)`
  - If exists, update it
  - If not, insert it
- `recordSrsReview(studentId, problemFamilyId, rating, scheduledAt, reviewedAt, elapsedDays, scheduledDays, reviewDurationMs?, timingConfidence?)`:
  - Insert review log entry
  - Update the corresponding srs_card via `upsertSrsCard`

### Task 6.3: Create Convex Queries [x]
- Create `convex/srs/queries.ts` (or add to existing file)
- `getDueCards(studentId, now)`:
  - Query `srs_cards` where `studentId` matches and `due <= now`
  - Return array of card states
- `getStudentSrsSummary(studentId)`:
  - Return total card count, due count, and per-family statistics
- `getSrsCard(studentId, problemFamilyId)`:
  - Return single card for a specific family

### Task 6.4: Write Convex Function Tests [ ]
- Create tests for the mutations and queries
- Mock the Convex context (`ctx`) with in-memory storage
- Test `upsertSrsCard` creates new card
- Test `upsertSrsCard` updates existing card
- Test `recordSrsReview` writes log and updates card
- Test `getDueCards` filters correctly
- Test `getStudentSrsSummary` aggregates correctly

## Phase 7: Student Daily Practice Page

### Task 7.1: Create Daily Practice Page Route [ ]
- Create `app/student/practice/page.tsx`
- Auth guard: require student role
- Fetch due cards via `getDueCards` query
- Show queue summary (X problems due today)

### Task 7.2: Create Daily Practice Session Component [ ]
- Create `components/student/DailyPracticeSession.tsx`
- Renders a practice problem from the queue
- Uses the existing practice family infrastructure to generate and render problems
- After submission, calls `recordSrsReview` mutation
- Advances to next problem in queue
- Shows completion state when queue is empty

### Task 7.3: Write Page and Component Tests [ ]
- Create `__tests__/components/student/DailyPracticeSession.test.tsx`
- Test that due cards are displayed
- Test that submission records a review
- Test that completion state shows when queue is empty
- Test auth guard redirects non-students

## Phase 8: Verification

### Task 8.1: Run Full Verification Gates [ ]
- `npm run lint` — 0 errors
- `npm test` — all tests pass
- `npm run build` — clean
- Commit: `feat(srs): add FSRS-backed daily practice system with Convex persistence`
