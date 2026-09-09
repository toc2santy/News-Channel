import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categories = searchParams.getAll("category");
  const countries = searchParams.getAll("country");
  const languages = searchParams.getAll("language");

  const articles = await prisma.article.findMany({
    where: {
      ...(categories.length ? { category: { in: categories } } : {}),
      ...(countries.length ? { country: { in: countries } } : {}),
      ...(languages.length ? { language: { in: languages } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 100,
  });

  // Cross-verification (PLANNING.md section 3): a story is "Verified" once
  // 2+ distinct sources are independently reporting it, "Developing /
  // single-source" otherwise. Different outlets almost never phrase a
  // headline identically, so this can't be exact clusterKey equality — it
  // compares each pair of same-category articles from different sources by
  // how much their significant-word sets (clusterKey, a sorted bag of words
  // — see categorize.ts) overlap. A short, generic overlap (one shared word)
  // shouldn't count, so both a minimum shared-word count and a minimum
  // overlap-coefficient (shared / smaller article's word count) must pass.
  // Capped to stories within 3 days of each other so two accidentally
  // similar-sounding headlines from unrelated dates don't cross-verify.
  const MIN_SHARED_WORDS = 2;
  const MIN_OVERLAP_COEFFICIENT = 0.3;
  const MAX_DAYS_APART = 3;

  const wordSets = articles.map((a) => new Set(a.clusterKey.split(" ").filter(Boolean)));

  function overlaps(i: number, j: number): boolean {
    const a = articles[i];
    const b = articles[j];
    if (a.sourceName === b.sourceName || a.category !== b.category) return false;
    const daysApart = Math.abs(a.publishedAt.getTime() - b.publishedAt.getTime()) / 86400000;
    if (daysApart > MAX_DAYS_APART) return false;

    const setA = wordSets[i];
    const setB = wordSets[j];
    let shared = 0;
    for (const w of setA) if (setB.has(w)) shared++;
    if (shared < MIN_SHARED_WORDS) return false;
    return shared / Math.min(setA.size, setB.size) >= MIN_OVERLAP_COEFFICIENT;
  }

  // Which other sources corroborate each article — not just whether it's
  // verified, so the UI can show the reader exactly who agrees on the story.
  const corroboratingSources: Set<string>[] = articles.map(() => new Set());
  for (let i = 0; i < articles.length; i++) {
    for (let j = i + 1; j < articles.length; j++) {
      if (overlaps(i, j)) {
        corroboratingSources[i].add(articles[j].sourceName);
        corroboratingSources[j].add(articles[i].sourceName);
      }
    }
  }

  const result = articles.map((a, i) => ({
    id: a.id,
    title: a.title,
    link: a.link,
    sourceName: a.sourceName,
    category: a.category,
    country: a.country,
    language: a.language,
    publishedAt: a.publishedAt,
    keyPoints: JSON.parse(a.keyPoints) as string[],
    imageUrl: a.imageUrl,
    isStateMedia: a.isStateMedia,
    verified: corroboratingSources[i].size > 0,
    verifiedSources: [...corroboratingSources[i]],
  }));

  return NextResponse.json({ articles: result });
}
