# Specification: Un-authed Pages Redesign

## Overview
This track aims to improve the layout and branding of the un-authed pages to make them more engaging and interesting, moving away from the generic Next.js + shadcn/ui defaults. The design will focus on an "Educational" aesthetic (engaging, vibrant, and student-friendly) while strictly representing the core theme of Excel and accounting.

## Scope
The following public pages will be redesigned:
- Home Page (Landing)
- Curriculum Overview Page
- Info Pages (Preface, Capstone)

## Functional Requirements
- Redesign page layouts using improved typography, spacing, and grid systems.
- Introduce an updated color palette that reflects the Excel/accounting theme (e.g., spreadsheet greens, ledger paper hues) while remaining vibrant and student-friendly.
- Implement engaging animations and transitions (e.g., hover states, scroll effects) to make the site feel alive.
- Ensure the new designs are fully responsive across mobile, tablet, and desktop viewports.
- Update global layout components (headers, footers) if necessary to match the new branding for un-authed routes.

## Non-Functional Requirements
- Maintain accessibility standards (WCAG contrast ratios for new colors).
- Preserve existing server-side rendering and static generation performance (avoid heavy client-side animation libraries if CSS transitions or lightweight Framer Motion variants suffice).
- Ensure the branding feels cohesive with the overarching "Math for Business Operations" identity.

## Out of Scope
- Redesigning authenticated routes (Student Dashboard, Teacher Monitoring, Lesson flows).
- Modifying the underlying data models or Convex queries.
- Changes to the authentication flows/login forms (unless required for layout consistency).