-- Migration: Add Competency Tables
-- Description: Create competency_standards and student_competency tables
-- Source: Generated from Drizzle schema (lib/db/schema/competencies.ts)

-- ============================================================================
-- Create competency_standards table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "competency_standards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"student_friendly_description" text,
	"category" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "competency_standards_code_unique" UNIQUE("code")
);

-- ============================================================================
-- Create student_competency table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "student_competency" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"standard_id" uuid NOT NULL,
	"mastery_level" integer DEFAULT 0 NOT NULL,
	"evidence_activity_id" uuid,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	CONSTRAINT "uq_student_competency_student_standard" UNIQUE("student_id","standard_id"),
	CONSTRAINT "chk_mastery_level_range" CHECK (mastery_level >= 0 AND mastery_level <= 100)
);

-- ============================================================================
-- Add foreign key constraints
-- ============================================================================

ALTER TABLE "student_competency" ADD CONSTRAINT "student_competency_student_id_profiles_id_fk"
  FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "student_competency" ADD CONSTRAINT "student_competency_standard_id_competency_standards_id_fk"
  FOREIGN KEY ("standard_id") REFERENCES "public"."competency_standards"("id") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "student_competency" ADD CONSTRAINT "student_competency_evidence_activity_id_activities_id_fk"
  FOREIGN KEY ("evidence_activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "student_competency" ADD CONSTRAINT "student_competency_updated_by_profiles_id_fk"
  FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;

-- ============================================================================
-- Add indexes
-- ============================================================================

-- Note: UNIQUE constraint on 'code' already creates an implicit index
-- Note: UNIQUE constraint on (student_id, standard_id) already creates a composite index
-- Only need explicit index on standard_id for reverse lookups
CREATE INDEX IF NOT EXISTS "idx_student_competency_standard_id" ON "student_competency" USING btree ("standard_id");
