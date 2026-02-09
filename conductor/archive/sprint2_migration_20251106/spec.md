# Sprint 2: V1 Component Migration - Specification

## Overview
Migrate all 74 custom React components from v1 to v2, refactoring them to work with the Supabase-backed database architecture while maintaining educational effectiveness and adding comprehensive test coverage.

## Goals
1. Generate drizzle-zod schemas for type-safe DB integration
2. Set up Vitest with React Testing Library for component testing
3. Migrate all 74 custom components with database-shaped props
4. Add colocated tests with mocked DB responses for each component
5. Install all required dependencies (@hello-pangea/dnd, react-spreadsheet, recharts)
6. Document component patterns and testing guidelines

## Architecture
- **Type System**: drizzle-zod + Hybrid Props
- **Testing**: Vitest + React Testing Library + Colocated Tests
- **Directory**: `components/` (mirrors v1 structure initially)

## Migration Categories
- Layout & Navigation
- Student Lesson Components
- Unit Structure Components
- Interactive Exercises (Drag-drop, quizzes)
- Accounting Visualizations (T-Accounts, Financial Statements)
- Business Simulations
- Teacher Resources
- Accessibility Tools
