# Sprint 5: Tablet UX & Design Overhaul

**Epic**: TBD
**Status**: Proposed

## Overview
This sprint focuses on resolving critical UX defects identified on tablet devices (iPad Air/Pro). The goal is to improve navigation, content state visibility, interaction feedback, and accessibility to ensure a professional and trustworthy user experience.

## Scope
- Information Architecture & Navigation
- Content State & Trust (Placeholders)
- Interaction Design (Cards, Forms)
- Responsive Layout (Tablet/Mobile)
- Accessibility (Contrast, Focus, Semantics)

## Tasks

### Information Architecture & Navigation
- [ ] **Fix Hero Primary Action**: Consolidate hero CTAs. Remove "0 Units" counts. Add single "Browse Units" primary CTA.
- [ ] **Standardize Course Taxonomy**: Rename all references to "8 Units + Capstone" across nav, hero, and headers.
- [ ] **Simplify Navigation**: Remove duplicate section cards (Capstone, Glossary) from the body if they exist in the top nav.

### Content State & Trust
- [ ] **Hide Placeholder Metrics**: Implement loading states or conditional rendering for "0 Units" counts in the hero.
- [ ] **Hide Editorial Controls**: Ensure "Preview Website" and "Publish" bars are hidden on public/production deployments.
- [ ] **Standardize Header Capitalization**: Apply Title Case to H1/H2s and Sentence case to body text/CTAs globally.

### Interaction & Feedback
- [ ] **Improve Card Interactivity**: Make entire Curriculum/Reference cards clickable with visible hover/focus states.
- [ ] **Contextualize Inline Forms**: Add "Purpose", "Time", and "Save Progress" labels to "Getting Started Quiz" and vocab forms.
- [ ] **Fix Simulation CTA Hierarchy**: Redesign "60-Second Simulation" block to have one dominant "Run Simulation" button.

### Layout & Responsiveness
- [ ] **Optimize Tablet Hero Layout**: Stack hero image vertically or reduce width on tablet to keep CTA above the fold.
- [ ] **Normalize Section Spacing**: Apply consistent vertical rhythm (e.g., 24/32px) between all landing page sections.
- [ ] **Fix Icon Alignment**: Flex-align small metric icons (Units/Lessons) with text baselines.
- [ ] **Implement Unit Card Carousel**: Convert the course structure's unit cards on the home page into a carousel for better tablet space usage.

### Accessibility & Compliance
- [ ] **Fix Color Contrast**: darkening text/backgrounds on light blue cards to meet WCAG AA.
- [ ] **Add Focus Indicators**: Ensure visible focus outlines for all nav links, cards, and buttons.
- [ ] **Fix Heading Hierarchy**: Enforce H1 -> H2 -> H3 semantic structure and add ARIA landmarks (nav, main, footer).

### Terminology & Microcopy
- [ ] **Update Hero CTA Label**: Change "Start Reading" to "Browse Units" or "Open Curriculum".
- [ ] **Improve Search Visibility**: Replace "Smart Search" tiles with a prominent search bar or clear header entry point.
