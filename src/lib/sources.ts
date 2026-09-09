// Phase 1 (free / non-commercial MVP) source list — see PLANNING.md section 3.
// Only Tier 2 (public-service broadcasters) and Tier 3 (official institutional
// feeds) are wired up here. Tier 1 paid wire agencies (Reuters/AP/PTI/ANI) are
// deferred to Phase 3 once a licensing budget exists.
//
// NOTE: public RSS URLs change periodically without notice. Verify each URL
// resolves before relying on it in production, and re-check quarterly.

// Tier 4 here is independent editorial/trade press for verticals (games,
// gadgets, deep tech) that no wire agency or public broadcaster meaningfully
// covers — these are non-political categories where the state-propaganda
// concern PLANNING.md's Tier 1-3 system exists for doesn't apply, so a
// reputable specialist outlet is an acceptable stand-in rather than leaving
// the category empty. Still excludes op-ed/opinion desks, same as the rest
// of the source list.
export type SourceTier = 2 | 3 | 4;

export interface NewsSource {
  name: string;
  tier: SourceTier;
  url: string;
  defaultCategory: string;
  country?: string; // ISO-ish country label for the "international by country" filter
  language: string; // actual language the feed's text is in — used for the language filter
  isStateMedia?: boolean;
}

export const SOURCES: NewsSource[] = [
  // --- General / International (Tier 2 public broadcasters) ---
  { name: "BBC World", tier: 2, url: "http://feeds.bbci.co.uk/news/world/rss.xml", defaultCategory: "international", country: "United Kingdom", language: "English" },
  { name: "BBC Business", tier: 2, url: "http://feeds.bbci.co.uk/news/business/rss.xml", defaultCategory: "business", country: "United Kingdom", language: "English" },
  { name: "BBC Science & Environment", tier: 2, url: "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml", defaultCategory: "climate-environment", country: "United Kingdom", language: "English" },
  { name: "BBC Technology", tier: 2, url: "http://feeds.bbci.co.uk/news/technology/rss.xml", defaultCategory: "ai-tech", country: "United Kingdom", language: "English" },
  { name: "BBC Sport", tier: 2, url: "http://feeds.bbci.co.uk/sport/rss.xml?edition=int", defaultCategory: "sports", country: "United Kingdom", language: "English" },
  { name: "BBC Entertainment & Arts", tier: 2, url: "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", defaultCategory: "fiction-entertainment", country: "United Kingdom", language: "English" },
  { name: "DW (Deutsche Welle)", tier: 2, url: "https://rss.dw.com/rdf/rss-en-all", defaultCategory: "international", country: "Germany", language: "English" },
  { name: "Al Jazeera English", tier: 2, url: "https://www.aljazeera.com/xml/rss/all.xml", defaultCategory: "international", country: "Qatar", language: "English" },
  { name: "CBC World", tier: 2, url: "https://www.cbc.ca/cmlink/rss-world", defaultCategory: "international", country: "Canada", language: "English" },
  { name: "ABC News Australia", tier: 2, url: "https://www.abc.net.au/news/feed/51120/rss.xml", defaultCategory: "international", country: "Australia", language: "English" },
  // These four are added specifically to overlap with the above on major
  // world stories (same day, same event) so the cross-verification check in
  // src/app/api/feed/route.ts actually has multiple independent outlets to
  // compare — a single outlet can never self-verify.
  { name: "Euronews", tier: 2, url: "https://www.euronews.com/rss?level=theme&name=news", defaultCategory: "international", language: "English" },
  { name: "France 24", tier: 2, url: "https://www.france24.com/en/rss", defaultCategory: "international", country: "France", language: "English" },
  // Private commercial outlets, not public-service broadcasters — Tier 4
  // (same rationale as IGN/Ars Technica above), included only for their
  // world-news overlap value for cross-verification.
  { name: "The Guardian World", tier: 4, url: "https://www.theguardian.com/world/rss", defaultCategory: "international", country: "United Kingdom", language: "English" },
  { name: "Sky News World", tier: 4, url: "https://feeds.skynews.com/feeds/rss/world.xml", defaultCategory: "international", country: "United Kingdom", language: "English" },
  // NHK World (English) has no reliably-working public RSS URL — this is
  // NHK's domestic Japanese-language feed instead, confirmed working.
  { name: "NHK News (Japanese)", tier: 2, url: "https://www3.nhk.or.jp/rss/news/cat0.xml", defaultCategory: "international", country: "Japan", language: "Japanese" },
  // BBC's own Arabic-language desk — same Tier-2 broadcaster already in
  // this list, just its Arabic edition, rather than a new outlet. Pan-Arab
  // coverage, so no single default country (see detectCountry's
  // NATIVE_COUNTRY_NAMES in categorize.ts for how Arabic-script country
  // names still get matched per-article).
  { name: "BBC Arabic", tier: 2, url: "https://feeds.bbci.co.uk/arabic/rss.xml", defaultCategory: "international", language: "Arabic" },

  // --- Official / institutional (Tier 3) ---
  // NOTE: PIB's RSS Lang parameter is unreliable — this feed (Regid=3,
  // Delhi/national desk) serves mostly Hindi content regardless of Lang=1
  // vs Lang=2 in the URL (confirmed by direct testing; PIB's own site
  // exhibits the same inconsistency). Labeled "PIB India" rather than
  // claiming "English releases" until a genuinely English-only PIB feed
  // is found, and language is set to Hindi to match what it actually
  // serves. The categorizer's fiction-entertainment keywords include
  // Hindi terms specifically so Hindi-language culture/film-award releases
  // still get tagged correctly instead of falling into india-govt.
  { name: "PIB India", tier: 3, url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", defaultCategory: "india-govt", country: "India", language: "Hindi" },
  { name: "UN News", tier: 3, url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml", defaultCategory: "general-awareness", language: "English" },
  { name: "WHO News", tier: 3, url: "https://www.who.int/rss-feeds/news-english.xml", defaultCategory: "health-medicine", language: "English" },
  { name: "NASA News", tier: 3, url: "https://www.nasa.gov/news-release/feed/", defaultCategory: "space-astronomy", country: "United States", language: "English" },
  { name: "ESA", tier: 3, url: "https://www.esa.int/rssfeed/Our_Activities", defaultCategory: "space-astronomy", language: "English" },
  // Academic/institutional infectious-disease research center (University of
  // Minnesota) — overlaps with WHO News on outbreak/public-health stories
  // for cross-verification, same rationale as the international-news set.
  { name: "CIDRAP", tier: 3, url: "https://www.cidrap.umn.edu/rss.xml", defaultCategory: "health-medicine", country: "United States", language: "English" },

  // --- Independent editorial/trade press (Tier 4) — fills verticals no wire
  // agency or public broadcaster covers (games, gadgets, deep tech, EVs). ---
  { name: "IGN", tier: 4, url: "https://feeds.ign.com/ign/games-all", defaultCategory: "games", language: "English" },
  { name: "Eurogamer", tier: 4, url: "https://www.eurogamer.net/feed", defaultCategory: "games", language: "English" },
  { name: "Ars Technica Gadgets", tier: 4, url: "https://feeds.arstechnica.com/arstechnica/gadgets", defaultCategory: "electronics", language: "English" },
  { name: "MIT Technology Review", tier: 4, url: "https://www.technologyreview.com/feed/", defaultCategory: "ai-tech", language: "English" },
  { name: "CBC Business", tier: 2, url: "https://www.cbc.ca/cmlink/rss-business", defaultCategory: "business", country: "Canada", language: "English" },
  { name: "Climate Home News", tier: 4, url: "https://www.climatechangenews.com/feed/", defaultCategory: "climate-environment", language: "English" },
  { name: "Electrek", tier: 4, url: "https://electrek.co/feed/", defaultCategory: "automobiles-ev", language: "English" },
  { name: "Autocar", tier: 4, url: "https://www.autocar.co.uk/rss", defaultCategory: "automobiles-ev", country: "United Kingdom", language: "English" },
  // Defense trade press — factual industry/program reporting (acquisitions,
  // tests, deployments), not geopolitical opinion desks, per PLANNING.md
  // section 2's "factual/wire-only" scope for this category. The two
  // overlap on major program/conflict stories, giving cross-verification
  // something real to match.
  { name: "Defense News", tier: 4, url: "https://www.defensenews.com/arc/outboundfeeds/rss/", defaultCategory: "defence-aerospace", language: "English" },
  { name: "Breaking Defense", tier: 4, url: "https://breakingdefense.com/feed/", defaultCategory: "defence-aerospace", language: "English" },
];

export const CATEGORIES = [
  { id: "sports", label: "Sports" },
  { id: "games", label: "Games / Esports" },
  { id: "electronics", label: "Electronics & Gadgets" },
  { id: "science-invention", label: "Science & New Inventions" },
  { id: "space-astronomy", label: "Space & Astronomy" },
  { id: "ai-tech", label: "AI / Technology" },
  { id: "automobiles-ev", label: "Automobiles & EVs" },
  { id: "defence-aerospace", label: "Defence & Aerospace" },
  { id: "india-govt", label: "Indian Government Projects" },
  { id: "international", label: "International News" },
  { id: "climate-environment", label: "Climate & Environment" },
  { id: "health-medicine", label: "Health & Medicine" },
  { id: "general-awareness", label: "General Awareness" },
  { id: "business", label: "Business & Markets" },
  { id: "fiction-entertainment", label: "Fiction / Entertainment" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

// Curated country list for the "International news by country" filter.
export const TOP_COUNTRIES = [
  "India", "United States", "United Kingdom", "China", "Russia", "Pakistan",
  "Japan", "South Korea", "North Korea", "Germany", "France", "Israel",
  "Palestine", "Iran", "Saudi Arabia", "United Arab Emirates", "Ukraine",
  "Turkey", "Brazil", "South Africa", "Australia", "Canada", "Bangladesh",
  "Sri Lanka", "Nepal", "Indonesia",
];

// Primary language(s) associated with each country in TOP_COUNTRIES — used
// to populate the "Languages" filter once the user selects a country, so the
// option list matches what a native speaker there would actually expect.
// This is independent of whether we currently HAVE a source in that
// language: selecting a language with no matching content just returns an
// empty feed, same as any other filter combination with no results — it
// does not fabricate content.
export const COUNTRY_LANGUAGES: Record<string, string[]> = {
  India: ["Hindi", "English"],
  "United States": ["English"],
  "United Kingdom": ["English"],
  China: ["Mandarin Chinese"],
  Russia: ["Russian"],
  Pakistan: ["Urdu", "English"],
  Japan: ["Japanese"],
  "South Korea": ["Korean"],
  "North Korea": ["Korean"],
  Germany: ["German"],
  France: ["French"],
  Israel: ["Hebrew"],
  Palestine: ["Arabic"],
  Iran: ["Persian"],
  "Saudi Arabia": ["Arabic"],
  "United Arab Emirates": ["Arabic"],
  Ukraine: ["Ukrainian"],
  Turkey: ["Turkish"],
  Brazil: ["Portuguese"],
  "South Africa": ["English"],
  Australia: ["English"],
  Canada: ["English", "French"],
  Bangladesh: ["Bengali"],
  "Sri Lanka": ["Sinhala", "Tamil"],
  Nepal: ["Nepali"],
  Indonesia: ["Indonesian"],
};

// State-affiliated outlets: never used as the sole source for a story, and
// always rendered with a visible badge if ever included for cross-reference.
export const STATE_AFFILIATED_OUTLETS = new Set([
  "RT", "Xinhua", "TASS", "CGTN", "PressTV",
]);
