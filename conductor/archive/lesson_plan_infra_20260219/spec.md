# Specification: Lesson Plan Infrastructure & Unit 1 Pilot

## Overview
This track establishes a standardized, granular structure for the "Math for Business Operations v2" curriculum. We are moving from high-level matrices to detailed, file-per-lesson plans (`UXXLXX_{type}.md`). 

## 1. Lesson Types & Structural Formats
We define five distinct lesson types, categorized by their instructional format:

### Category A: The Six-Phase Model (Lessons 1–7)
Used for foundational and application lessons.
1.  **Unit Launch (`launch`):** Video hook, business simulation, and class discussion.
2.  **Accounting Foundation (`accounting`):** Principles with increasing depth.
3.  **Excel Application (`excel`):** Spreadsheet skills with increasing depth.
*Structure (Order Mandatory):* 
1. Entry 
2. Intro 
3. Guided 
4. Independent 
5. Checkpoint (Exit Ticket)
6. Reflection

### Category B: Project Sprint Format (Lessons 8–10)
Used for the three-day project build.
4.  **Project Sprint (`project`):** 
*Structure:* Goal Setting, Workshop/Studio Time, Milestone Checkpoint, Peer Feedback/Reflection.

### Category C: Assessment Format (Lesson 11)
Used for the final unit mastery check.
5.  **Summative Assessment (`assessment`):**
*Structure:* Instructions, Knowledge Check (MCQ/Fill), Understanding Check (Forms), Application Check (Mock Spreadsheet).

## 2. Directory & Naming Convention
- **Path:** `docs/curriculum/units/unit_XX/`
- **Naming:** `UXXLXX_{type}.md` (e.g., `U01L01_launch.md`, `U01L11_assessment.md`)
- **Manifest:** `unit_XX/manifest.md` to map the sequence and metadata.

## 3. Lesson File Components
All files will include:
- **Frontmatter (YAML):** Lesson ID, Type, Objectives, Narrative Hook (Sarah Chen context).
- **Asset References:** Links to specific Videos, Simulation IDs, or Starter Sheets.
- **Auto-Grade Data:** Embedded YAML/JSON for question definitions.
- **Teacher Notes:** Pedagogy and setup guidance.

## 4. Acceptance Criteria
- [ ] 5 Markdown templates created in `docs/curriculum/templates/` reflecting the distinct formats above.
- [ ] Unit 1 directory created with a `manifest.md`.
- [ ] 11 lesson files for Unit 1 generated:
    - L1-7: Following the updated 6-Phase structure.
    - L8-10: Following the Project Sprint structure.
    - L11: Following the Summative Assessment structure.
- [ ] All files include valid YAML frontmatter and placeholder content for Unit 1.
