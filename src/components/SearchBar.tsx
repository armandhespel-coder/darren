"use client";

interface Filters { search: string; continent: string; categorie: string; budget: string; }
interface Props { filters: Filters; onChange: (filters: Filters) => void; onSearch: () => void; }

const CONTINENTS = ["Tous", "Europe", "Afrique", "Asie", "Pays de l'Est", "Amériques", "Océanie"];
const CATEGORIES = ["Tous", "DJ", "Décoratrice", "Matériel", "Voiture", "Traiteur", "Photo & Caméra", "Feux d'artifice", "Location de salle", "Gâteau"];
const BUDGETS = ["Tous", "< 500€", "500–1500€", "> 1500€"];

export default function SearchBar({ filters, onChange, onSearch }: Props) {
  const update = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  const reset = () => {
    onChange({ search: "", continent: "Tous", categorie: "Tous", budget: "Tous" });
  };

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
          <span style={{ color: "var(--muted)", fontSize: "1.1rem" }}>🔍</span>
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

        {/* Continent */}
        <div className="flex-1 min-w-[150px]">
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
            🌍 Continent
          </div>
          <select
            value={filters.continent}
            onChange={(e) => update("continent", e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none cursor-pointer"
            style={{
              background: "var(--bg)",
              border: "1.5px solid var(--border)",
              color: "var(--text)",
              appearance: "none",
            }}
          >
            {CONTINENTS.map((c) => (
              <option key={c} value={c}>{c === "Tous" ? "Tous les continents" : c}</option>
            ))}
          </select>
        </div>

        {/* Catégorie */}
        <div className="flex-1 min-w-[150px]">
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
            🏷️ Catégorie
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
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
            💰 Budget
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
            className="text-white text-sm font-extrabold px-7 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
            style={{
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
            className="text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
            style={{ background: "var(--bg2)", color: "var(--muted)" }}
          >
            ✕ Effacer
          </button>
        </div>
      </div>
    </div>
  );
}
