# Consulting landing pages - TODO before launch

Everything below is a placeholder I (Claude) was explicitly told not to invent.
Nothing here is fake — these are the real inputs needed to finish the pages.
Run `pnpm build` (or `npm run build`) and check the console: it prints every
unresolved `{{TODO: ...}}` it finds, and any page still containing one ships
with `robots: noindex` automatically until it's filled in.

## 1. Global content (`lib/data/consulting/config.ts`)

- [ ] `engineerName` — your name
- [ ] `engineerPhoto` — path to a real photo, e.g. `/consulting/me.jpg` (drop the file in `public/consulting/`)
- [ ] `engineerBio` — 2-3 sentence bio
- [ ] `pilotPriceFrom` — real starting price for a pilot project, e.g. `"$1,500"` (used in the Offer section and FAQ on every landing page)

## 2. Case studies (`lib/data/consulting/case-studies.ts`)

Three placeholder entries exist (`support-chatbot`, `document-rag`,
`internal-ai-app`) — replace with real past work, or delete entries you don't
have material for (and remove their slugs from the `caseStudySlugs` array in
`lib/data/consulting/pages.ts`). Each needs:

- [ ] `title`, `industry`, `summary`
- [ ] `problem` — what the client's situation was before
- [ ] `whatIBuilt` — what you actually built
- [ ] `stack` — real technologies used
- [ ] `result` — a true, concrete result. **No invented percentages or numbers.**
- [ ] `screenshot` (optional) — path under `public/` if you have one

## 3. Booking link

- [ ] Set `NEXT_PUBLIC_CONSULTING_BOOKING_URL` in `.env` to your real Cal.com (or Calendly) link.
  - If unset, it falls back to the existing `siteConfig.links.consultation` cal.com URL.
  - If it's a `cal.com/...` URL, the booking button opens an in-page Cal.com popup and fires the `booked_call` conversion automatically on confirmation.
  - If it's not a cal.com URL (e.g. Calendly), the button becomes a plain link to that URL in a new tab, and `booked_call` won't fire (no confirmation callback available) — tell me if you want Calendly support added.

## 4. Google Ads tracking (new env vars, all optional — tracking is a no-op if unset)

- [ ] `NEXT_PUBLIC_GOOGLE_ADS_ID` — e.g. `AW-123456789`
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_LABEL_FORM_SUBMIT` — conversion label for the lead-form submit action
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKED_CALL` — conversion label for a confirmed booking

Both labels come from the "conversion actions" you create in Google Ads (one
for form fills, one for booked calls).

## 5. Database

- [ ] Run `supabase/consulting_leads.sql` once in the Supabase SQL editor for
  the project behind your existing `NEXT_PUBLIC_SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLE_KEY`. This creates the `consulting_leads` table the
  API route writes to.
- [ ] `SLACK_WEBHOOK_URL` (already a repo env var) — if set, you'll get a Slack
  message for every lead. Leave unset to just rely on the DB table.

## 6. Offline conversion import (optional, for later)

Every lead row in `consulting_leads` stores `gclid` + `created_at` alongside
the rest of the fields, specifically so you can do a manual Google Ads
offline conversion import (CSV upload) later for leads that convert outside
the site (phone call, email back-and-forth, etc.) — the `submission_id` /
`gclid` / `created_at` columns are what that CSV needs.

## 7. Content I deliberately did NOT write

- No testimonials, client logos, review scores, or "years of experience" claims anywhere.
- No specific cost-saving percentages anywhere (per your rule).
- Case study `result` fields are TODO, not invented numbers.

## Notes on a few judgment calls

- **`qualified_lead` event dropped.** Your later instructions said not to gate
  conversions on `budget_range` — I took that as "just fire `form_submit`
  unconditionally," so there's no separate qualified-tier event. `budget_range`
  is still captured and stored on every lead if you want to build that later.
- **Lead storage = Supabase table**, not a Google Sheet or email, to match the
  existing `request-access` pattern already in this repo (service-role client
  + Slack notification). Say so if you'd rather have a Sheet instead.
- **Attribution (gclid/UTMs) persists via `sessionStorage`**, not a cookie —
  first-touch only (first page in the session that has UTM params wins; later
  consulting pages visited in the same session don't overwrite it). This
  avoids adding a persistent tracking cookie / consent-banner question, but it
  means attribution resets if the visitor's session is reset (new tab after
  closing the browser, etc.). Tell me if you need cross-session persistence instead.
