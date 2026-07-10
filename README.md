# LaunchPod Media Reporting

A controlled monthly reporting workflow for podcast analytics: collect source evidence from Apple Podcasts Connect, Spotify for Creators, PodSEO, and hosting, verify every figure, add human context, generate report copy from deterministic rules, edit it, validate it, and publish a private client link plus PDF/HTML export.

This is not a general analytics dashboard — there is no LLM in the running app. Report copy comes from templates and rule-based interpretation in `lib/rules/`, applied to metrics an admin has explicitly verified.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript (strict) + Tailwind CSS v4
- Supabase (Postgres, Auth, Storage) for everything server-side
- Vercel for deployment

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then copy `.env.example` to `.env.local` and fill in the values from Project Settings → API:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Where to find it |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key (server-only, never expose to the browser) |
   | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally, your production URL once deployed |

3. **Run the migrations** in `supabase/migrations/` against your project, in order. Easiest path is the Supabase CLI:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   Or paste each file's contents into the SQL Editor in the Supabase dashboard, in filename order (`0001_...` through `0004_...`).

4. **Create an admin user.** This app has no self-serve signup — LaunchPod staff accounts are created directly in Supabase Auth (Authentication → Users → Add user, or `npx supabase auth admin` if you script it). Any authenticated Supabase user can access `/admin`.

5. **Seed the MWCN June 2026 demo report** (optional, but this is the project's acceptance test — it recreates the reference report end-to-end from verified metrics and section content):

   ```bash
   npm run seed
   ```

   This prints a private client link at the end (`/r/<token>`) you can open immediately without signing in.

6. **Run the dev server**

   ```bash
   npm run dev
   ```

   Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login) · Client links: `http://localhost:3000/r/<token>`

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it in Vercel and set the same four environment variables from `.env.local` in the Vercel project settings.
3. Deploy. No build-time Supabase access is required — all data fetching happens at request time.
4. Update `NEXT_PUBLIC_APP_URL` to your production domain so private-report links shown to admins are correct.

## Architecture notes

**Data model.** Five layers are kept deliberately separate so an editor's copy edit never mutates a verified figure: `report_uploads` (raw file) → `report_metrics` (extracted/entered value, tied to a source reference) → verification status on that same row → `report_observations` (rule-engine-generated interpretive text, `rule_id`-tagged) → `report_sections.content_json` (the human-edited, publish-ready copy). See `types/metrics.ts`, `types/report.ts`, `types/sections.ts`.

**Source authority.** `lib/rules/downloads.ts` is the single place Total Downloads is computed (Apple Plays + Spotify Plays, nothing else) — both the rule engine and `lib/validation/downloads-reconcile.ts` import it, so the display and the publish gate can never disagree. Same pattern for rank direction (`lib/rules/podseo-rank.ts`, lower is better) and the Apple-undercount bug guard (`lib/rules/apple-bug-guard.ts`, which refuses to touch Spotify metrics or explain an Apple increase).

**Parsers.** `lib/parsers/*.config.ts` are config-driven CSV column mappings per platform, built from the field labels actually seen in Apple/Spotify/PodSEO/Spreaker exports. Screenshots and PDFs are never auto-parsed in this MVP — they go through the source viewer + manual metric entry in `/admin/reports/[id]/metrics`, tied to a source reference and (for screenshots) a snapshot date, exactly as instructed for the MVP scope.

**Validation gates.** `lib/validation/run-all.ts` runs all 15 required checks and returns a blocking/warning verdict per check; publishing is refused server-side (`publishReport` in the editor's `actions.ts`) if any blocking check fails — this isn't just a UI affordance, `runValidation` is re-run inside `publishReport` itself.

**Editor.** Section content is edited as JSON against a typed shape (`types/sections.ts`) with a live preview next to it, rather than 14 bespoke WYSIWYG forms — an intentional MVP scope cut. "Restore generated version" re-runs the mechanical generator (`lib/report-builder/generate-sections.ts`) for the sections it can derive purely from metrics (snapshot stats, audience demographics, search visibility stats); narrative sections (episode performance, ratings, chart rankings, competitors, geography, cover) are entered directly, the same way an account manager would type up the finished copy today.

**Publishing security.** Client links use a 32-random-byte token (`generate_access_token()` SQL function) rather than the client's name or a sequential ID, are regenerable and can be disabled per client, and are served `noindex, nofollow`. The public `/r/[token]` routes use a service-role Supabase client (`lib/supabase/service.ts`, marked `server-only`) *after* validating the token and the report's `published` status — RLS on every admin table denies the `anon` role outright, so there is no code path where an unauthenticated request can see a draft, an uploaded source file, or another client's data.

**Export.** `components/export/export-bar.tsx` implements the commit → wait → print flow for PDF, plus a "Download HTML" button that inlines the page's stylesheets and serializes the rendered `#report-root` DOM into a standalone file — the same content is used for print and the browser view, which is what "no gradient text" and print-layout rules in `app/globals.css` are enforcing globally, not just under `@media print`.

## What's intentionally out of scope for this MVP

Per the product brief: universal OCR/chart recognition, automated login to any of the four platforms, Spotify/Apple API integrations, AI-written interpretation, client billing, white-label portals, real-time collaboration, and a client user-account system. Screenshot and PDF sources are handled by the source viewer + guided manual entry, not automatic extraction.

## Assumptions made

- **Episodes-published-this-month** isn't its own database field yet — the rule engine currently defaults it to the report's `expected_episode_frequency`. A real per-report episode count field would be a natural first follow-up if the low-episode-count trend-window rule needs to be more precise.
- **Recommendations** live in their own table (`recommendations`) rather than inside the "recommendations" report section's `content_json`, per the schema in the brief; `lib/report-builder/compose-render-sections.ts` is the one place they're merged back in for rendering.
- The **hosting/Spreaker** source config (`lib/parsers/hosting.config.ts`) only covers the fields actually present in the sample source deck (device/OS share) — day-of-week and per-episode hosting downloads are stubbed as commented-out examples pending a fuller export from the client.
