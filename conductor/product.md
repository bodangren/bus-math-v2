# Product Guide: Math for Business Operations v2

## Initial Concept
An interactive, Supabase-backed digital textbook for teaching business mathematics to high school students. This Next.js application provides a comprehensive curriculum covering accounting fundamentals, financial analysis, and practical business calculations.

## Target Audience
- **High School Students**: The primary learners engaging with the curriculum, activities, and simulations.
- **Teachers**: Educators who manage the curriculum, monitor student progress, and utilize analytics to guide instruction.
- **Administrators**: School or district staff managing organization-level access and data.

## Core Value Proposition
- **Interactive Learning**: Moves beyond static text with hands-on activities, drag-and-drop exercises, and simulations.
- **Real-World Application**: Integrated Excel-like spreadsheet components and business simulations (e.g., cash flow, inventory) provide practical skills.
- **Comprehensive Tracking**: Detailed analytics allow teachers to monitor student performance across six distinct learning phases.
- **Role-Based Experience**: Tailored interfaces for students and teachers to maximize usability for each group.

## Key Features
- **Curriculum Delivery**: Structured "8 Units + Capstone" curriculum, utilizing granular, file-per-lesson infrastructure with three core instructional formats:
    - **Six-Phase Learning Model**: Foundational and application lessons (Entry to Reflection).
    - **Project Sprint Format**: Three-day immersive project build phases.
    - **Summative Assessment**: Unit-level mastery checks with auto-graded components.
- **Business Simulations**: Interactive scenarios for cash flow, inventory management, and pitch presentations.
- **Spreadsheet Integration**: Built-in spreadsheet tools for financial modeling and accounting exercises.
- **Progress Analytics**: Dashboards for tracking completion and mastery of learning objectives.
- **Multi-tenant Architecture**: Organization-based data isolation and access control.

## Curriculum Quality Standards

- Curriculum seeds are authored against enforceable lesson-type rules (accounting, excel, project, assessment).
- Auto-graded activities must include algorithmic `problemTemplate` definitions for deterministic regeneration and retesting.
- Unit summative assessments follow a tiered model (knowledge, understanding, application) mapped directly to unit standards.
- Project-day lessons must publish explicit deliverables for classroom accountability.

## System Boundaries & Responsibilities
- **Client UI (`app/`, `components/`)**: Renders lesson and dashboard experiences, captures user input, and displays server-validated results.
- **Application Server (Next.js routes/actions)**: Enforces session and role checks, orchestrates Supabase calls, and keeps service-role access on the server side only.
- **Supabase Platform**: Owns auth, persistence, row-level security, storage, and edge functions for privileged operations.
- **Conductor Planning Layer (`conductor/`)**: Owns implementation workflow, architectural guidance, and track execution status.

## Data Flow Overview
1. User interaction starts in a client component or server-rendered page.
2. Request is sent to a Next.js API route/server action with authenticated session context.
3. Server validates role/permissions, then queries Supabase tables or invokes edge functions.
4. Supabase enforces RLS and returns scoped data or mutation outcomes.
5. Server returns normalized payload to the UI for render/update, preserving least-privilege access.
