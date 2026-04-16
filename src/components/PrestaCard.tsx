"use client";

import { Prestataire } from "@/types";

interface Props { presta: Prestataire; onContact: (presta: Prestataire) => void; }

const CATEGORY_GRADIENTS: Record<string, string> = {
  DJ: "from-violet-900/60 to-indigo-900/60",
  Photographe: "from-blue-900/60 to-cyan-900/60",
  Traiteur: "from-emerald-900/60 to-teal-900/60",
  Décorateur: "from-pink-900/60 to-rose-900/60",
  Vidéaste: "from-orange-900/60 to-amber-900/60",
  Animateur: "from-fuchsia-900/60 to-purple-900/60",
};

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  DJ: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />,
  Photographe: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />,
  Traiteur: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
  Décorateur: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
  Vidéaste: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
  Animateur: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />,
};

export default function PrestaCard({ presta, onContact }: Props) {
  const grad = CATEGORY_GRADIENTS[presta.categorie] ?? "from-purple-900/60 to-blue-900/60";
  const icon = CATEGORY_ICONS[presta.categorie];

  return (
    <div className="glass-card rounded-2xl overflow-hidden cursor-pointer group">
      {/* Image / placeholder */}
      <div className={`relative h-44 bg-gradient-to-br ${grad}`}>
        {presta.images[0] ? (
          <img src={presta.images[0]} alt={presta.nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {icon ?? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l14 9-14 9V3z" />}
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Premium badge */}
        {presta.is_premium && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
            style={{ background: "linear-gradient(135deg, #ca8a04, #eab308)", color: "#000" }}>
            Premium
          </span>
        )}

        {/* Availability */}
        <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full ${presta.is_available ? "bg-emerald-500/80 text-white" : "bg-white/20 text-white/60"}`}>
          {presta.is_available ? "Disponible" : "Indisponible"}
        </span>

        {/* Category + continent bottom */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="text-[10px] text-white/70 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">{presta.categorie}</span>
          <span className="text-[10px] text-white/60 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">{presta.continent}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white text-lg leading-tight" style={{ fontFamily: "var(--font-cormorant)" }}>
            {presta.nom}
          </h3>
          {presta.note > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white/70 text-xs font-medium">{presta.note}</span>
            </div>
          )}
        </div>

        {presta.description && (
          <p className="text-white/40 text-xs mb-3 line-clamp-2 leading-relaxed">{presta.description}</p>
        )}

        {/* Tags */}
        {presta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {presta.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-white/[0.07] text-white/50 px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-cormorant)" }}>{presta.prix}€</span>
            <span className="text-white/30 text-xs ml-1">/soirée</span>
          </div>

          {presta.is_premium && presta.telephone ? (
            <a
              href={`tel:${presta.telephone}`}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Appeler
            </a>
          ) : (
            <button
              onClick={() => onContact(presta)}
              className="text-sm font-medium px-4 py-2 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
            >
              Réserver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
