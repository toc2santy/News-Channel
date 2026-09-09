# Project: Unbiased Categorized News Aggregator ("News Channel")

## 1. Vision

A news aggregation platform (web + mobile-ready) that pulls stories **only from
verifiable, editorially-independent wire agencies and public broadcasters**,
strips them down to key points, tags them into categories the user actually
cares about, and lets the user subscribe to only those categories. No single
government's or channel's spin — every story is cross-referenced across
multiple independent sources before it's shown, and any state-affiliated
outlet used for supplementary coverage is clearly labeled as such.

Core promise to the user: **"You choose the categories. We choose only
legitimate wire/agency sources. No opinion shows, no studio panels, no
propaganda."**

## 2. Categories (initial taxonomy — editable)

- Sports (India + international, per-sport filter)
- Games / Esports
- Electronics & Gadgets
- Science & New Inventions
- AI / Technology
- Indian Government Projects & Policy (sourced from PIB, ministries)
- International News — **by country** (user picks countries to follow)
- General Awareness (public health, environment, education, economy basics)
- Business & Markets
- Defense & Geopolitics (factual/wire-only, explicitly excluded from opinion content)
- Fiction/Entertainment — books, films, literary awards (kept separate from "fake news"; this is entertainment content, clearly labeled)

Each category is independently subscribable. Each story card shows: **3–5 key
points**, source agency name + logo/attribution, original publish time,
country tag, and a link to the original source (we do not claim the full
article as ours).

## 3. Where the data comes from (no propaganda sources)

### Tier 1 — Independent wire agencies (primary, cross-verification backbone)
| Agency | Region | Access |
|---|---|---|
| Reuters | Global | Reuters Connect (paid license) or Reuters RSS (limited, non-commercial) |
| Associated Press (AP) | Global | AP News API (paid) |
| Agence France-Presse (AFP) | Global | AFP Forum (paid license) |
| Press Trust of India (PTI) | India | PTI subscription (paid, India's largest wire service) |
| ANI (Asian News International) | India | ANI subscription (paid) |
| IANS (Indo-Asian News Service) | India | IANS feed (paid/limited free RSS) |
| Bloomberg | Global/Business | Bloomberg API (paid) |
| dpa (Deutsche Presse-Agentur) | Europe | dpa API (paid) |

### Tier 2 — Public-service broadcasters (editorially independent, non-state-propaganda by design)
- BBC News (RSS feeds are free for non-commercial use, attribution required)
- NHK World Japan
- DW (Deutsche Welle) English
- Kyodo News (Japan)
- Al Jazeera English (independent editorial desk; still label origin — Qatar-funded)
- ABC Australia / CBC Canada (public broadcasters)

### Tier 3 — Official government/institutional sources (for the "Govt Projects" & science categories — these are primary sources, not propaganda, since they're the origin of the policy/announcement itself)
- PIB (Press Information Bureau, Govt of India) — press releases, GODL-licensed
- data.gov.in, individual ministry sites (MeitY, ISRO, DRDO public releases)
- ISRO, NASA, ESA — space/science
- WHO, UN News, World Bank, IMF — global institutional
- Nature, Science, IEEE Spectrum — for "new invention"/AI coverage (many offer press-release RSS)

### Tier 4 — Aggregation APIs (engineering convenience layer, NOT a source of truth by themselves — used to pull from Tier 1–3 feeds programmatically)
- **Guardian Open Platform API** — free tier, open content, good non-commercial license
- **NewsAPI.org** — free for dev only, paid for production
- **GNews / Mediastack / Currents API / Bing News Search API / World News API** — paid tiers for production use, aggregate many publishers including wires
- **RSS feeds directly from Tier 1–3 sources** — cheapest, most legally clean approach; most public broadcasters and PIB publish open RSS

### Explicitly excluded or flagged
- State-controlled broadcasters used as sole source for a story: **RT, Xinhua, TASS, CGTN, PressTV** etc. — not banned from cross-reference display, but never used as the *only* source, and always rendered with a visible "State-affiliated media" badge (same standard BBC/Reuters/AllSides use).
- Any Indian channel with an opinion/panel format (news debate shows) — excluded entirely; we only ingest wire-desk factual copy, not TV commentary transcripts.
- No content sourced from unverified social media, forwarded messages, or blogs.

### Bias-control mechanism (technical)
1. A story must have corroboration from **≥2 independent Tier-1/2 sources** before being marked "Verified" and surfaced in the main feed. Single-source stories go into a clearly labeled "Developing / Single-source" bucket.
2. Every story card shows the source agency name — never "News Channel" claiming authorship.
3. An internal "source diversity" score flags if a country's international coverage is coming from only one geopolitical bloc's outlets, and the system pulls a counter-source before publishing.

## 4. Legal aspects (must resolve before launch)

1. **Copyright** — You cannot republish full article text without a license.
   Legally safe pattern: **headline + short factual summary (your own
   original key-point extraction) + attribution + link back to source**.
   This is the same model Google News / Flipboard use. Full-text reproduction
   requires paid licensing deals with each agency (Reuters Connect, AP,
   PTI, etc.).
2. **Database/API Terms of Service** — Each API (NewsAPI, GNews, Guardian,
   Bing) has separate commercial-use clauses; some forbid caching beyond
   X hours or forbid ML-training use of content. Must review each ToS before
   integrating; free tiers are typically "personal/dev use only," not
   production.
3. **"Hot news" misappropriation doctrine (US)** — facts themselves aren't
   copyrightable, but pure republishing of a wire's exclusive scoop within
   minutes can trigger this doctrine in some US courts. Low risk if you
   summarize + attribute + delay slightly for non-licensed feeds.
4. **India: Digital News Publication rules** — Under the IT Rules 2021
   (Intermediary Guidelines & Digital Media Ethics Code), a "digital news
   aggregator" publishing news content may need to file an intimation with
   the Ministry of Information & Broadcasting (MIB) once it crosses certain
   scale/visibility, and must appoint a Grievance Officer. Needs a lawyer's
   confirmation of applicability once user base grows.
5. **Section 79 IT Act safe harbor** — protects intermediaries from liability
   for third-party content if you (a) don't edit content substantively
   beyond factual summarization, (b) act on takedown/grievance requests,
   (c) display clear source attribution. Full editorializing removes this
   protection.
6. **Defamation liability** — even as an aggregator, republishing a
   defamatory claim can carry liability in India/UK. Mitigation: only pull
   from Tier 1–3 vetted sources, never user-submitted content, keep an
   editorial takedown process.
7. **Trademark** — you can name-attribute "Reuters," "PTI," "BBC" etc. in
   text, but cannot use their logos/branding without a formal agreement.
8. **Government Open Data License (India, GODL)** — PIB/ministry content is
   generally reusable under GODL with attribution; still confirm per-source.
9. **Data privacy (DPDP Act 2023 in India / GDPR if EU users)** — applies the
   moment you collect user accounts, emails, or category preferences tied to
   an identity. Plan consent banners, a privacy policy, and data-minimization
   from day one.
10. **App store policy (Google Play / Apple)** — "News" category apps face
    extra scrutiny (ownership/publisher verification, no plagiarized content,
    no clickbait). Budget time for Play Console's News content declaration
    form.

### Recommended legal posture for MVP
Start **non-commercial / free tier**, RSS + Guardian Open Platform + PIB +
public-broadcaster RSS only (all clearly licensable at zero/low cost),
headline+summary+attribution+outbound-link model. Defer paid wire licensing
(Reuters/AP/PTI) to a funded V2 once traffic/business model justifies the
cost (these licenses typically run from a few hundred to several thousand
USD/month depending on volume).

## 5. Technical architecture (proposed)

```
[Source Adapters]                [Processing Pipeline]              [Serving]
RSS pollers  ─┐                  Dedup (title+embedding sim) ─┐
API pullers  ─┼─► Raw Store ────►│ Categorizer (rules+ML)     ├──► Postgres (articles,
Wire feeds   ─┘   (S3/Blob)      │ Key-point summarizer (LLM) │     categories, sources)
                                  │ Country/geo tagger         │
                                  │ Source-diversity check     │        │
                                  └────────────────────────────┘        ▼
                                                                  REST/GraphQL API
                                                                        │
                                                          ┌─────────────┼──────────────┐
                                                          ▼             ▼              ▼
                                                     Web app       Mobile app     Push/notify
                                                     (category    (React Native   (per-category
                                                      subscriptions)  or Flutter)   alerts)
```

- **Ingestion**: scheduled workers (cron/queue) polling RSS + paid APIs per
  source, rate-limited to each provider's ToS.
- **Dedup & clustering**: group same story across sources (title embedding
  similarity) so the "≥2 independent sources" verification rule can run.
- **Categorization**: start rule/keyword-based per category, layer in an
  LLM classifier for accuracy once volume grows.
- **Summarization**: LLM-generated 3–5 bullet key points from the original
  snippet/description fields (not full article scraping, to stay
  copyright-safe) — or from licensed full text once a license exists.
- **Storage**: Postgres for structured data, object storage for raw payloads,
  a search index (e.g., Meilisearch/Elasticsearch) for query/filmonth.
- **Frontend**: web app first (Next.js) with category-subscription UI;
  React Native/Flutter mobile app in phase 2.
- **Auth**: only if you need saved preferences across devices — otherwise
  keep anonymous/local-storage prefs for MVP to minimize DPDP/GDPR scope.

## 6. Phased roadmap

**Phase 0 — Legal/source setup (1–2 weeks)**
- Finalize source list, confirm RSS/API ToS for each, draft attribution
  format, draft privacy policy, decide non-commercial vs. registered entity.

**Phase 1 — MVP (4–6 weeks)**
- Ingest from Guardian API + 5–8 public-broadcaster RSS + PIB RSS.
- Fixed category set, no auth, web-only, key-point summaries, source
  attribution, "Verified (2+ sources)" badge.

**Phase 2 — Personalization**
- User accounts, per-category + per-country subscriptions, push
  notifications, mobile app.

**Phase 3 — Scale & licensing**
- Add Reuters/AP/PTI/ANI paid feeds once traffic justifies cost, add
  MIB intimation filing if required at that scale, add moderation/grievance
  officer workflow.

## 7. Decisions (confirmed)

1. **Web app first.** Mobile (React Native) deferred to Phase 2.
2. **Free / non-commercial MVP.** Only zero/low-cost, clearly-licensable
   sources used at launch: Guardian Open Platform, public-broadcaster RSS
   (BBC, DW, NHK World, Kyodo, Al Jazeera, ABC Australia, CBC), PIB and other
   official/institutional RSS (ISRO, NASA, ESA, WHO, UN News). Paid wire
   licenses (Reuters/AP/PTI/ANI) deferred to Phase 3 once there's a funded
   business model.
3. **Anonymous preferences.** Category/country subscriptions stored in
   browser local storage — no accounts, no login, no personal data collected
   in the MVP. Minimizes DPDP/GDPR scope entirely for Phase 1.
4. **Top 25 countries for "International news by country"** (curated by
   global relevance / news volume; expandable later):

   India, United States, United Kingdom, China, Russia, Pakistan, Japan,
   South Korea, North Korea, Germany, France, Israel, Palestine, Iran, Saudi
   Arabia, UAE, Ukraine, Turkey, Brazil, South Africa, Australia, Canada,
   Bangladesh, Sri Lanka, Nepal, Indonesia — 26 countries, India included
   directly in the filterable list rather than treated as a separate
   domestic desk. Easy to trim/swap later — it's just a filter list, not an
   architectural constraint.
