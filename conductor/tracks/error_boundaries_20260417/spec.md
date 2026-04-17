# Error Boundaries — Specification

## Overview

Add Next.js `error.tsx` route boundaries to key app router segments and wrap `LessonRenderer` with a component-level `ErrorBoundary`. Currently, zero `error.tsx` files exist in `app/`, meaning any unhandled render error crashes the full page. This track adds graceful error recovery for student and teacher routes.

## Context

Pass 107 identified that the app has no route-level error boundaries. The `LessonRenderer` component also lacks an error boundary wrapper. When a render error occurs (e.g., malformed activity data, unexpected null in lesson content), the entire page becomes unusable. Next.js supports `error.tsx` convention for route-level boundaries, and React class components provide `componentDidCatch` for component-level boundaries.

## Functional Requirements

1. **Shared fallback component**: `components/error-fallback.tsx`
   - Reusable error UI using existing design system (Card, AlertTriangle)
   - "Something went wrong" heading
   - "Try again" button that calls `reset()` when available
   - Refresh page fallback when no reset available
   - Dev-mode error details collapsible

2. **Student route boundary**: `app/student/error.tsx`
   - Wraps all `/student/*` routes
   - Uses shared fallback with reset

3. **Teacher route boundary**: `app/teacher/error.tsx`
   - Wraps all `/teacher/*` routes
   - Uses shared fallback with reset

4. **Lesson route boundary**: `app/student/lesson/error.tsx`
   - Wraps `/student/lesson/[lessonSlug]` routes
   - Uses shared fallback with reset
   - Shows "Back to Dashboard" link

5. **LessonRenderer boundary**: `components/lesson/LessonRendererErrorBoundary.tsx`
   - Class-based ErrorBoundary wrapping `LessonRenderer`
   - Catches errors in lesson rendering and shows inline fallback
   - Preserves surrounding chrome (header, footer, navigation)

## Non-Functional Requirements

- Error boundaries must be Client Components (`'use client'`)
- UI must be consistent with existing `ContentBlockErrorBoundary` styling
- Reset action must retry rendering when supported (Next.js `reset` prop)
- All boundaries must log errors to console for observability

## Acceptance Criteria

1. `app/student/error.tsx` exists and renders graceful fallback on errors
2. `app/teacher/error.tsx` exists and renders graceful fallback on errors
3. `app/student/lesson/error.tsx` exists and renders graceful fallback on errors
4. `LessonRenderer` is wrapped with an error boundary that catches lesson-level errors
5. Each boundary has tests verifying fallback render and reset behavior
6. Existing tests continue to pass
7. `npm run build` succeeds

## Out of Scope

- Error tracking/telemetry services (Sentry, etc.)
- User-initiated bug reporting UI
- Server-side error handling (this is a client render boundary track)
