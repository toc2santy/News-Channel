"use client";

interface Props {
  onOpenPersonalize: () => void;
}

export function Header({ onOpenPersonalize }: Props) {
  return (
    <>
      <div className="letterhead">NON-COMMERCIAL AGGREGATOR // WIRE &amp; INSTITUTIONAL SOURCES ONLY</div>
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">NC</div>
          <div className="brand-text">
            <h1>News Channel</h1>
            <p>
              <span className="op">Categorized. Verified. No propaganda.</span>
            </p>
          </div>
        </div>
        <button onClick={onOpenPersonalize} className="btn btn-ghost">
          ⚙ Personalize
        </button>
      </div>
    </>
  );
}
