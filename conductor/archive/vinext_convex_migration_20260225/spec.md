# Specification: Vinext and Convex Migration

## Goal
Migrate the `bus-math-v2` Next.js frontend to use the Cloudflare Vinext plugin (or Vitest as testing framework), and replace the Supabase backend with Convex.

## Scope
1. **Frontend / SSR Migration:** 
   - Move from standard Next.js build to Vinext.
   - Setup `vinext` configuration and prepare for Cloudflare deployment.
2. **Backend Migration:**
   - Define Convex schema based on existing Supabase SQL schemas.
   - Create Convex queries and mutations to replace Supabase API calls.
   - Migrate authentication from Supabase Auth to Convex-backed username/password auth.
   - Authentication model constraints:
     - username/password only (no self-registration)
     - no email verification / reset-link / OTP / MFA flows
     - accounts are teacher/admin provisioned
     - middleware-guarded private routes with JWT role claims
   - Convex runtime compatibility constraints:
     - one code path must work for both local Convex (`npx convex dev`) and cloud Convex deployments
     - no dashboard deploy key requirement for local development
     - internal Convex auth/profile functions remain internal (not made public for convenience)
     - Convex endpoint and admin auth are resolved in one shared server adapter, not per-route fallbacks
     - startup/runtime must fail fast with explicit errors when Convex admin auth cannot be resolved
3. **Data Migration:**
   - Export existing data from Supabase and import to Convex via Convex's import tools or custom scripts.

## Out of Scope
- Major UI/UX changes.
