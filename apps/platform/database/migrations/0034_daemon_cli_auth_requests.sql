CREATE TABLE "daemon_cli_auth_requests" (
	"code" text PRIMARY KEY NOT NULL,
	"runtime_id" uuid NOT NULL,
	"api_key" text NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daemon_cli_auth_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "daemon_cli_auth_requests" ADD CONSTRAINT "daemon_cli_auth_requests_runtime_id_daemon_runtimes_id_fk" FOREIGN KEY ("runtime_id") REFERENCES "public"."daemon_runtimes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "service role has full access to daemon_cli_auth_requests" ON "daemon_cli_auth_requests" AS PERMISSIVE FOR ALL TO "service_role" USING (true);
