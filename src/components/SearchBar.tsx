"use client";

interface Filters { search: string; continent: string; categorie: string; budget: string; }
interface Props { filters: Filters; onChange: (filters: Filters) => void; }

const CONTINENTS = ["Tous", "Europe", "Asie", "Amériques", "Afrique", "Océanie"];
const CATEGORIES = ["Tous", "DJ", "Traiteur", "Photographe", "Vidéaste", "Décorateur", "Animateur"];
const BUDGETS = ["Tous", "< 500€", "500–1000€", "1000–2000€", "> 2000€"];

export default function SearchBar({ filters, onChange }: Props) {
  const update = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  const reset = () => onChange({ search: "", continent: "Tous", categorie: "Tous", budget: "Tous" });

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/40" style={{ background: "rgba(255,255,255,0.97)" }}>
      <div className="flex flex-col md:flex-row items-stretch">

        {/* Search */}
        <div className="flex items-center gap-2.5 flex-1 px-5 py-3.5 md:border-r border-gray-200/80">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Prestataire, nom..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="flex-1 outline-none text-gray-800 text-sm placeholder-gray-400 bg-transparent"
          />
        </div>

        {/* Continent */}
        <div className="flex flex-col justify-center px-5 py-3 md:border-r border-gray-200/80 min-w-[145px]">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Continent</span>
          <select value={filters.continent} onChange={(e) => update("continent", e.target.value)}
            className="outline-none text-gray-700 text-sm bg-transparent cursor-pointer font-medium">
            {CONTINENTS.map((c) => <option key={c} value={c}>{c === "Tous" ? "Tous les continents" : c}</option>)}
          </select>
        </div>

        {/* Catégorie */}
        <div className="flex flex-col justify-center px-5 py-3 md:border-r border-gray-200/80 min-w-[120px]">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Catégorie</span>
          <select value={filters.categorie} onChange={(e) => update("categorie", e.target.value)}
            className="outline-none text-gray-700 text-sm bg-transparent cursor-pointer font-medium">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Budget */}
        <div className="flex flex-col justify-center px-5 py-3 min-w-[130px]">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Budget</span>
          <select value={filters.budget} onChange={(e) => update("budget", e.target.value)}
            className="outline-none text-gray-700 text-sm bg-transparent cursor-pointer font-medium">
            {BUDGETS.map((b) => <option key={b} value={b}>{b === "Tous" ? "Tous les budgets" : b}</option>)}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 p-3 flex-shrink-0 items-center">
          <button
            className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:opacity-90 shadow-md"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            Rechercher
          </button>
          <button onClick={reset}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer">
            Effacer
          </button>
        </div>
      </div>
    </div>
  );
}
