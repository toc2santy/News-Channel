import type { FeedArticle } from "./NewsCard";
import { SOURCES } from "@/lib/sources";

export function FeedStats({ articles }: { articles: FeedArticle[] }) {
  const total = articles.length;
  const verified = articles.filter((a) => a.verified).length;
  const liveSourceNames = new Set(articles.map((a) => a.sourceName));
  const countries = new Set(articles.map((a) => a.country).filter(Boolean)).size;

  return (
    <div className="section">
      <div className="kpi-grid">
        <div className="kpi">
          <b>{total}</b>
          <span>Stories in feed</span>
        </div>
        <div className="kpi">
          <b>{verified}</b>
          <span>Verified · 2+ sources</span>
        </div>
        <div className="kpi">
          <b>{liveSourceNames.size}</b>
          <span>Independent sources live</span>
        </div>
        <div className="kpi">
          <b>{countries}</b>
          <span>Countries represented</span>
        </div>
      </div>

      <div className="pill-row" style={{ marginBottom: 14 }}>
        <span className="pill active">Verified — 2+ independent sources</span>
        <span className="pill">Developing — single source, unconfirmed</span>
        <span className="pill">State-affiliated — never the sole source</span>
      </div>

      <div className="sidebar-title" style={{ padding: "0 0 8px" }}>
        Sources — highlighted are contributing to this feed right now
      </div>
      <div className="pill-row">
        {SOURCES.map((s) => (
          <span key={s.name} className={`pill ${liveSourceNames.has(s.name) ? "active" : "pill-dim"}`}>
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
