ALTER TABLE "installations" ADD COLUMN "github_org_name" text;--> statement-breakpoint
UPDATE installations i
SET
  github_org_name = i.github_org_id,
  github_org_id   = o.github_org_id
FROM organizations o
WHERE o.login   = i.github_org_id
  AND o.user_id = i.user_id;