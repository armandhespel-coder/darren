"use client";

interface Filters { search: string; categorie: string; budget: string; }
interface Props { filters: Filters; onChange: (filters: Filters) => void; onSearch: () => void; }

const CATEGORIES = ["Tous", "DJ", "Décoratrice", "Matériel", "Voiture", "Traiteur", "Photo & Caméra", "Feux d'artifice", "Location de salle", "Gâteau"];
const BUDGETS = ["Tous", "< 500€", "500–1500€", "> 1500€"];

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

function IconDollar() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
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

export default function SearchBar({ filters, onChange, onSearch }: Props) {
  const update = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  const reset = () => onChange({ search: "", categorie: "Tous", budget: "Tous" });

  return (
    <div
      className="bg-white rounded-2xl overflow-visible"
      style={{ boxShadow: "0 20px 60px rgba(74,108,247,0.18)" }}
    >
      <div className="flex flex-wrap items-end gap-3.5 p-6">

        {/* Search input */}
        <div
          className="flex items-center gap-2 flex-[2] min-w-[200px] rounded-xl px-3.5"
          style={{
            background: "var(--bg)",
            border: "1.5px solid var(--border)",
            transition: "border-color 0.2s",
          }}
          onFocusCapture={(e) => (e.currentTarget.style.borderColor = "var(--blue2)")}
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <span style={{ color: "var(--muted)" }}><IconSearch /></span>
          <input
            type="text"
            placeholder="Rechercher un prestataire, style..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="flex-1 outline-none text-sm font-semibold py-3 bg-transparent"
            style={{ color: "var(--text)" }}
          />
        </div>

        {/* Catégorie */}
        <div className="flex-1 min-w-[150px]">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
            <IconTag /> Catégorie
          </div>
          <select
            value={filters.categorie}
            onChange={(e) => update("categorie", e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none cursor-pointer"
            style={{
              background: "var(--bg)",
              border: "1.5px solid var(--border)",
              color: "var(--text)",
              appearance: "none",
            }}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Budget */}
        <div className="flex-1 min-w-[130px]">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
            <IconDollar /> Budget
          </div>
          <select
            value={filters.budget}
            onChange={(e) => update("budget", e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none cursor-pointer"
            style={{
              background: "var(--bg)",
              border: "1.5px solid var(--border)",
              color: "var(--text)",
              appearance: "none",
            }}
          >
            {BUDGETS.map((b) => <option key={b} value={b}>{b === "Tous" ? "Tous budgets" : b}</option>)}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onSearch}
            className="text-white text-sm font-extrabold px-7 rounded-xl cursor-pointer transition-all duration-200"
            style={{
              height: 44,
              background: "var(--grad)",
              boxShadow: "0 6px 20px rgba(74,108,247,0.35)",
              letterSpacing: "0.06em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 28px rgba(74,108,247,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(74,108,247,0.35)";
            }}
          >
            Rechercher
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm font-bold px-4 rounded-xl cursor-pointer transition-all duration-200"
            style={{ height: 44, background: "var(--bg2)", color: "var(--muted)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
          >
            <IconX /> Effacer
          </button>
        </div>
      </div>
    </div>
  );
}
