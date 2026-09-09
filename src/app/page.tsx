"use client";

import { useEffect, useState } from "react";
import { usePreferences } from "@/lib/usePreferences";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { PersonalizeDrawer } from "@/components/PersonalizeDrawer";
import { NewsCard, type FeedArticle } from "@/components/NewsCard";
import { FeedStats } from "@/components/FeedStats";

export default function Home() {
  const { prefs, loaded, toggleCategory, toggleCountry, toggleLanguage } = usePreferences();
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    setStatus("loading");
    const params = new URLSearchParams();
    prefs.categories.forEach((c) => params.append("category", c));
    prefs.countries.forEach((c) => params.append("country", c));
    prefs.languages.forEach((l) => params.append("language", l));

    fetch(`/api/feed?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles ?? []);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [prefs, loaded]);

  const [hero, ...rest] = articles;

  return (
    <div className="shell">
      <CategoryNav activeCategories={prefs.categories} onToggleCategory={toggleCategory} />

      <div>
        <Header onOpenPersonalize={() => setDrawerOpen(true)} />
        <PersonalizeDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          selectedCategories={prefs.categories}
          selectedCountries={prefs.countries}
          selectedLanguages={prefs.languages}
          onToggleCategory={toggleCategory}
          onToggleCountry={toggleCountry}
          onToggleLanguage={toggleLanguage}
        />

        <main className="content">
          <div className="eyebrow">Live Feed</div>

          {status === "loading" && <p style={{ color: "var(--text-faint)" }}>Loading...</p>}
          {status === "error" && <p style={{ color: "var(--crit)" }}>Could not load the feed. Try again shortly.</p>}

          {status === "idle" && articles.length === 0 && (
            <div className="footer-note">
              No stories yet. Pick a category from the sidebar or Personalize, or run <code className="mono">npm run ingest</code>.
            </div>
          )}

          {status === "idle" && articles.length > 0 && (
            <>
              <FeedStats articles={articles} />

              <div className="section">
                {hero && (
                  <div style={{ marginBottom: 16 }}>
                    <NewsCard article={hero} index={0} size="hero" />
                  </div>
                )}
                <div className="grid-cards">
                  {rest.map((a, i) => (
                    <NewsCard key={a.id} article={a} index={i + 1} />
                  ))}
                </div>
              </div>

              <div className="footer-note">
                Only public-service broadcasters and official institutional feeds are ingested — no panel debates, no
                state-only sourcing. A story needs 2+ independent sources to be marked Verified. See PLANNING.md for
                the full source list and legal notes.
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
