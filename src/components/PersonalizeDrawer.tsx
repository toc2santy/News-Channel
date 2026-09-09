"use client";

import { CATEGORIES, TOP_COUNTRIES, COUNTRY_LANGUAGES } from "@/lib/sources";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedCategories: string[];
  selectedCountries: string[];
  selectedLanguages: string[];
  onToggleCategory: (id: string) => void;
  onToggleCountry: (name: string) => void;
  onToggleLanguage: (name: string) => void;
}

export function PersonalizeDrawer({
  open,
  onClose,
  selectedCategories,
  selectedCountries,
  selectedLanguages,
  onToggleCategory,
  onToggleCountry,
  onToggleLanguage,
}: Props) {
  if (!open) return null;

  // Union of languages for whichever countries are currently selected — not
  // the full 26-country list, so this only ever shows languages relevant to
  // what the user picked (see PLANNING.md: "option of all the selected
  // country languages").
  const availableLanguages = [
    ...new Set(selectedCountries.flatMap((c) => COUNTRY_LANGUAGES[c] ?? [])),
  ];

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.65)" }} onClick={onClose} />
      <aside className="relative w-full max-w-sm h-full overflow-y-auto p-5" style={{ background: "var(--panel)", borderLeft: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>Personalize feed</h2>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: "var(--text-faint)" }}>
            &times;
          </button>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--text-faint)" }}>
          Saved only on this device — no account, no tracking.
        </p>

        <div className="sidebar-title" style={{ padding: "0 0 10px" }}>
          Categories (mobile)
        </div>
        <div className="pill-row mb-6">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => onToggleCategory(c.id)} className={`pill ${selectedCategories.includes(c.id) ? "active" : ""}`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="sidebar-title" style={{ padding: "0 0 10px" }}>
          Countries — International News
        </div>
        <div className="pill-row mb-6">
          {TOP_COUNTRIES.map((name) => (
            <button key={name} onClick={() => onToggleCountry(name)} className={`pill ${selectedCountries.includes(name) ? "active" : ""}`}>
              {name}
            </button>
          ))}
        </div>

        <div className="sidebar-title" style={{ padding: "0 0 10px" }}>
          Languages
        </div>
        {availableLanguages.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            Select a country above to see its language(s) here.
          </p>
        ) : (
          <>
            <p className="text-sm mb-2" style={{ color: "var(--text-faint)" }}>
              A language with no matching source yet just returns an empty feed — same as any other filter with no
              results.
            </p>
            <select
              className="select mb-2"
              value=""
              onChange={(e) => {
                if (e.target.value) onToggleLanguage(e.target.value);
              }}
            >
              <option value="">
                {selectedLanguages.length ? "Add another language…" : "Select a language…"}
              </option>
              {availableLanguages
                .filter((name) => !selectedLanguages.includes(name))
                .map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>
            {selectedLanguages.length > 0 && (
              <div className="pill-row">
                {selectedLanguages.map((name) => (
                  <button key={name} onClick={() => onToggleLanguage(name)} className="pill active">
                    {name} &times;
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
