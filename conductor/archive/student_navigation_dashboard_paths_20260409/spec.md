# Track Specification: Student Navigation and Dashboard Return Paths

## Overview
Repair the student-facing and shared authenticated navigation model so students and teachers can always reach the correct dashboard, move between lesson and unit context, and avoid dead-end routes. This track addresses breadcrumb navigation, missing dashboard links in shared chrome, and any dead student unit/dashboard return paths exposed by the current runtime.

## Functional Requirements
1. Add a role-aware dashboard destination to the shared authenticated user menu:
   - students go to the student dashboard
   - teachers/admins go to the teacher dashboard
2. Define the canonical student wayfinding contract for:
   - dashboard
   - unit overview
   - lesson
   - lesson phase
   - completed lesson state
3. Replace dead or misleading student breadcrumb/unit/dashboard links with links to real, supported routes.
4. Add the missing student unit-level navigation surface if the canonical breadcrumb contract requires it.
5. Ensure lesson error, empty, and completion states provide valid paths back into the student workflow.
6. Add regression coverage for the shared user menu dashboard link behavior and the primary student return-path states.

## Non-Functional Requirements
- Preserve the existing product language and visual style unless changes are required for clarity.
- Prefer shared helpers for dashboard and student-path generation instead of inline route strings.
- Desktop and mobile layouts must remain clean after the navigation changes.

## Acceptance Criteria
1. A signed-in student can always reach the student dashboard from shared authenticated chrome.
2. A signed-in teacher can always reach the teacher dashboard from shared authenticated chrome.
3. Student lesson breadcrumbs and return paths resolve to real routes instead of dead or implied pages.
4. If unit-level navigation is shown, it lands on a real student unit surface.
5. Regression tests cover the shared dashboard link behavior and the primary student lesson return states.

## Out of Scope
- Reworking student progress recommendations or completion logic beyond what is needed for valid navigation.
- Expanding teacher reporting data models.
