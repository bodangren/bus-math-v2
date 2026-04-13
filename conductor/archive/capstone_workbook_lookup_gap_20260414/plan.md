# Capstone Workbook Lookup Gap Fix - Implementation Plan

## Phase 1: Manifest and Client Lookup

- [ ] Update `scripts/generate-workbook-manifest.ts` to detect capstone files and add `byCapstone` object to manifest
- [ ] Regenerate `lib/workbooks-manifest.json` with new `byCapstone` structure
- [ ] Add `hasCapstoneStudentWorkbook()` and `hasCapstoneTeacherWorkbook()` to `workbooks.client.ts`
- [ ] Add unit tests for new capstone lookup functions

## Phase 2: API Route

- [ ] Create `/api/workbooks/capstone/[type]/route.ts` with GET handler
- [ ] Implement auth check (require active session)
- [ ] Implement role check (teacher workbook requires teacher role)
- [ ] Add path validation and file existence check
- [ ] Add unit tests for the new route

## Phase 3: UI Integration

- [ ] Update `app/capstone/page.tsx` to include capstone workbook download links
- [ ] Make teacher workbook link role-aware (only visible to teachers)
- [ ] Verify build passes

## Phase 4: Verification

- [ ] Run `npm run lint` - 0 errors
- [ ] Run `npm test` - all pass
- [ ] Run `npm run build` - passes
- [ ] Update `conductor/tracks.md` with new track entry
- [ ] Update `conductor/tech-debt.md` to mark item as closed