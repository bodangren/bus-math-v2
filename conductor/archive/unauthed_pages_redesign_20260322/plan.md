# Implementation Plan: Un-authed Pages Redesign

## Phase 1: Design System & Theming Updates
- [x] Task: Define the "Excel/Accounting" color palette and update Tailwind config.
    - [x] Add spreadsheet-inspired greens, ledger paper hues, and high-contrast text colors.
    - [x] Update primary, secondary, and accent CSS variables in `app/globals.css`.
- [x] Task: Update Typography and Base Styles.
    - [x] Refine font sizes, weights, and spacing in base layout.
    - [x] Ensure WCAG contrast ratios are met for the new palette.

## Phase 2: Core Layout and Component Refactoring
- [x] Task: Update global layout components for un-authed routes.
    - [x] Redesign header/navigation to align with the new vibrant, educational theme.
    - [x] Refactor footer to match the updated visual language.
- [x] Task: Implement shared UI animations and transitions.
    - [x] Add hover states to common interactive elements (buttons, links).
    - [x] Introduce lightweight page/section entry transitions.

## Phase 3: Page-Specific Redesigns
- [x] Task: Redesign the Home/Landing Page (`app/page.tsx`).
    - [x] Implement new grid structure and spacing.
    - [x] Apply "Excel/Accounting" theme elements (e.g., stylized grid backgrounds or ledger motifs).
    - [x] Integrate engaging animations for hero and feature sections.
- [x] Task: Redesign the Curriculum Overview Page (`app/curriculum/page.tsx`).
    - [x] Structure the 8 units visually as structured "workbooks" or "ledgers".
    - [x] Apply updated typography and color palette.
- [x] Task: Redesign Info Pages.
    - [x] Update Preface page (`app/preface/page.tsx`) layout.
    - [x] Update Capstone page (`app/capstone/page.tsx`) layout.

## Phase 4: Quality Assurance and Verification
- [x] Task: Responsive Design Review.
    - [x] Verify Home, Curriculum, and Info pages on mobile, tablet, and desktop viewports.
- [x] Task: Run automated verification.
    - [x] Run `npm run lint`.
    - [x] Run targeted Vitest coverage for modified components.
    - [x] Run `vinext build` to verify production deployment readiness.
