# Track Specification: New Phase Planning

## Overview
Define the next phase of work after completing the cleanup/polish phase. Evaluate and prioritize candidate next phases: security vulnerability remediation, exercise component buildout, or Milestone 8 feature work.

## Functional Requirements
1. Review the current high-level priorities in `current_directive.md`
2. Evaluate each candidate next phase:
   - Security Vulnerability Remediation (26 npm vulnerabilities)
   - 14 Exercise Component Placeholders (build missing components)
   - Dead Code Pruning (remove 12 unregistered activity components)
   - Division Guards (low priority, add remaining division-by-zero guards)
3. Select the highest-priority next phase
4. Document the selected phase's scope, goals, and track order

## Non-Functional Requirements
1. Follow Conductor methodology
2. Update `current_directive.md` with the new phase plan
3. Ensure no breaking changes to existing functionality

## Acceptance Criteria
1. Next phase is documented in `current_directive.md`
2. First track of the new phase is created in `conductor/tracks/`
3. `tracks.md` is updated with the new track

## Out of Scope
- Implementing the next phase's work (only planning is in scope)
