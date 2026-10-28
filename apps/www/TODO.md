# Consulting page - TODO before launch

Everything below is a placeholder I (Claude) was explicitly told not to invent.
Nothing here is fake — these are the real inputs needed to finish the page.
Run `pnpm build` (or `npm run build`) and check the console: it prints every
unresolved `{{TODO: ...}}` it finds, and the page ships with `robots: noindex`
automatically until they're filled in. **`noindex` only blocks Google's
organic crawler — it does nothing to a paid click, so don't turn on any
Google Ads campaign until this list is clear.**

## 1. Global content (`lib/data/consulting/config.ts`)

- [x] **No price on the page.** You asked for the $2,000 starting price to come off the
  Offer card, so the Offer and the FAQ now say "fixed price, agreed before any work
  starts" with no number, and `pilotPriceFrom` is gone from the config. (The budget
  dropdown in the form still has its ranges: those are the visitor's budget, not a
  price.) No `{{TODO}}` placeholders are left in the content, so the page is indexable
  — `noindex` no longer applies. The ads / Cal / env items below still gate paid
  traffic, and ads must not quote a price either.

The page speaks as a team now, not a named individual — no bio/photo field
needed, so there's nothing else to fill in here.

## 2. Case studies (`lib/data/consulting/content.ts`, `caseStudies` field)

Two case studies — how the Think Throo blog is built, and how the software factory
(platform + local daemon) is built — written from reading the actual code in
`apps/www`, `apps/sanity-studio`, `apps/platform` and `apps/daemon`.
They describe architecture only, with no client stories and no invented results. The
framing ("what it is / why it matters to you") is my reading of the code, so skim
them and cut anything you wouldn't say yourself. If you'd rather use a real client
case study, say so and I'll add a template with `{{TODO: ...}}` fields.

## 3. Booking

- [x] **Booking event:** the inline picker uses the same 30-minute event the `/contact`
  page embeds — `cal.com/ramu-narasinga-rqy5ut/30min` ("30 Min Meeting", Cal Video;
  30 min confirmed off the live booking page) — so the "30-minute call" copy matches.
  The old default, `siteConfig.links.consultation`, is a 45-min "Next.js consultation"
  event; the homepage hero still uses it, untouched.
- [ ] `NEXT_PUBLIC_CONSULTING_BOOKING_URL` — optional override. **If it's already set
  in `.env` or Vercel, it wins over the default above**, so make sure it points at the
  30-minute event too (or delete it).
  - If unset, it falls back to the `/contact` page's 30-minute event.
  - The booking form opens Cal's picker in a **modal** right after someone submits their
    details (a "Pick a time" button reopens it) — this only works for a `cal.com/...`
    URL. If you switch to
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

## 5. Leads: Slack now, database later

**DB saving is OFF for now** — the Supabase egress quota is used up until it resets
on Monday 2026-11-02. `/api/consulting-lead` skips the `consulting_leads` insert and
posts the whole lead (contact details, the request, gclid and every UTM) to Slack
instead, then the visitor goes straight on to pick a time in the Cal picker modal.

- [ ] **`SLACK_WEBHOOK_URL` must be set in production while DB saving is off** — it's
  the only record of a lead. If Slack isn't configured or the post fails, the form
  shows an error rather than silently dropping the lead.
- [ ] **After Monday 2026-11-02:** set `CONSULTING_LEADS_SAVE_TO_DB=true` to start
  writing leads to the table again (Slack keeps posting either way).
- [ ] Run `supabase/consulting_leads.sql` in the Supabase SQL editor for the project
  behind your existing `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`. It
  creates the table, and it adds the new `phone` column if the table already exists
  (safe to re-run). Do this before DB saving goes back on, or inserts that include
  `phone` will fail.
- The lead form has a **required US phone field** with a fixed `+1` prefix (10 digits,
  stored as `+1XXXXXXXXXX`). It shows in the Slack message. The API treats it as
  optional so a stale form never gets a 400; drop `required` on the input in
  `booking-section.tsx` if you'd rather it be optional.

## 6. Offline conversion import (optional, for later)

Every lead row in `consulting_leads` stores `gclid` + `created_at` alongside
the rest of the fields, specifically so you can do a manual Google Ads
offline conversion import (CSV upload) later for leads that convert outside
the site (phone call, email back-and-forth, etc.) — the `submission_id` /
`gclid` / `created_at` columns are what that CSV needs. While DB saving is off
(section 5), the same values are in each Slack lead message instead — keep those
for the CSV.

## 7. Content I deliberately did NOT write

- No testimonials, client logos, review scores, or consulting-experience claims. The one
  time-based line ("4 years studying large open-source projects") is your own stated
  fact about studying OSS, not client work — keep the wording as is.
- No specific cost-saving percentages anywhere (per your rule).
- No invented metrics. Every number on the page — 1,000+ monthly readers, 150+
  signups, 20+ skills, 6+ codebases studied (`sections/explore.tsx`) and the "4 years"
  line (`content.ts`) — is a figure you gave me directly. They'll go stale, so update
  them there as they grow.

## 8. Legal pages (live in Sanity, not in this repo)

The footer now names the operating company (ThinkFiling Private Limited and its CIN; the
registered office is deliberately not shown there). The published Privacy Policy, Terms and Refund Policy are still the
May 2025 versions written for the learning platform and the code-review tool: they do
not mention the consulting form, the trackers the marketing site loads, or the company.
Update them in Sanity before paid traffic:

- [ ] All three: name the company ("ThinkFiling Private Limited, CIN U62011TS2026PTC223493,
  trading as Think Throo"), add its registered office, use a company email instead of a
  personal one, and show an effective date (the Terms refer to one that is not there).
- [ ] Privacy: add the consulting inquiry data (name, work email, US phone, project type,
  budget, description), where it goes (Slack, Cal.com, Supabase once DB saving is on) and
  how long you keep it for people who never create an account.
- [ ] Privacy: add the trackers the marketing site really loads: Google Ads conversion
  tracking with enhanced conversions (a hashed email goes to Google), the Reddit pixel and
  Umami. The policy only names PostHog, which is the platform's.
- [ ] Privacy: add Google, Reddit, Umami, Cal.com and Slack to the providers table, fix the
  Pinecone link (it points at pinecode.ai), and say data is processed in India and the US.
- [ ] Privacy: add a rights and contact section with a named grievance officer, and a line
  saying you may call or text people about their request.
- [ ] Terms: add a consulting section (the proposal governs each project, fixed price and
  payment, IP, confidentiality, AI outputs, liability, governing law) and say consulting is
  invoiced by the company directly, not through Dodo Payments (Dodo only handles Pro licence purchases).
- [ ] Refund Policy: add consulting (it only covers subscriptions, credits and courses).

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
- **Booking happens in a modal, right after the form.** The old "Book a call" button
  that opened a Cal.com popup is gone. Now: fill in the lead-form fields → submit →
  a modal opens with Cal's own picker, prefilled (it was briefly inline on the page,
  but the picker is too big for the hero column and broke the layout). Closing the
  modal leaves a "Pick a time" button to reopen it. `form_submit` fires right after
  the form POST succeeds (regardless of whether they go on to book), `booked_call`
  fires separately when the Cal booking actually completes — same two conversion
  events as before, just triggered from one combined flow instead of two separate
  CTAs.
- **`/thank-you` and `/booked` pages removed.** `/thank-you` existed only to fire
  `form_submit` after a redirect; now that the booking picker opens in a modal on the
  same page instead of redirecting, the conversion fires directly in the submit
  handler. When Cal confirms a booking, the booking card swaps in place to a "Call
  booked." message (CalInit announces it on `window`, no redirect) and `booked_call`
  still fires from that same listener.
- **`qualified_lead` event dropped.** Your earlier instructions said not to gate
  conversions on `budget_range` — I took that as "just fire `form_submit`
  unconditionally," so there's no separate qualified-tier event. `budget_range`
  is still captured and stored on every lead if you want to build that later.
- **Lead storage = Supabase table** (paused — see section 5), not a Google Sheet or
  email, to match the existing `request-access` pattern already in this repo
  (service-role client + Slack notification). Say so if you'd rather have a Sheet.
- **Attribution (gclid/UTMs) persists via `sessionStorage`**, not a cookie —
  first-touch only. This avoids adding a persistent tracking cookie / consent-banner
  question, but it means attribution resets if the visitor's session is reset (new
  tab after closing the browser, etc.). Tell me if you need cross-session persistence
  instead.
