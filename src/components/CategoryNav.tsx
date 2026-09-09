"use client";

import { CATEGORIES } from "@/lib/sources";

interface Props {
  activeCategories: string[];
  onToggleCategory: (id: string) => void;
}

export function CategoryNav({ activeCategories, onToggleCategory }: Props) {
  return (
    <nav className="app-sidebar">
      <div className="sidebar-title">Categories</div>
      {CATEGORIES.map((c, i) => {
        const active = activeCategories.includes(c.id);
        return (
          <button
            key={c.id}
            onClick={() => onToggleCategory(c.id)}
            className={`side-item ${active ? "active" : ""}`}
          >
            <span className="side-num">{String(i + 1).padStart(2, "0")}</span>
            {c.label}
          </button>
        );
      })}
    </nav>
  );
}
