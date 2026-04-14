# Submit Attempt Numbering Race Condition Fix

## Overview

Fix a race condition in `submitSpreadsheet` where concurrent submissions from the same student for the same activity could receive the same `attemptNumber`. Convex serializes writes per document but the count+insert pattern is not atomic.

## Problem Statement

In `convex/activities.ts`, the `submitSpreadsheet` mutation computes the next attempt number by:
1. Querying existing attempts: `getAttemptCount` 
2. Incrementing in memory
3. Inserting with the computed number

If two submissions arrive concurrently before either commits, both could read the same count and receive the same `attemptNumber`.

## Functional Requirements

- Each submission for a given (student, activity) pair must receive a unique sequential attemptNumber starting at 1
- Concurrent submissions must never receive the same attemptNumber
- Existing submissions must not be affected

## Technical Approach

Use Convex's `sql` query with a transactional mutation to atomically compute and increment the attempt count. Convex supports `db.query()` within mutations for transactional consistency.

Alternative approaches:
1. Use a separate counter document with atomic increment
2. Use `transaction()` API to serialize the read-increment-write
3. Re-query with a unique constraint violation retry

The cleanest fix is to use Convex's `transaction()` to wrap the count+insert in an atomic block.

## Acceptance Criteria

- [ ] `submitSpreadsheet` atomically assigns unique attemptNumbers
- [ ] Concurrent submissions receive sequential attemptNumbers without collision
- [ ] Existing tests pass
- [ ] No performance regression in submission flow

## Out of Scope

- Schema changes to activities table
- Changes to other submission types (only spreadsheet submissions)

## Test Plan

1. Add unit test verifying concurrent submissions get unique attemptNumbers
2. Verify existing submitSpreadsheet tests still pass
3. Run full test suite