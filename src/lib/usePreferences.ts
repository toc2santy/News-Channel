"use client";

import { useEffect, useState } from "react";

// Anonymous, device-local preferences only — no accounts, no server-side
// personal data (see PLANNING.md section 7, decision 3: DPDP/GDPR scope
// minimization for the MVP).
const STORAGE_KEY = "news-channel:prefs:v1";

export type DateRange = 1 | 2;

interface Prefs {
  categories: string[];
  countries: string[];
  languages: string[];
  // 1 = today/last 24h (default), 2 = also include the day before.
  dateRange: DateRange;
}

const DEFAULT_PREFS: Prefs = { categories: [], countries: [], languages: [], dateRange: 1 };

export function usePreferences() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Merge over defaults so prefs saved before `languages` existed don't
      // crash the .includes() calls below with undefined.
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore corrupt local storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs, loaded]);

  function toggleCategory(id: string) {
    setPrefs((p) => ({
      ...p,
      categories: p.categories.includes(id)
        ? p.categories.filter((c) => c !== id)
        : [...p.categories, id],
    }));
  }

  function toggleCountry(name: string) {
    setPrefs((p) => ({
      ...p,
      countries: p.countries.includes(name)
        ? p.countries.filter((c) => c !== name)
        : [...p.countries, name],
    }));
  }

  function toggleLanguage(name: string) {
    setPrefs((p) => ({
      ...p,
      languages: p.languages.includes(name)
        ? p.languages.filter((l) => l !== name)
        : [...p.languages, name],
    }));
  }

  function setDateRange(range: DateRange) {
    setPrefs((p) => ({ ...p, dateRange: range }));
  }

  return { prefs, loaded, toggleCategory, toggleCountry, toggleLanguage, setDateRange };
}
