-- Run this once in the Supabase SQL editor for the project behind
-- NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. The API route
-- app/api/consulting-lead/route.ts writes here with the service-role
-- client, which bypasses RLS, so no policies are required for the app
-- to work - RLS is enabled below purely to keep the table locked down
-- from the anon/public key by default.

create table if not exists consulting_leads (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null unique,
  page_slug text not null,
  name text not null,
  work_email text not null,
  project_type text not null,
  budget_range text not null,
  description text not null,
  gclid text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  created_at timestamptz not null default now()
);

alter table consulting_leads enable row level security;

create index if not exists consulting_leads_created_at_idx
  on consulting_leads (created_at desc);
