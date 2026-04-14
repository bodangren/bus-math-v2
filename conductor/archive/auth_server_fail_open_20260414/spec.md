# Auth Server Fail-Open Track

## Overview

Address the Medium severity issue where `requireActiveRequestSessionClaims` in `lib/auth/server.ts` fails open when the Convex backend is unavailable. Currently, if the Convex credential check throws (network error, timeout, etc.), the function catches the error and returns valid claims anyway, potentially allowing deactivated users to access the system during backend outages.

## Problem Statement

The current implementation at `lib/auth/server.ts:189-193`:

```typescript
} catch {
  // If the Convex check fails (network error, etc.), fail open
  // to avoid locking users out during transient backend issues.
  // The JWT signature and expiry are still validated above.
}
```

This fail-open behavior was intentional to avoid locking users out during transient Convex issues, but it creates a security gap: a user who was deactivated would retain access if the Convex check fails.

## Options

1. **Fail Closed (503)**: Return a 503 Service Unavailable when Convex check fails, forcing users through re-authentication
2. **Credential State Caching**: Cache the credential's deactivated status with a short TTL, reducing fail-open window
3. **Fail-Open with JWT Expiry Shortening**: Keep fail-open but reduce JWT lifetime to limit exposure window
4. **Keep As-Is with Enhanced Monitoring**: Document the trade-off and add observability

## Functional Requirements

- [ ] Implement chosen approach to address fail-open behavior
- [ ] Add tests verifying behavior under Convex failure scenarios
- [ ] Ensure JWT signature/expiry validation remains the primary security layer
- [ ] Do not break legitimate users during transient Convex outages
- [ ] Update inline documentation to reflect chosen design

## Non-Functional Requirements

- Response time impact: < 50ms added latency for the Convex credential check
- Fallback behavior must be intentional and documented
- No dependency changes without explicit approval

## Acceptance Criteria

1. `requireActiveRequestSessionClaims` handles Convex failures deterministically
2. Deactivated users cannot access the system during Convex outages (fail-closed)
3. Legitimate users are not locked out during transient Convex issues (graceful degradation)
4. All existing auth tests pass
5. New tests cover Convex failure scenarios
6. `npm run lint` passes
7. `npm test` passes
8. `npm run build` passes

## Out of Scope

- Changes to JWT lifetime or refresh mechanisms
- Vercel-specific deployment configurations
- Other auth/server.ts functions
- Cloudflare CI deployment (separate track)