CREATE TABLE "activity_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"phase_number" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"idempotency_key" uuid NOT NULL,
	"completion_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_student_id_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "activity_completions_student_activity_idx" ON "activity_completions" USING btree ("student_id","activity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_completions_idempotency_key_idx" ON "activity_completions" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_activity_completions_student_id" ON "activity_completions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_activity_completions_lesson_id" ON "activity_completions" USING btree ("lesson_id");