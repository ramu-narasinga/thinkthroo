ALTER TABLE "team_invitations" ADD COLUMN "organization_id" uuid;
--> statement-breakpoint
ALTER TABLE "team_invitations" ADD COLUMN "invite_token" text;
--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_invite_token_unique" UNIQUE("invite_token");
--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
DROP POLICY IF EXISTS "authenticated users can view team_invitations" ON "team_invitations";
--> statement-breakpoint
CREATE POLICY "authenticated users can view their org team_invitations" ON "team_invitations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((EXISTS (SELECT 1 FROM organizations WHERE organizations.id = organization_id AND organizations.user_id = auth.uid())));
