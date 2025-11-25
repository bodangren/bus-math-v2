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
--> statement-breakpoint
ALTER TABLE "student_spreadsheet_responses" ADD CONSTRAINT "student_spreadsheet_responses_student_id_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_spreadsheet_responses" ADD CONSTRAINT "student_spreadsheet_responses_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_student_spreadsheet_responses_student_id" ON "student_spreadsheet_responses" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_student_spreadsheet_responses_activity_id" ON "student_spreadsheet_responses" USING btree ("activity_id");