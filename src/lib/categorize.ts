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
  "science-invention": ["discovery", "invention", "research", "study finds", "breakthrough", "space", "telescope"],
  "ai-tech": ["artificial intelligence", "ai", "machine learning", "chatbot", "algorithm", "large language model"],
  "india-govt": ["ministry", "cabinet", "pib", "government of india", "lok sabha", "rajya sabha", "scheme"],
  international: [],
  "general-awareness": ["health", "climate", "education", "who", "united nations", "public awareness"],
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

// Normalize a title for cross-source dedup/clustering (strip punctuation,
// lowercase, collapse whitespace). Good enough for the MVP; swap for
// embedding-similarity clustering once volume grows.
export function clusterKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 8)
    .join(" ");
}
