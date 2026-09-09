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

  // Cross-verification: a clusterKey backed by >=2 distinct source names is
  // "Verified"; everything else is "Developing / single-source" (see
  // PLANNING.md section 3, bias-control mechanism).
  const sourceCountByCluster = new Map<string, Set<string>>();
  for (const a of articles) {
    const set = sourceCountByCluster.get(a.clusterKey) ?? new Set<string>();
    set.add(a.sourceName);
    sourceCountByCluster.set(a.clusterKey, set);
  }

  const result = articles.map((a) => ({
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
    verified: (sourceCountByCluster.get(a.clusterKey)?.size ?? 1) >= 2,
  }));

  return NextResponse.json({ articles: result });
}
