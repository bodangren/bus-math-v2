# Specification: Account Settings & Self-Service Password Changes

## Overview

Replace the current placeholder settings and password-update experience with a functional account settings flow that lets authenticated users change their own password securely. This closes a documented product gap, improves the day-to-day student experience, and removes contradictory UI copy that currently says password updates are only handled by teachers/admins.

## Functional Requirements

### FR1: Secure Authenticated Password Change

The system shall allow an authenticated user to change their own password after entering their current password.

- Require the current password, a new password, and a confirmation of the new password.
- Reject requests when the current password is incorrect.
- Reject requests when the new password does not meet the minimum requirement for the caller’s role.
- Reject requests when the new password and confirmation do not match.
- Persist the new password hash, salt, and iteration count through the existing Convex credential store without adding new tables.

### FR2: Role-Aware Password Policy Messaging

The account settings UI shall explain password expectations clearly and enforce them consistently.

- Students must use a password with at least 6 characters.
- Teachers and admins must use a password with at least 8 characters and include at least one letter and one number.
- Error and success states must use plain, non-technical language.

### FR3: Real Account Settings Page

The `/settings` route shall become a usable account page rather than a placeholder.

- Show the signed-in user’s username, role, and organization context when available.
- Render the password update form directly on the settings page.
- Provide a focused, mobile-friendly layout consistent with the existing shadcn/Tailwind design system.
- Redirect or communicate clearly when the user is not signed in.

### FR4: Auth API and Session Compatibility

The password-change flow shall work with the existing JWT cookie session model.

- Add a dedicated authenticated API route for password changes.
- Resolve the current session claims from the request cookie.
- Look up the caller’s existing credential record, verify the current password, and update the credential atomically.
- Preserve the existing session cookie so users stay signed in after a successful password change.

## Non-Functional Requirements

- No new dependencies.
- No schema migrations or new Convex tables.
- Keep validation logic shared between route and UI where practical.
- Add automated coverage for route validation, Convex password update behavior, and the rendered settings/password UX.
- Preserve the current teacher-managed forgot-password/reset flow for forgotten credentials.

## Acceptance Criteria

- [ ] Given an authenticated student on `/settings`, when the page loads, then the page shows account details and a password change form instead of placeholder copy.
- [ ] Given the correct current password and a valid new password, when the user submits the form, then the password is updated successfully and a confirmation message is shown.
- [ ] Given an incorrect current password, when the user submits the form, then the request fails with a clear error and the password is not changed.
- [ ] Given a student enters a new password shorter than 6 characters, when the form submits, then the user sees a validation error.
- [ ] Given a teacher or admin enters a new password without both a letter and a number, when the form submits, then the user sees a validation error.
- [ ] Given the new password and confirmation do not match, when the form submits, then the user sees a validation error before the password is changed.
- [ ] Given a successful password change, when the user immediately signs out and signs back in with the new password, then authentication succeeds with the new password and fails with the old password.
- [ ] Given an unauthenticated request to the password-change API, when it executes, then the response is `401 Unauthorized`.

## Out of Scope

- Forgotten-password self-service recovery.
- Teacher-initiated resets beyond the existing reset flow.
- Password history enforcement.
- Multi-factor authentication.
