-- Migration: Create student_spreadsheet_responses table
-- Description: Create table for storing student responses to spreadsheet-based activities
-- This migration was missing from the Supabase migrations directory, causing the RLS migration to fail

CREATE TABLE "student_spreadsheet_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"spreadsheet_data" jsonb NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_validation_result" jsonb,
	"submitted_at" timestamp,
	"draft_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_student_spreadsheet_responses_student_activity" UNIQUE("student_id","activity_id")
);

-- Foreign key constraints
ALTER TABLE "student_spreadsheet_responses"
  ADD CONSTRAINT "student_spreadsheet_responses_student_id_profiles_id_fk"
  FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "student_spreadsheet_responses"
  ADD CONSTRAINT "student_spreadsheet_responses_activity_id_activities_id_fk"
  FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id")
  ON DELETE cascade ON UPDATE no action;

-- Indexes for performance
CREATE INDEX "idx_student_spreadsheet_responses_student_id"
  ON "student_spreadsheet_responses" USING btree ("student_id");

CREATE INDEX "idx_student_spreadsheet_responses_activity_id"
  ON "student_spreadsheet_responses" USING btree ("activity_id");

-- Add helpful comment
COMMENT ON TABLE student_spreadsheet_responses IS 'Stores student responses for spreadsheet-based activities with auto-save draft functionality and validation results.';
