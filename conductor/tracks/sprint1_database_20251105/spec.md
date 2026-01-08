# Sprint 1: Database Foundation - Specification

## Overview
Establish type-safe database architecture with Drizzle ORM, complete schema definitions, RLS policies, and validation utilities. Foundation for component refactoring with progress tracking.

## Goals
- Set up Drizzle ORM with Supabase
- Define core schemas (Lessons, Phases, Activities)
- Define user and progress schemas
- Define organization and class schemas
- Implement RLS policies
- Create initial migrations

## Schema Definitions
- **Lessons**: `lessons`, `phases`, `activities`, `resources`
- **Users**: `profiles`, `student_progress`, `activity_submissions`
- **Orgs**: `organizations`, `classes`, `class_enrollments`
- **Realtime**: `live_sessions`, `live_responses`
- **CMS**: `content_revisions`

## Validation
- Zod schemas for all JSONB fields
- `validateContentBlocks()`
- `validateActivityProps()`
