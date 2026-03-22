# Accounting Pedagogy Visual Language Standard

This document defines the common visual and structural DNA used across the Business Math v2 accounting components. This language ensures that every activity serves as both a functional tool and a pedagogical artifact.

## 1. High-Fidelity Artifact Replication
The foundational principle is that **the UI is the artifact**. Components do not merely list data; they visually replicate the professional documents they purport to teach.
*   **Authentic Layouts**: A Balance Sheet component must look like a physical Balance Sheet; a Journal Entry table must look like a page from a General Journal.
*   **Contextual Fidelity**: By using professional layouts (e.g., T-accounts, Ledger sheets), students build "visual muscle memory" for the documents they will encounter in professional practice.

## 2. Structural Hierarchy (The "Statement Skeleton")
Components use a strict, nested visual structure to represent the relationship between accounts and totals.
*   **Indentation-Driven Logic**: 
    *   **Headers (Bold/Caps)**: Major sections (ASSETS, LIABILITIES).
    *   **Sub-sections (Bold/Standard)**: Category groups (Current Assets, Operating Expenses).
    *   **Line Items (Indented)**: Individual accounts (Cash, Accounts Payable).
*   **Multi-Column Alignment**: Monetary values are aligned in the right-hand gutters using `font-mono` to ensure decimal precision and easy scanning.

## 3. Visual "Rulings" & Symbols
Standardized horizontal line treatments signal the status of a calculation.
*   **Single Underline (`border-t`)**: Indicates a sub-total is being calculated.
*   **Double Underline (`border-t-2`)**: Reserved for final, terminal totals (e.g., Total Assets).
*   **T-Account Bars**: Heavy `border-b-2` and `border-r-2` separate headers and columns, mimicking a hand-drawn accounting "T".

## 4. Color & Semantic Signaling
Color is used functionally to reinforce "Normal Balance" and account-type concepts.
*   **Debit/Credit Palette**: 
    *   **Blue (`bg-blue-50`)**: Associated with the Left/Debit side.
    *   **Red/Pink (`bg-red-50`)**: Associated with the Right/Credit side.
*   **Normalcy Toggles**: Use of `(+)` symbols to denote the normal balance side of an account type.
*   **Status Badges**: Semantic colors (Green for Balanced, Red for Out of Balance) provide immediate feedback on the state of the accounting equation.

## 5. Numerical Formatting Standards
*   **Currency**: Standard `en-US` formatting (`$1,234.00`).
*   **Negatives/Contra-Accounts**: Represented with parentheses `($1,234.00)` and often colored red (`text-red-600`) to indicate values that reduce a section total.
*   **Zero-State**: Represented by an em-dash (`—`) rather than `0` to reduce visual noise.

## 6. Pedagogical Layering (The "Learning Skin")
Every artifact can reveal its underlying logic through "teaching-mode" overlays.
*   **Formula Reveals**: Collapsible sections that explicitly state the equation being used.
*   **Mnemonic Integration**: References to patterns like DEA-LER (Debit: Dividends, Expenses, Assets | Credit: Liabilities, Equity, Revenue).
*   **Dynamic Health Indicators**: Providing ratios and interpretations alongside raw data to transition from "calculating" to "analyzing."
