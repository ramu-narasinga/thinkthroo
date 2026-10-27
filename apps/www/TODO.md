# Consulting page - TODO before launch

Everything below is a placeholder I (Claude) was explicitly told not to invent.
Nothing here is fake — these are the real inputs needed to finish the page.
Run `pnpm build` (or `npm run build`) and check the console: it prints every
unresolved `{{TODO: ...}}` it finds, and the page ships with `robots: noindex`
automatically until they're filled in. **`noindex` only blocks Google's
organic crawler — it does nothing to a paid click, so don't turn on any
Google Ads campaign until this list is clear.**

## 1. Global content (`lib/data/consulting/config.ts`)

- [ ] `pilotPriceFrom` — real starting price for a pilot project, e.g. `"$1,500"` (used in the Offer section and FAQ)

The page speaks as a team now, not a named individual — no bio/photo field
needed, so there's nothing else to fill in here.

## 2. Case study (`lib/data/consulting/content.ts`, `caseStudy` field)

This case study is about thinkthroo.com itself, not a client — it's real
content already, not a placeholder, nothing to fill in. If you'd rather use a
real client case study instead, say so and I'll swap this back to a template
with `{{TODO: ...}}` fields for problem/built/stack/result.

## 3. Booking

- [ ] **Fix the Cal.com event itself** (Cal dashboard, not code). The public
  `consultation` event is currently set to **45 min** and titled "Next.js
  consultation" (read off the live booking page). The page says **30 minutes**
  everywhere, and the event title shows inside the inline picker — set the length
  to 30 and rename it (e.g. "AI automation consultation") so the copy and the
  picker agree.
- [ ] Set `NEXT_PUBLIC_CONSULTING_BOOKING_URL` in `.env` to your real Cal.com link.
  - If unset, it falls back to the existing `siteConfig.links.consultation` cal.com URL.
  - The booking form embeds Cal's picker **inline**, right on the page, after someone
    submits their details — this only works for a `cal.com/...` URL. If you switch to
    a non-cal.com scheduler (e.g. Calendly), the page falls back to a plain link in a
    new tab, and `booked_call` won't fire (no confirmation callback available).
  - The embed is prefilled with the name/email/description the visitor already typed,
    so they don't retype anything before picking a slot.

## 4. Google Ads tracking (new env vars, all optional — tracking is a no-op if unset)

- [ ] `NEXT_PUBLIC_GOOGLE_ADS_ID` — e.g. `AW-123456789`
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_LABEL_FORM_SUBMIT` — conversion label for the lead-form submit action
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKED_CALL` — conversion label for a confirmed booking

Both labels come from the "conversion actions" you create in Google Ads (one
for form fills, one for booked calls). All 5 ad groups now point at the same
`/consulting` URL — differentiate them by ad group/keyword in Ads, not by
landing page.

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

- No testimonials, client logos, review scores, or consulting-experience claims. The one
  time-based line ("4 years studying large open-source projects") is your own stated
  fact about studying OSS, not client work — keep the wording as is.
- No specific cost-saving percentages anywhere (per your rule).
- No invented metrics. Every number on the page — 1,000+ monthly readers, 150+
  signups, 20+ skills, 6+ codebases studied (`sections/explore.tsx`) and the "4 years"
  line (`content.ts`) — is a figure you gave me directly. They'll go stale, so update
  them there as they grow.

## Notes on a few judgment calls

- **Team voice, not solo.** All copy now says "we"/"our team" instead of "I" — no
  individual name, photo, or bio anywhere. The India-specific "Built in India, run on
  US hours" section is gone entirely (you asked to cut it).
- **Audience = businesses, no "small"/"US" qualifier.** Hero and SEO title/description
  say "businesses" (you asked to drop the narrower wording) and lead with automation
  and AI workflows; the form's project-type dropdown has a matching "AI workflow
  automation" option. Agency/white-label copy still lives in the FAQ and the dropdown
  for the white-label ad group — cut it if that ad group is dead.
- **Booking form appears twice**, not behind a CTA button: once right under the hero,
  once again after the case study — so most visitors hit it without scrolling far.
  Each instance works independently (its own form state); filling out both would
  create two lead rows, which is an acceptable edge case, not something worth
  engineering around.
- **Copy trimmed across the board** (case study, offer, process, FAQ down from 10
  questions to 7) to cut reading before the form, per your "straight to the point"
  instruction.
- **One page, not five.** All 5 ad groups (chatbots, apps, RAG, white-label/offshore,
  general) now point at the single `/consulting` page instead of a dedicated page
  each. Message-match/Quality Score per keyword is weaker than five tailored pages
  would be, but that was an explicit tradeoff for simplicity over per-keyword tuning.
- **Booking is now inline, not a popup.** The old "Book a call" button that opened a
  Cal.com popup is gone. Now: fill in the lead-form fields → submit → Cal's own
  picker renders inline on the same page, prefilled. `form_submit` fires right after
  the form POST succeeds (regardless of whether they go on to book), `booked_call`
  fires separately when the Cal booking actually completes — same two conversion
  events as before, just triggered from one combined flow instead of two separate
  CTAs.
- **`/thank-you` page removed.** It existed only to fire `form_submit` after a
  redirect; now that the booking widget appears inline on the same page instead of
  redirecting, the conversion fires directly in the submit handler. `/booked` still
  exists as the redirect target after an actual Cal booking confirms.
- **`qualified_lead` event dropped.** Your earlier instructions said not to gate
  conversions on `budget_range` — I took that as "just fire `form_submit`
  unconditionally," so there's no separate qualified-tier event. `budget_range`
  is still captured and stored on every lead if you want to build that later.
- **Lead storage = Supabase table**, not a Google Sheet or email, to match the
  existing `request-access` pattern already in this repo (service-role client
  + Slack notification). Say so if you'd rather have a Sheet instead.
- **Attribution (gclid/UTMs) persists via `sessionStorage`**, not a cookie —
  first-touch only. This avoids adding a persistent tracking cookie / consent-banner
  question, but it means attribution resets if the visitor's session is reset (new
  tab after closing the browser, etc.). Tell me if you need cross-session persistence
  instead.
