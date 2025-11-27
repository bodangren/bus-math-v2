-- Migration: Add Lesson Versioning Schema
-- Description: Create lesson versioning tables and add current_version_id column to lessons
-- This migration was missing from the Supabase migrations directory, causing production errors

-- Create lesson_versions table
CREATE TABLE "lesson_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" text,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_lesson_version" UNIQUE("lesson_id","version")
);

-- Create phase_versions table
CREATE TABLE "phase_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_version_id" uuid NOT NULL,
	"phase_number" integer NOT NULL,
	"title" text,
	"estimated_minutes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_lesson_version_phase" UNIQUE("lesson_version_id","phase_number")
);

-- Create phase_sections table
CREATE TABLE "phase_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phase_version_id" uuid NOT NULL,
	"sequence_order" integer NOT NULL,
	"section_type" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_phase_section_sequence" UNIQUE("phase_version_id","sequence_order")
);

-- Create lesson_standards table
CREATE TABLE "lesson_standards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_version_id" uuid NOT NULL,
	"standard_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_lesson_standard" UNIQUE("lesson_version_id","standard_id")
);

-- Add current_version_id column to lessons table (CRITICAL for production fix)
ALTER TABLE "lessons" ADD COLUMN "current_version_id" uuid;

-- Add standard_id column to activities table
ALTER TABLE "activities" ADD COLUMN "standard_id" uuid;

-- Add foreign key constraints
ALTER TABLE "lesson_versions"
  ADD CONSTRAINT "lesson_versions_lesson_id_lessons_id_fk"
  FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "phase_versions"
  ADD CONSTRAINT "phase_versions_lesson_version_id_lesson_versions_id_fk"
  FOREIGN KEY ("lesson_version_id") REFERENCES "public"."lesson_versions"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "phase_sections"
  ADD CONSTRAINT "phase_sections_phase_version_id_phase_versions_id_fk"
  FOREIGN KEY ("phase_version_id") REFERENCES "public"."phase_versions"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "lesson_standards"
  ADD CONSTRAINT "lesson_standards_lesson_version_id_lesson_versions_id_fk"
  FOREIGN KEY ("lesson_version_id") REFERENCES "public"."lesson_versions"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "lesson_standards"
  ADD CONSTRAINT "lesson_standards_standard_id_competency_standards_id_fk"
  FOREIGN KEY ("standard_id") REFERENCES "public"."competency_standards"("id")
  ON DELETE restrict ON UPDATE no action;

ALTER TABLE "activities"
  ADD CONSTRAINT "activities_standard_id_competency_standards_id_fk"
  FOREIGN KEY ("standard_id") REFERENCES "public"."competency_standards"("id")
  ON DELETE set null ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX "idx_lesson_versions_lesson_id" ON "lesson_versions" USING btree ("lesson_id");
CREATE INDEX "idx_lesson_versions_status" ON "lesson_versions" USING btree ("status");
CREATE INDEX "idx_lesson_standards_standard_id" ON "lesson_standards" USING btree ("standard_id");
CREATE INDEX "idx_activities_standard_id" ON "activities" USING btree ("standard_id");

-- Add helpful comments
COMMENT ON TABLE lesson_versions IS 'Stores versioned lesson content for editorial workflow and rollback capabilities';
COMMENT ON TABLE phase_versions IS 'Stores versioned phase content linked to lesson versions';
COMMENT ON TABLE phase_sections IS 'Stores ordered sections within phase versions';
COMMENT ON TABLE lesson_standards IS 'Links lesson versions to competency standards for learning objectives';
