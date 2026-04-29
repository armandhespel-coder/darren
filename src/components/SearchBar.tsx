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
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

export default function SearchBar({ filters, onChange, onSearch, categories = [], subcategories, selectedSubcategory, onSubcategoryChange }: Props) {
  const update = (key: keyof Filters, value: string | number) => onChange({ ...filters, [key]: value });
  const reset = () => { onChange({ search: "", categorie: "Tous", budgetMax: MAX_BUDGET }); onSubcategoryChange?.(""); };
  const cats = ["Tous", ...categories];
  const showSub = subcategories && subcategories.length > 0;

  const labelStyle = { color: "var(--blue2)", fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 };
  const inputStyle = { background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)", appearance: "none" as const, outline: "none" };

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(74,108,247,0.18)" }}>
      {/* Layout mobile : grille 2 colonnes / desktop : flex */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap items-end gap-2 md:gap-3 p-3 md:p-6">

        {/* Recherche — pleine largeur mobile */}
        <div
          className="col-span-2 md:flex-[2] flex items-center gap-2 rounded-xl px-3"
          style={{ ...inputStyle, border: "1.5px solid var(--border)", transition: "border-color 0.2s" }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--blue2)")}
          onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <span style={{ color: "var(--muted)", flexShrink: 0 }}><IconSearch /></span>
          <input
            type="text"
            placeholder="Rechercher..."
            value={filters.search}
            onChange={e => update("search", e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSearch()}
            className="flex-1 py-2.5 md:py-3 bg-transparent font-semibold min-w-0"
            style={{ outline: "none", border: "none", color: "var(--text)", boxShadow: "none", fontSize: 13 }}
          />
        </div>

        {/* Catégorie */}
        <div className="col-span-1 md:flex-1 min-w-0 md:min-w-[140px]">
          <div style={labelStyle}>Catégorie</div>
          <select
            value={filters.categorie}
            onChange={e => update("categorie", e.target.value)}
            className="w-full rounded-xl px-3 py-2 md:py-2.5 font-semibold cursor-pointer"
            style={{ ...inputStyle, fontSize: 12 }}
          >
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Budget */}
        <div className="col-span-1 md:flex-1 min-w-0 md:min-w-[150px]">
          <div style={{ ...labelStyle, justifyContent: "space-between" }}>
            <span>Budget</span>
            <span style={{ color: "var(--dark)", fontSize: 10, fontWeight: 700 }}>
              {filters.budgetMax >= MAX_BUDGET ? "Tous" : `≤ ${filters.budgetMax} €`}
            </span>
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
          <div className="flex justify-between mt-0.5" style={{ color: "var(--muted)", fontSize: 9, fontWeight: 600 }}>
            <span>0 €</span><span>{MAX_BUDGET}+ €</span>
          </div>
        </div>

        {/* Sous-catégorie — pleine largeur mobile */}
        {showSub && (
          <div className="col-span-2 md:flex-1 md:min-w-[130px]">
            <div style={{ ...labelStyle, color: "var(--pink)" }}>Spécialité</div>
            <select
              value={selectedSubcategory ?? ""}
              onChange={e => onSubcategoryChange?.(e.target.value)}
              className="w-full rounded-xl px-3 py-2 md:py-2.5 font-semibold cursor-pointer"
              style={{ ...inputStyle, border: "1.5px solid rgba(217,63,181,0.35)", fontSize: 12 }}
            >
              <option value="">Toutes</option>
              {subcategories!.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Reset */}
        <div className="col-span-2 md:w-auto flex justify-end md:justify-start">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 font-bold rounded-xl cursor-pointer transition-all duration-200"
            style={{ height: 38, paddingInline: 14, background: "var(--bg2)", color: "var(--muted)", fontSize: 12, border: "none" }}
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
