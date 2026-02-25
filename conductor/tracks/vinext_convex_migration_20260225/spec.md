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
   - Migrate authentication from Supabase Auth to Convex Auth (`@convex-dev/auth`).
3. **Data Migration:**
   - Export existing data from Supabase and import to Convex via Convex's import tools or custom scripts.

## Out of Scope
- Major UI/UX changes.
