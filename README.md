# News Channel

Category-based news aggregator sourced only from public-service broadcasters
and official institutional feeds — see [PLANNING.md](./PLANNING.md) for the
full plan, source list, and legal notes.

Phase 1 MVP: web-only, free/non-commercial sources, anonymous
(local-storage-only) category/country preferences, no accounts.

## Setup

```bash
npm install
npm run db:push   # creates the local SQLite dev.db from prisma/schema.prisma
npm run ingest    # pulls all sources in src/lib/sources.ts into the database
npm run dev       # http://localhost:3000
```

## Scheduled ingestion

**Local dev** — run the scheduler in its own terminal, alongside `npm run dev`:

```bash
npm run schedule   # runs ingest immediately, then every 15 min (cron: */15 * * * *)
```

Override the interval with `INGEST_CRON` (standard 5-field cron syntax), e.g.
`INGEST_CRON="*/5 * * * *" npm run schedule` for every 5 minutes.

**Hosted deployment** — `npm run schedule` is a long-running process, which
doesn't fit a serverless host like Vercel. Use a platform cron instead:
- Vercel Cron Jobs calling a protected API route that runs the ingest logic, or
- a GitHub Actions scheduled workflow (`on: schedule`) running `npm run ingest`
  against the production `DATABASE_URL`.

## Project layout

- `src/lib/sources.ts` — the source list (Tier 2 broadcasters, Tier 3
  institutional feeds), category taxonomy, top-25 country list, and the
  state-affiliated-outlet flag list.
- `src/lib/categorize.ts` — keyword-based categorizer, country detector, the
  copyright-safe key-point extractor (works off the publisher's own RSS
  description, never full-text scraping), and the thumbnail-image extractor
  (publisher-declared `media:content`/`media:thumbnail`/enclosure only).
- `scripts/ingest.ts` — polls every source once, upserts articles; exports
  `runIngestOnce()` for reuse.
- `scripts/scheduler.ts` — repeats `runIngestOnce()` on a cron schedule for
  local dev / any long-running host.
- `src/app/api/feed/route.ts` — feed API; also computes the "Verified — 2+
  sources" vs. "Developing — single source" badge by clustering articles on
  a normalized title key.
- `src/components/Header.tsx`, `PersonalizeDrawer.tsx`, `NewsCard.tsx`,
  `Sidebar.tsx`, `src/app/page.tsx` — the UI: a sticky category nav, a
  slide-over panel for category/country selection (persisted to
  `localStorage` only), a hero + card-grid feed with publisher thumbnails
  (gradient placeholder when a story has none), and a transparency sidebar
  showing the verified-source mix.
- `prisma/schema.prisma` — SQLite for local dev; swap the datasource to
  `postgresql` + a `DATABASE_URL` (e.g. Supabase) for a hosted deployment.

## Before adding a new source

Check PLANNING.md section 3 (source tiers) and section 4 (legal aspects) —
in short: public-broadcaster RSS is fine to ingest headline+description and
link back; do not scrape or republish full article text without a license;
never make a state-affiliated outlet (RT, Xinhua, TASS, CGTN, PressTV) the
sole source for a story.
