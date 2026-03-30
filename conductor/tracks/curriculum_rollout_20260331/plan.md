# Implementation Plan: Curriculum Rollout

## Phase 1: Audit Current Curriculum Wiring

### Tasks

- [ ] **Task: Audit Unit 1-2 family key references**
  - [ ] Review all activities in Units 1-2
  - [ ] Document current family key usage
  - [ ] Identify any deprecated keys (D, O standalone)

- [ ] **Task: Audit Unit 3-4 family key references**
  - [ ] Review all activities in Units 3-4
  - [ ] Document current family key usage
  - [ ] Identify gaps where new families R-U should be used

- [ ] **Task: Audit Unit 5-6 family key references**
  - [ ] Review all activities in Units 5-6
  - [ ] Document current family key usage
  - [ ] Verify merchandising content uses consolidated Q family

- [ ] **Task: Audit Unit 7-8 + Capstone family key references**
  - [ ] Review all activities in Units 7-8 and Capstone
  - [ ] Document current family key usage
  - [ ] Identify where financial analysis (Family U) should be integrated

## Phase 2: Update Family Key References

### Tasks

- [ ] **Task: Update Units 1-2 to stable keys**
  - [ ] Replace any D references with Q (statement-subtotals)
  - [ ] Replace any O references with Q (retail-income-statement)
  - [ ] Update L references to use rebuilt closing-entry variant
  - [ ] Verify guided vs independent mode configuration

- [ ] **Task: Update Units 3-4 to stable keys**
  - [ ] Apply family key updates
  - [ ] Add Families R-S where appropriate for interest/CVP content
  - [ ] Test activity loading

- [ ] **Task: Update Units 5-6 to stable keys**
  - [ ] Apply family key updates
  - [ ] Ensure merchandising lessons use correct Q configurations
  - [ ] Test activity loading

- [ ] **Task: Update Units 7-8 + Capstone to stable keys**
  - [ ] Apply family key updates
  - [ ] Integrate Families T-U for depreciation and financial analysis
  - [ ] Test activity loading

## Phase 3: Verification and Regression Testing

### Tasks

- [ ] **Task: Validate all family references**
  - [ ] Run family key validation script against all lessons
  - [ ] Ensure no orphaned references remain

- [ ] **Task: Run full test suite**
  - [ ] Execute `npm run lint`
  - [ ] Execute `npm test` — all tests must pass
  - [ ] Execute `npm run build` — production build must succeed

- [ ] **Task: Manual verification**
  - [ ] Spot-check lessons from each unit load correctly
  - [ ] Verify practice activities render with correct generators

## Phase 4: Finalize and Archive

### Tasks

- [ ] **Task: Update curriculum documentation**
  - [ ] Document final family key assignments per unit
  - [ ] Update any architecture docs referencing family usage

- [ ] **Task: Archive track**
  - [ ] Move track folder to `conductor/archive/`
  - [ ] Update `conductor/tracks.md`
  - [ ] Commit with message: `chore(conductor): Archive completed track`
