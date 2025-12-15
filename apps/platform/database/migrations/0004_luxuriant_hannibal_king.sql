ALTER TABLE "profiles" DROP CONSTRAINT "profiles_id_fkey";
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id");