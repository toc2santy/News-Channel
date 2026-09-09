// Polls every source in src/lib/sources.ts, extracts key points from the
// publisher's own RSS description (no full-text scraping — see PLANNING.md
// section 4 on copyright), categorizes, tags country, and upserts into the
// database. Run via `npm run ingest` (schedule with cron/task scheduler).
import Parser from "rss-parser";
import { prisma } from "../src/lib/db";
import { SOURCES, STATE_AFFILIATED_OUTLETS } from "../src/lib/sources";
import { categorize, detectCountry, extractKeyPoints, clusterKey, extractImage } from "../src/lib/categorize";

// customFields pulls in the media:content / media:thumbnail tags most
// publishers use for article thumbnails (not part of rss-parser's defaults).
const parser: Parser<unknown, { mediaContent?: unknown; mediaThumbnail?: unknown }> = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

// Some publishers (UN News, PIB, CBC) reject rss-parser's default HTTP
// client — either its bare User-Agent/Accept headers trip WAF/bot rules
// (PIB/CBC), or the response comes back gzip-compressed and rss-parser's
// request layer doesn't transparently decompress it, feeding the XML parser
// raw gzip bytes (UN News). Fetching with a real browser UA via Node's own
// fetch (which does handle gzip transparently) and handing the decoded text
// to parser.parseString() sidesteps both issues uniformly.
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)),
  ]);
}

async function ingestSource(source: (typeof SOURCES)[number]) {
  let feed;
  try {
    const res = await withTimeout(fetch(source.url, { headers: BROWSER_HEADERS }), 20000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    feed = await parser.parseString(xml);
  } catch (err) {
    console.error(`[skip] ${source.name}: failed to fetch/parse (${(err as Error).message})`);
    return { ok: 0, failed: 0 };
  }

  let ok = 0;
  for (const item of feed.items ?? []) {
    const title = item.title?.trim();
    const link = item.link?.trim();
    if (!title || !link) continue;

    const description = item.contentSnippet ?? item.summary ?? item.content ?? "";
    const keyPoints = extractKeyPoints(description);
    const category = categorize(title, description, source.defaultCategory as never);
    const country = detectCountry(title, description, source.country);
    const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();
    const imageUrl = extractImage(item as never);

    try {
      await prisma.article.upsert({
        where: { link },
        create: {
          title,
          link,
          sourceName: source.name,
          sourceTier: source.tier,
          category,
          country,
          language: source.language,
          publishedAt,
          keyPoints: JSON.stringify(keyPoints.length ? keyPoints : [title]),
          imageUrl,
          clusterKey: clusterKey(title),
          isStateMedia: STATE_AFFILIATED_OUTLETS.has(source.name),
        },
        update: {}, // never overwrite an existing story with a re-poll
      });
      ok++;
    } catch (err) {
      console.error(`[error] upsert failed for "${title}": ${(err as Error).message}`);
    }
  }
  return { ok, failed: (feed.items?.length ?? 0) - ok };
}

// Exported so scripts/scheduler.ts can call it in-process (no subprocess
// spawning, no cross-platform path issues).
export async function runIngestOnce() {
  console.log(`Ingesting ${SOURCES.length} sources...`);
  for (const source of SOURCES) {
    const { ok } = await ingestSource(source);
    console.log(`  ${source.name}: ${ok} articles upserted`);
  }
  console.log("Done.");
}

// Only run + disconnect when invoked directly (`npm run ingest`), not when
// imported by the scheduler (which keeps a long-lived Prisma connection).
if (require.main === module) {
  runIngestOnce()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
