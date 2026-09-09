import { CategoryId, TOP_COUNTRIES } from "./sources";

// Rule-based keyword categorizer for the MVP. Replace/augment with an ML or
// LLM classifier once article volume makes keyword rules too noisy.
// Checked in this order — first match wins. "fiction-entertainment" is
// deliberately checked before "india-govt" so a PIB release about, say, the
// National Film Awards (which will also contain "ministry") gets tagged as
// entertainment rather than swallowed by the generic government-news catch.
const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  "fiction-entertainment": [
    "film", "movie", "novel", "book award", "literary", "box office", "national film award",
    "sahitya akademi", "sangeet natak akademi", "lalit kala akademi", "national school of drama",
    // Hindi equivalents — PIB releases are frequently Hindi-only, and the
    // categorizer runs on raw title/description text before any translation.
    "फिल्म", "राष्ट्रीय फिल्म पुरस्कार", "साहित्य अकादमी", "संगीत नाटक अकादमी", "सिनेमा",
  ],
  sports: ["cricket", "football", "olympic", "tennis", "match", "tournament", "medal", "athlete"],
  games: ["esports", "video game", "gaming", "playstation", "xbox", "steam"],
  electronics: ["smartphone", "gadget", "chip", "semiconductor", "processor", "device launch"],
  // Checked before "science-invention" so a generic "research"/"discovery"
  // story that's specifically about space/astronomy lands in the more
  // specific category rather than the broad catch-all.
  // Bare "space" and "galaxy" are deliberately excluded — "space" matches
  // "boot space"/"legroom space" in car reviews and "hangout space" in game
  // descriptions, and "galaxy" collides with the Samsung Galaxy phone line;
  // both are too generic for a category meant to be about actual astronomy.
  "space-astronomy": ["nasa", "esa", "astronomy", "telescope", "asteroid", "spacecraft", "space station", "space telescope", "space mission", "space agency", "outer space", "astronaut", "rocket launch", "moon landing", "exoplanet"],
  "science-invention": ["discovery", "invention", "research", "study finds", "breakthrough"],
  "ai-tech": ["artificial intelligence", "ai", "machine learning", "chatbot", "algorithm", "large language model"],
  // containsKeyword requires an exact word-boundary match, so plural forms
  // need their own entries ("hybrid car" doesn't match "hybrid cars").
  "automobiles-ev": [
    "electric vehicle", "electric vehicles", "ev sales", "automaker", "automakers",
    "car maker", "car makers", "hybrid car", "hybrid cars", "self-driving",
    "autonomous vehicle", "autonomous vehicles", "vehicle recall", "tesla",
    "electric car", "electric cars", "electric motorcycle", "supermini", "bhp",
  ],
  // Checked before "india-govt" so "Ministry of Defence" stories don't get
  // swallowed by that category's generic "ministry" keyword first — same
  // ordering principle as fiction-entertainment vs. india-govt above.
  // PLANNING.md section 2 scopes this to factual/wire coverage only, no
  // opinion/punditry — Defense News and Breaking Defense are trade-press
  // industry reporting (program status, acquisitions, tests), not
  // geopolitical commentary desks.
  "defence-aerospace": [
    "defence ministry", "defense ministry", "military", "airstrike", "air strike",
    "fighter jet", "aircraft carrier", "warship", "arms deal", "weapons system",
    "missile test", "missile strike", "missile", "drdo", "nato", "aerospace",
    "defence contractor", "defense contractor", "special forces", "army chief",
    "naval", "submarine",
    // Hindi — PIB frequently publishes Defence Ministry releases untranslated.
    "रक्षा मंत्री", "रक्षा मंत्रालय", "वायु सेना", "नौसेना", "थल सेना", "डीआरडीओ",
  ],
  "india-govt": ["ministry", "cabinet", "pib", "government of india", "lok sabha", "rajya sabha", "scheme"],
  international: [],
  // Checked before "general-awareness" so a climate/health story doesn't
  // fall into that broader catch-all instead.
  "climate-environment": ["climate", "emissions", "biodiversity", "wildlife", "pollution", "renewable energy", "deforestation", "global warming", "extreme weather", "drought", "wildfire"],
  // "who" is deliberately excluded — as a bare keyword it matches the common
  // English pronoun ("Who are the key actors...") far more often than the
  // WHO institution; sources whose defaultCategory is health-medicine (WHO
  // News, CIDRAP) don't need the keyword to land here anyway.
  "health-medicine": ["health", "disease", "vaccine", "hospital", "outbreak", "pandemic", "virus", "clinical trial", "medicine", "medical"],
  "general-awareness": ["education", "united nations", "public awareness"],
  business: ["market", "stock", "economy", "inflation", "trade", "earnings", "gdp"],
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Word-boundary matching, not plain .includes() — a substring match let
// "footballers" (in an unrelated crime story) trip the "football" keyword
// and get mis-tagged as Sports. Uses Unicode property escapes (\p{L}/\p{N})
// rather than \b, since plain \b is defined against ASCII [A-Za-z0-9_] and
// silently misbehaves on Devanagari (Hindi) text — PIB releases are often
// Hindi-only, and this categorizer needs to work on both scripts.
function containsKeyword(text: string, keyword: string): boolean {
  const boundary = "(?:^|[^\\p{L}\\p{N}])";
  const boundaryEnd = "(?:$|[^\\p{L}\\p{N}])";
  return new RegExp(`${boundary}${escapeRegExp(keyword)}${boundaryEnd}`, "iu").test(text);
}

export function categorize(title: string, description: string, fallback: CategoryId): CategoryId {
  const text = `${title} ${description}`;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [CategoryId, string[]][]) {
    if (keywords.some((kw) => containsKeyword(text, kw.trim()))) return category;
  }
  return fallback;
}

// English country names obviously never appear inside Japanese or Arabic
// script text, so a plain TOP_COUNTRIES scan would leave every NHK/BBC
// Arabic article country-less even when it's clearly about one of these
// places. Small, bounded alias list for the non-Latin sources we actually
// have — not an attempt at exhaustive multilingual coverage.
const NATIVE_COUNTRY_NAMES: Record<string, string[]> = {
  Japan: ["日本"],
  China: ["中国", "الصين"],
  India: ["भारत", "इंडिया", "الهند"],
  "United States": ["アメリカ", "米国", "الولايات المتحدة"],
  Russia: ["ロシア", "روسيا"],
  Pakistan: ["パキスタン", "باكستان"],
  "South Korea": ["韓国"],
  "North Korea": ["北朝鮮"],
  Palestine: ["فلسطين"],
  Israel: ["إسرائيل"],
  Iran: ["イラン", "إيران"],
  "Saudi Arabia": ["السعودية"],
  "United Arab Emirates": ["الإمارات"],
  Ukraine: ["أوكرانيا"],
  Turkey: ["تركيا"],
  Germany: ["ドイツ", "ألمانيا"],
  France: ["フランス", "فرنسا"],
  "United Kingdom": ["イギリス", "بريطانيا"],
  Nepal: ["نيبال"],
  Bangladesh: ["بنغلاديش"],
  "Sri Lanka": ["سريلانكا"],
  Indonesia: ["إندونيسيا"],
  Brazil: ["البرازيل"],
  "South Africa": ["جنوب أفريقيا"],
  Australia: ["أستراليا"],
  Canada: ["كندا"],
};

function findCountryIn(text: string): string | undefined {
  for (const country of TOP_COUNTRIES) {
    if (containsKeyword(text, country)) return country;
    if (NATIVE_COUNTRY_NAMES[country]?.some((alias) => text.includes(alias))) return country;
  }
  return undefined;
}

export function detectCountry(title: string, description: string, fallback?: string): string | undefined {
  // Check the title alone first: a story headlined "Nepal floods" that only
  // mentions "the Nepal-China border" once in the body was getting tagged
  // China instead of Nepal, because China happens to come first in
  // TOP_COUNTRIES. The title is the stronger signal of what a story is
  // actually about, so it gets first say; the description is just a
  // tie-breaker when the title itself names no country.
  return findCountryIn(title) ?? findCountryIn(`${title} ${description}`) ?? fallback;
}

// Cheap extractive "key points": split the RSS description into sentences and
// keep the first few. Copyright-safe because it works off the publisher's own
// short description field, not scraped full-text.
export function extractKeyPoints(description: string, max = 4): string[] {
  const clean = description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 8);
  return sentences.slice(0, max);
}

// Best-effort thumbnail extraction from the fields RSS publishers commonly
// use for images. We only ever use the publisher's own declared image
// (never scrape/hotlink something from inside the article body) — see
// PLANNING.md section 4 on copyright.
interface RawItemForImage {
  enclosure?: { url?: string; type?: string };
  mediaContent?: { $?: { url?: string } } | { $?: { url?: string } }[];
  mediaThumbnail?: { $?: { url?: string } };
}

export function extractImage(item: RawItemForImage): string | undefined {
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image")) {
    return item.enclosure.url;
  }
  const media = item.mediaContent;
  if (Array.isArray(media)) {
    const withUrl = media.find((m) => m?.$?.url);
    if (withUrl?.$?.url) return withUrl.$.url;
  } else if (media?.$?.url) {
    return media.$.url;
  }
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  return undefined;
}

// Common short filler words that carry no story-identifying signal — dropped
// so cross-source matching keys on the words that actually distinguish one
// story from another (names, places, events).
const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "at", "to", "for", "and", "or", "with",
  "from", "by", "is", "are", "was", "were", "after", "before", "amid", "over",
  "as", "its", "his", "her", "their", "says", "say", "said", "new", "into",
  "out", "up", "down", "during", "this", "that", "has", "have", "had", "be",
  "will", "not", "but", "who", "what", "how", "why", "amp",
]);

// Produces a bag-of-significant-words key for cross-source dedup/verification
// (see PLANNING.md section 3's "2+ independent sources" rule, applied in
// src/app/api/feed/route.ts). Deliberately NOT ASCII-only: an earlier version
// used [^a-z0-9\s], which strips every Devanagari/Arabic character and
// collapses all non-Latin-script titles to the same empty key — silently
// cross-verifying unrelated Hindi (PIB) and Arabic (BBC Arabic) stories
// against each other. \p{L}/\p{N} keeps any script's letters/digits instead.
// Sorted + deduped so word order and repeats don't matter; the API layer
// does overlap-based (not exact) matching on top of this, since two outlets
// covering the same event rarely phrase the headline identically.
export function clusterKey(title: string): string {
  const cleaned = title.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
  const words = cleaned
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const significant = [...new Set(words)].sort();
  // Fallback for titles that are entirely short/stopword tokens (rare) —
  // still unicode-safe, just less discriminating.
  return significant.length ? significant.join(" ") : cleaned.trim().split(/\s+/).slice(0, 4).join(" ");
}
