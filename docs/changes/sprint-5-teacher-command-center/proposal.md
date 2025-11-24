# Proposal: Sprint 5 - Teacher Command Center

## Problem Statement
While the current dashboard allows viewing progress, it lacks the "Power Tools" needed to manage a real classroom of 25+ students efficiently.
1.  **Onboarding Friction:** Creating students one-by-one is too slow for a whole class.
2.  **Limited Visibility:** The current list view doesn't show the "big picture" of class performance across standards/lessons.
3.  **Management Gaps:** Teachers cannot easily help students who forget passwords or need name corrections.

## Proposed Solution
We will build a "Teacher Command Center" focused on efficient classroom management and deep visibility.

1.  **Bulk Onboarding:**
    *   **Bulk Import:** Allow teachers to paste a list of names or upload a simple roster. The system will auto-generate usernames/passwords and create accounts in a single batch.
    *   **Credentials Sheet:** Automatically generate a printable view of all new student credentials for easy distribution in class.

2.  **Interactive Gradebook:**
    *   **Grid View:** A master matrix (Rows=Students, Columns=Lessons/Standards) replacing the simple list.
    *   **Visual Insights:** Color-coded cells (Green/Yellow/Red) based on completion or competency status.
    *   **Deep Dive:** Clicking a cell opens a detail view showing exactly what the student submitted (e.g., their specific spreadsheet answers).

3.  **Student Management:**
    *   **Quick Actions:** "Reset Password" and "Edit Details" available directly from the Gradebook view.

## Benefits
*   **Scalability:** Makes the platform viable for classes of any size.
*   **Actionable Insights:** Teachers can spot trends (e.g., "Everyone is failing Lesson 3") instantly via the visual grid.
*   **Admin Efficiency:** Reduces time spent on non-teaching tasks (account setup, password resets).

## Success Criteria
*   Teacher can onboard a class of 25 students in <5 minutes.
*   Gradebook loads efficiently for a full class.
*   Teacher can reset a student password in <30 seconds.
*   Teacher can click a gradebook cell to see the student's actual work.
