"use client";

import React from "react";
import { Prestataire } from "@/types";

interface Props {
  presta: Prestataire;
  onClose: () => void;
  onContact: (presta: Prestataire) => void;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  DJ: "from-violet-900/60 to-indigo-900/60",
  Photographe: "from-blue-900/60 to-cyan-900/60",
  Traiteur: "from-emerald-900/60 to-teal-900/60",
  Décorateur: "from-pink-900/60 to-rose-900/60",
  Vidéaste: "from-orange-900/60 to-amber-900/60",
  Animateur: "from-fuchsia-900/60 to-purple-900/60",
};

export default function PrestaModal({ presta, onClose, onContact }: Props) {
  const grad = CATEGORY_GRADIENTS[presta.categorie] ?? "from-purple-900/60 to-blue-900/60";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl max-w-lg w-full relative overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image header */}
        <div className={`relative h-52 bg-gradient-to-br ${grad} flex-shrink-0`}>
          {presta.images[0] ? (
            <img src={presta.images[0]} alt={presta.nom} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {presta.is_premium && (
            <span className="absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{ background: "linear-gradient(135deg, #ca8a04, #eab308)", color: "#000" }}>
              Premium
            </span>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-cormorant)" }}>
              {presta.nom}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] text-white/70 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">{presta.categorie}</span>
              <span className="text-[10px] text-white/60 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">{presta.continent}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${presta.is_available ? "bg-emerald-500/80 text-white" : "bg-white/20 text-white/60"}`}>
                {presta.is_available ? "Disponible" : "Indisponible"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Rating + Price */}
          <div className="flex items-center justify-between mb-5">
            {presta.note > 0 ? (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-semibold">{presta.note}</span>
                <span className="text-white/40 text-sm">/ 5</span>
              </div>
            ) : <div />}
            <div>
              <span className="text-white font-bold text-2xl" style={{ fontFamily: "var(--font-cormorant)" }}>{presta.prix}€</span>
              <span className="text-white/30 text-sm ml-1">/soirée</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/55 text-sm leading-relaxed mb-5">
            {presta.description || "Aucune description disponible."}
          </p>

          {/* Tags */}
          {presta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {presta.tags.map((tag) => (
                <span key={tag} className="text-xs bg-white/[0.07] text-white/50 px-3 py-1 rounded-full border border-white/[0.08]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          {presta.is_premium && presta.telephone ? (
            <a
              href={`tel:${presta.telephone}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Appeler — {presta.telephone}
            </a>
          ) : (
            <button
              onClick={() => { onContact(presta); onClose(); }}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              Envoyer une demande
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
