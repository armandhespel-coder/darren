"use client";

interface Filters { search: string; categorie: string; budgetMax: number; }
interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onSearch: () => void;
  categories?: string[];
  subcategories?: string[];
  selectedSubcategory?: string;
  onSubcategoryChange?: (v: string) => void;
}

export const MAX_BUDGET = 5000;

function IconSearch() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}

function IconTag() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}

function IconEuro() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.6 7.4A7 7 0 1 0 17.6 16.6M3 10h11M3 14h11"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

export default function SearchBar({ filters, onChange, onSearch, categories = [], subcategories, selectedSubcategory, onSubcategoryChange }: Props) {
  const update = (key: keyof Filters, value: string | number) => onChange({ ...filters, [key]: value });
  const reset = () => { onChange({ search: "", categorie: "Tous", budgetMax: MAX_BUDGET }); onSubcategoryChange?.(""); };
  const cats = ["Tous", ...categories];
  const showSub = subcategories && subcategories.length > 0;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 20px 60px rgba(74,108,247,0.18)" }}
    >
      <div className="flex flex-wrap items-end gap-3 p-4 md:p-6">

        {/* Search input */}
        <div
          className="flex items-center gap-2 flex-[2] min-w-0 sm:min-w-[160px] w-full rounded-xl px-3.5"
          style={{
            background: "var(--bg)",
            border: "1.5px solid var(--border)",
            transition: "border-color 0.2s",
            outline: "none",
          }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--blue2)")}
          onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <span style={{ color: "var(--muted)", flexShrink: 0 }}><IconSearch /></span>
          <input
            type="text"
            placeholder="Rechercher un prestataire, style..."
            value={filters.search}
            onChange={e => update("search", e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSearch()}
            className="flex-1 py-3 bg-transparent text-sm font-semibold"
            style={{ outline: "none", border: "none", color: "var(--text)", boxShadow: "none" }}
          />
        </div>

        {/* Catégorie */}
        <div className="flex-1 min-w-0 sm:min-w-[150px]">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
            <IconTag /> Prestataire
          </div>
          <select
            value={filters.categorie}
            onChange={e => update("categorie", e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold cursor-pointer"
            style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)", appearance: "none", outline: "none" }}
          >
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Sous-catégorie — apparaît si la catégorie a des sous-catégories */}
        {showSub && (
          <div className="flex-1 min-w-[150px]">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--pink)" }}>
              <IconTag /> Sous-catégorie
            </div>
            <select
              value={selectedSubcategory ?? ""}
              onChange={e => onSubcategoryChange?.(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold cursor-pointer"
              style={{ background: "var(--bg)", border: "1.5px solid rgba(217,63,181,0.4)", color: "var(--text)", appearance: "none", outline: "none" }}
            >
              <option value="">Toutes</option>
              {subcategories!.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Budget slider */}
        <div className="flex-1 min-w-0 sm:min-w-[160px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "var(--blue2)" }}>
              <IconEuro /> Budget
            </div>
            <input
              type="number"
              min={0}
              max={MAX_BUDGET}
              value={filters.budgetMax >= MAX_BUDGET ? "" : filters.budgetMax}
              onChange={e => {
                const v = e.target.value === "" ? MAX_BUDGET : Math.min(MAX_BUDGET, Math.max(0, Number(e.target.value)));
                update("budgetMax", v);
              }}
              placeholder="Max €"
              className="text-[11px] font-extrabold text-right"
              style={{ width: 72, background: "transparent", border: "none", outline: "none", color: "var(--dark)" }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={MAX_BUDGET}
            step={50}
            value={filters.budgetMax}
            onChange={e => update("budgetMax", Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--blue2)", cursor: "pointer" }}
          />
          <div className="flex justify-between text-[9px] font-semibold mt-0.5" style={{ color: "var(--muted)" }}>
            <span>0 €</span>
            <span>{MAX_BUDGET}+ €</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm font-bold px-4 rounded-xl cursor-pointer transition-all duration-200"
            style={{ height: 44, background: "var(--bg2)", color: "var(--muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
          >
            <IconX /> Effacer
          </button>
        </div>
      </div>
    </div>
  );
}
