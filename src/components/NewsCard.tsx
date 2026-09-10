"use client";

import { useState } from "react";

export interface FeedArticle {
  id: string;
  title: string;
  link: string;
  sourceName: string;
  category: string;
  country?: string | null;
  language: string;
  publishedAt: string;
  keyPoints: string[];
  imageUrl?: string | null;
  isStateMedia: boolean;
  verified: boolean;
  verifiedSources: string[];
}

// Deterministic gradient per source so cards without a publisher image still
// look intentional rather than broken.
function placeholderGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const h1 = hash % 360;
  const h2 = (h1 + 55) % 360;
  return `linear-gradient(135deg, hsl(${h1} 40% 16%), hsl(${h2} 40% 10%))`;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NewsCard({ article, index, size = "normal" }: { article: FeedArticle; index: number; size?: "hero" | "normal" }) {
  const imageHeight = size === "hero" ? "h-64 sm:h-80" : "h-36";
  // Publisher-hosted thumbnails can 404, get CORS/CORP-blocked, or otherwise
  // fail to load even when imageUrl itself is present — imgFailed catches
  // that case so we still fall back to the gradient instead of a broken
  // image icon (the !article.imageUrl check alone only covers the case
  // where there was never a URL to begin with).
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(article.imageUrl) && !imgFailed;

  return (
    <a href={article.link} target="_blank" rel="noopener noreferrer" className="card">
      <div
        className={`relative ${imageHeight} shrink-0`}
        style={!showImage ? { background: placeholderGradient(article.sourceName) } : undefined}
      >
        {showImage && (
          // eslint-disable-next-line @next/next/no-img-element -- publisher-hosted thumbnails from many domains, not worth an images.domains allowlist for an MVP
          <img
            src={article.imageUrl!}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,14,11,.85), transparent 55%)" }} />

        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="card-num px-1.5 py-0.5 rounded" style={{ background: "rgba(10,14,11,.7)" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="mono text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(10,14,11,.7)", color: "var(--text-dim)" }}>
            {article.sourceName}
          </span>
        </div>

        <div className="absolute top-2 right-2 flex gap-1">
          {article.isStateMedia && <span className="stamp state" style={{ background: "rgba(10,14,11,.7)" }}>State-aff.</span>}
          <span
            className={`stamp ${article.verified ? "verified" : "developing"}`}
            style={{ background: "rgba(10,14,11,.7)" }}
            title={article.verified ? `Also reported by: ${article.verifiedSources.join(", ")}` : undefined}
          >
            {article.verified ? "Verified" : "Developing"}
          </span>
        </div>

        {size === "hero" && (
          <h2 className="absolute bottom-3 left-3 right-3 text-white font-bold text-xl leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            {article.title}
          </h2>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3 gap-2">
        {size !== "hero" && <h3>{article.title}</h3>}

        <ul className="text-sm space-y-1" style={{ color: "var(--text-dim)" }}>
          {article.keyPoints.slice(0, size === "hero" ? 3 : 2).map((point, i) => (
            <li key={i} className="line-clamp-2">
              · {point}
            </li>
          ))}
        </ul>

        {article.verified && (
          <div className="mono text-xs" style={{ color: "var(--low)" }}>
            ✓ Confirmed by {article.sourceName} + {article.verifiedSources.join(", ")}
          </div>
        )}

        <div className="mono mt-auto flex items-center gap-2 text-xs pt-1" style={{ color: "var(--text-faint)" }}>
          {article.country && <span>{article.country}</span>}
          {article.country && <span>/</span>}
          {article.language !== "English" && <span>{article.language}</span>}
          {article.language !== "English" && <span>/</span>}
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
      </div>
    </a>
  );
}
