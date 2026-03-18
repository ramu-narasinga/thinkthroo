CREATE TABLE "course_enrollment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_slug" text NOT NULL,
	"module_slug" text NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_chapter_slug" text,
	"last_lesson_slug" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_user_module_enrollment" UNIQUE("user_id","course_slug","module_slug")
);
--> statement-breakpoint
ALTER TABLE "course_enrollment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_slug" text NOT NULL,
	"module_slug" text NOT NULL,
	"chapter_slug" text NOT NULL,
	"lesson_slug" text NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_user_lesson" UNIQUE("user_id","course_slug","module_slug","lesson_slug")
);
--> statement-breakpoint
ALTER TABLE "lesson_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "course_enrollment" ADD CONSTRAINT "course_enrollment_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Users can select their own enrollments" ON "course_enrollment" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own enrollments" ON "course_enrollment" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can update their own enrollments" ON "course_enrollment" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can delete their own enrollments" ON "course_enrollment" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can select their own lesson progress" ON "lesson_progress" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own lesson progress" ON "lesson_progress" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can update their own lesson progress" ON "lesson_progress" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can delete their own lesson progress" ON "lesson_progress" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));