# Implementation Plan: Un-authed Pages Redesign

## Phase 1: Design System & Theming Updates
- [ ] Task: Define the "Excel/Accounting" color palette and update Tailwind config.
    - [ ] Add spreadsheet-inspired greens, ledger paper hues, and high-contrast text colors.
    - [ ] Update primary, secondary, and accent CSS variables in `app/globals.css`.
- [ ] Task: Update Typography and Base Styles.
    - [ ] Refine font sizes, weights, and spacing in base layout.
    - [ ] Ensure WCAG contrast ratios are met for the new palette.

## Phase 2: Core Layout and Component Refactoring
- [ ] Task: Update global layout components for un-authed routes.
    - [ ] Redesign header/navigation to align with the new vibrant, educational theme.
    - [ ] Refactor footer to match the updated visual language.
- [ ] Task: Implement shared UI animations and transitions.
    - [ ] Add hover states to common interactive elements (buttons, links).
    - [ ] Introduce lightweight page/section entry transitions.

## Phase 3: Page-Specific Redesigns
- [ ] Task: Redesign the Home/Landing Page (`app/page.tsx`).
    - [ ] Implement new grid structure and spacing.
    - [ ] Apply "Excel/Accounting" theme elements (e.g., stylized grid backgrounds or ledger motifs).
    - [ ] Integrate engaging animations for hero and feature sections.
- [ ] Task: Redesign the Curriculum Overview Page (`app/curriculum/page.tsx`).
    - [ ] Structure the 8 units visually as structured "workbooks" or "ledgers".
    - [ ] Apply updated typography and color palette.
- [ ] Task: Redesign Info Pages.
    - [ ] Update Preface page (`app/preface/page.tsx`) layout.
    - [ ] Update Capstone page (`app/capstone/page.tsx`) layout.

## Phase 4: Quality Assurance and Verification
- [ ] Task: Responsive Design Review.
    - [ ] Verify Home, Curriculum, and Info pages on mobile, tablet, and desktop viewports.
- [ ] Task: Run automated verification.
    - [ ] Run `npm run lint`.
    - [ ] Run targeted Vitest coverage for modified components.
    - [ ] Run `vinext build` to verify production deployment readiness.