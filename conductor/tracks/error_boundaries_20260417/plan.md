# Error Boundaries — Implementation Plan

## Phase 1: Shared Fallback Component and Student Route Boundary

### Tasks

- [x] Task: Create `components/error-fallback.tsx` reusable component
  - [x] Accept `error`, `reset` optional props
  - [x] Red-themed card with AlertTriangle icon
  - [x] "Try again" button calling `reset` if provided
  - [x] Dev-mode error details
- [x] Task: Create `app/student/error.tsx`
  - [x] Client component receiving `error` and `reset`
  - [x] Render shared ErrorFallback
  - [x] Log error to console
- [x] Task: Add tests for `app/student/error.tsx`
  - [x] Renders fallback on error
  - [x] Calls reset when try-again clicked

## Phase 2: Teacher Route Boundary

### Tasks

- [ ] Task: Create `app/teacher/error.tsx`
  - [ ] Client component receiving `error` and `reset`
  - [ ] Render shared ErrorFallback
- [ ] Task: Add tests for `app/teacher/error.tsx`
  - [ ] Renders fallback on error
  - [ ] Calls reset when try-again clicked

## Phase 3: Lesson Route Boundary

### Tasks

- [ ] Task: Create `app/student/lesson/error.tsx`
  - [ ] Client component receiving `error` and `reset`
  - [ ] Render shared ErrorFallback with "Back to Dashboard" link
- [ ] Task: Add tests for `app/student/lesson/error.tsx`
  - [ ] Renders fallback on error
  - [ ] Shows back-to-dashboard link

## Phase 4: LessonRenderer Component Boundary

### Tasks

- [ ] Task: Create `components/lesson/LessonRendererErrorBoundary.tsx`
  - [ ] Class-based error boundary
  - [ ] Inline fallback (not full-page takeover)
  - [ ] Preserves surrounding layout
- [ ] Task: Wrap `LessonRenderer` in the boundary
  - [ ] Update the page or parent that renders LessonRenderer
- [ ] Task: Add tests for LessonRenderer boundary
  - [ ] Catches errors and shows fallback
  - [ ] Preserves layout around fallback

## Phase 5: Verification and Documentation

### Tasks

- [ ] Task: Run `npm run lint` — fix any errors
- [ ] Task: Run `npm test` — ensure all tests pass
- [ ] Task: Run `npm run build` — ensure build succeeds
- [ ] Task: Update `tech-debt.md` — close error boundaries item
- [ ] Task: Update `lessons-learned.md` — add entry about error.tsx placement
