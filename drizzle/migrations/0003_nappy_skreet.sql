CREATE TABLE "lesson_standards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_version_id" uuid NOT NULL,
	"standard_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_lesson_standard" UNIQUE("lesson_version_id","standard_id")
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "phase_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phase_version_id" uuid NOT NULL,
	"sequence_order" integer NOT NULL,
	"section_type" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_phase_section_sequence" UNIQUE("phase_version_id","sequence_order")
);
--> statement-breakpoint
CREATE TABLE "phase_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_version_id" uuid NOT NULL,
	"phase_number" integer NOT NULL,
	"title" text,
	"estimated_minutes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_lesson_version_phase" UNIQUE("lesson_version_id","phase_number")
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "current_version_id" uuid;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "standard_id" uuid;--> statement-breakpoint
ALTER TABLE "lesson_standards" ADD CONSTRAINT "lesson_standards_lesson_version_id_lesson_versions_id_fk" FOREIGN KEY ("lesson_version_id") REFERENCES "public"."lesson_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_standards" ADD CONSTRAINT "lesson_standards_standard_id_competency_standards_id_fk" FOREIGN KEY ("standard_id") REFERENCES "public"."competency_standards"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_versions" ADD CONSTRAINT "lesson_versions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_sections" ADD CONSTRAINT "phase_sections_phase_version_id_phase_versions_id_fk" FOREIGN KEY ("phase_version_id") REFERENCES "public"."phase_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phase_versions" ADD CONSTRAINT "phase_versions_lesson_version_id_lesson_versions_id_fk" FOREIGN KEY ("lesson_version_id") REFERENCES "public"."lesson_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lesson_standards_standard_id" ON "lesson_standards" USING btree ("standard_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_versions_lesson_id" ON "lesson_versions" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "idx_lesson_versions_status" ON "lesson_versions" USING btree ("status");--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_standard_id_competency_standards_id_fk" FOREIGN KEY ("standard_id") REFERENCES "public"."competency_standards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activities_standard_id" ON "activities" USING btree ("standard_id");