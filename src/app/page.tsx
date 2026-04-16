"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import PrestaCard from "@/components/PrestaCard";
import SearchBar from "@/components/SearchBar";
import { Prestataire } from "@/types";

const DEFAULT_FILTERS = { search: "", continent: "Tous", categorie: "Tous", budget: "Tous" };

const MOCK_PRESTATAIRES: Prestataire[] = [
  {
    id: "m1", owner_id: "mock", nom: "DJ Maxime Laurent", categorie: "DJ", continent: "Europe",
    prix: 950, note: 4.9, tags: ["House", "Électro", "Mariage"], images: [],
    description: "DJ haut de gamme pour mariages et soirées privées.", telephone: "+33 6 12 34 56 78",
    is_premium: true, is_available: true, created_at: "",
  },
  {
    id: "m2", owner_id: "mock", nom: "Studio Lumière", categorie: "Photographe", continent: "Europe",
    prix: 1200, note: 4.8, tags: ["Portrait", "Mariage", "Corporate"], images: [],
    description: "Studio photo professionnel avec 10 ans d'expérience.", telephone: null,
    is_premium: false, is_available: true, created_at: "",
  },
  {
    id: "m3", owner_id: "mock", nom: "Traiteur Saveurs du Monde", categorie: "Traiteur", continent: "Europe",
    prix: 75, note: 4.7, tags: ["Gastronomique", "Buffet", "Cocktail"], images: [],
    description: "Cuisine raffinée pour tous vos événements.", telephone: null,
    is_premium: false, is_available: true, created_at: "",
  },
  {
    id: "m4", owner_id: "mock", nom: "Déco Prestige Paris", categorie: "Décorateur", continent: "Europe",
    prix: 600, note: 4.6, tags: ["Floral", "Luxe", "Thématique"], images: [],
    description: "Décoration florale et événementielle haut de gamme.", telephone: "+33 7 89 01 23 45",
    is_premium: true, is_available: true, created_at: "",
  },
  {
    id: "m5", owner_id: "mock", nom: "CineEvent Productions", categorie: "Vidéaste", continent: "Amériques",
    prix: 1500, note: 5.0, tags: ["Cinéma", "Drone", "4K"], images: [],
    description: "Films d'événements cinématographiques avec drone.", telephone: null,
    is_premium: false, is_available: false, created_at: "",
  },
  {
    id: "m6", owner_id: "mock", nom: "Animateur Show Live", categorie: "Animateur", continent: "Afrique",
    prix: 400, note: 4.5, tags: ["Stand-up", "Magie", "Soirée"], images: [],
    description: "Animations spectaculaires pour entreprises et particuliers.", telephone: null,
    is_premium: false, is_available: true, created_at: "",
  },
];

const CATEGORY_PILLS = [
  { label: "Tous" }, { label: "DJ" }, { label: "Photographe" }, { label: "Traiteur" },
  { label: "Décorateur" }, { label: "Vidéaste" }, { label: "Animateur" },
];

function parseBudget(budget: string): [number, number] {
  if (budget === "< 500€") return [0, 500];
  if (budget === "500–1000€") return [500, 1000];
  if (budget === "1000–2000€") return [1000, 2000];
  if (budget === "> 2000€") return [2000, Infinity];
  return [0, Infinity];
}

export default function HomePage() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tous");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("prestataires")
      .select("*")
      .order("is_premium", { ascending: false })
      .then(({ data }) => {
        const result = (data as Prestataire[]) ?? [];
        setPrestataires(result.length > 0 ? result : MOCK_PRESTATAIRES);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const [min, max] = parseBudget(filters.budget);
    return prestataires.filter((p) => {
      if (filters.search && !p.nom.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.continent !== "Tous" && p.continent !== filters.continent) return false;
      if (filters.categorie !== "Tous" && p.categorie !== filters.categorie) return false;
      if (activeCategory !== "Tous" && p.categorie !== activeCategory) return false;
      if (p.prix < min || p.prix > max) return false;
      return true;
    });
  }, [prestataires, filters, activeCategory]);

  return (
    <main className="min-h-screen" style={{ background: "radial-gradient(ellipse at 20% 0%, #1e0a3c 0%, #090b1a 45%, #080d28 100%)" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06]" style={{ background: "rgba(8,9,26,0.82)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <span style={{ fontFamily: "var(--font-montserrat)", letterSpacing: "0.12em" }} className="text-white font-bold text-xs uppercase">
              Connect Event
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Accueil", "Nos prestataires", "Contact"].map((item, i) => (
              <a
                key={item}
                href={i === 0 ? "/" : i === 1 ? "#prestataires" : "#contact"}
                className={`text-sm transition-colors duration-200 ${i === 0 ? "text-white font-semibold" : "text-white/45 hover:text-white/80"}`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="/auth/login" className="text-white/40 hover:text-white/70 text-sm transition-colors duration-200 hidden md:block">
              Connexion
            </a>
            <a
              href="/auth/register"
              className="text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              S&apos;inscrire
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center pt-20 pb-12 px-4 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)" }} />

        <h1
          className="text-6xl md:text-8xl font-bold text-white leading-[1.05] mb-5 relative"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Réservez les meilleurs<br />
          prestataires pour votre<br />
          <span className="italic font-bold" style={{
            background: "linear-gradient(135deg, #f9a8d4 0%, #c084fc 40%, #818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            événement
          </span>
        </h1>

        <p className="text-white/45 text-sm max-w-md mx-auto mb-10 leading-relaxed" style={{ fontFamily: "var(--font-montserrat)" }}>
          DJ, décorateurs, traiteurs, photographes, feux d&apos;artifice et bien plus — les meilleurs experts du monde entier.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-3 md:gap-8 mb-10">
          {[["9", "Catégories"], ["31+", "Prestataires"], ["4", "Continents"], ["100%", "Livré"]].map(([val, label], i, arr) => (
            <div key={label} className="flex items-center gap-3 md:gap-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-cormorant)" }}>{val}</div>
                <div className="text-white/35 text-[10px] uppercase tracking-widest mt-0.5" style={{ fontFamily: "var(--font-montserrat)" }}>{label}</div>
              </div>
              {i < arr.length - 1 && <div className="w-px h-7 bg-white/15" />}
            </div>
          ))}
        </div>

        <SearchBar filters={filters} onChange={setFilters} />

        {/* Category pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-2xl mx-auto">
          {CATEGORY_PILLS.map(({ label }) => (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeCategory === label
                  ? "text-white shadow-lg shadow-purple-900/40"
                  : "text-white/55 hover:text-white/80 hover:bg-white/10"
              }`}
              style={activeCategory === label ? { background: "linear-gradient(135deg, #7c3aed, #6366f1)" } : { background: "rgba(255,255,255,0.07)" }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section id="prestataires" className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-white/30 py-24 text-sm">Aucun prestataire trouvé.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <PrestaCard
                key={p.id}
                presta={p}
                onContact={(presta) => alert(`Contacter ${presta.nom} — messagerie à venir`)}
              />
            ))}
          </div>
        )}
      </section>
      {/* Contact */}
      <section id="contact" className="border-t border-white/[0.06] py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
            Une question ? Contactez-nous
          </h2>
          <p className="text-white/40 text-sm mb-8">Notre équipe répond en moins de 24h.</p>
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Votre email"
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 outline-none focus:border-purple-500/50 transition-colors text-sm"
            />
            <textarea
              rows={4}
              placeholder="Votre message..."
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 outline-none focus:border-purple-500/50 transition-colors text-sm resize-none"
            />
            <button
              type="submit"
              className="text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:opacity-90 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              Envoyer
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
