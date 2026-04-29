"use client";

import { useState } from "react";
import { Prestataire } from "@/types";

interface Props {
  presta: Prestataire;
  onSelect: (presta: Prestataire) => void;
  onContact: (presta: Prestataire) => void;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  validTags?: Set<string>;
}

function IconChevLeft() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function IconChevRight() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

export default function PrestaCard({ presta, onSelect, isFavorited, onToggleFavorite }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = (presta.images ?? []).filter(Boolean);
  const hasMultiple = images.length > 1;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx(i => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx(i => (i + 1) % images.length);
  };

  return (
    <div
      className="cursor-pointer group"
      onClick={() => onSelect(presta)}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "4/3" }}>
        {images[imgIdx] ? (
          <img
            src={images[imgIdx]}
            alt={presta.nom}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1E1C3A, #2A1042)" }}
          >
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" opacity={0.2} aria-hidden="true">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
        )}

        {/* Carousel arrows — visible au hover uniquement */}
        {hasMultiple && (
          <>
            <button
              aria-label="Photo précédente"
              onClick={prev}
              className="absolute flex items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{
                left: 8, top: "50%", transform: "translateY(-50%)",
                width: 28, height: 28,
                background: "rgba(255,255,255,0.9)",
                color: "#12112A",
                border: "none", zIndex: 10,
              }}
            >
              <IconChevLeft />
            </button>
            <button
              aria-label="Photo suivante"
              onClick={next}
              className="absolute flex items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{
                right: 8, top: "50%", transform: "translateY(-50%)",
                width: 28, height: 28,
                background: "rgba(255,255,255,0.9)",
                color: "#12112A",
                border: "none", zIndex: 10,
              }}
            >
              <IconChevRight />
            </button>
            {/* Dots */}
            <div className="absolute flex gap-1 items-center" style={{ bottom: 8, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Photo ${i + 1}`}
                  onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                  style={{
                    width: i === imgIdx ? 14 : 5,
                    height: 5,
                    borderRadius: 3,
                    background: i === imgIdx ? "white" : "rgba(255,255,255,0.6)",
                    border: "none", padding: 0,
                    transition: "width 0.2s",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Heart */}
        <button
          aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(presta.id); }}
          className="absolute flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
          style={{
            top: 10, right: 10,
            width: 34, height: 34,
            background: isFavorited ? "rgba(217,63,181,0.9)" : "rgba(255,255,255,0.82)",
            backdropFilter: "blur(6px)",
            border: "none", zIndex: 10,
          }}
        >
          <svg width={14} height={14} fill={isFavorited ? "white" : "none"} stroke={isFavorited ? "none" : "#555"} strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>

        {/* Badge premium */}
        {presta.is_premium && (
          <div
            className="absolute text-[10px] font-extrabold px-2 py-0.5 rounded-full"
            style={{
              top: 10, left: 10,
              background: "var(--grad)",
              color: "white",
              letterSpacing: "0.04em",
            }}
          >
            TOP
          </div>
        )}
      </div>

      {/* Info Airbnb-style */}
      <div className="pt-1.5 px-0.5">
        <div className="flex justify-between items-start gap-1">
          <span className="font-bold text-[11px] sm:text-sm leading-tight line-clamp-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            {presta.nom}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold flex-shrink-0" style={{ color: presta.note > 0 ? "var(--dark)" : "#9CA3AF" }}>
            <i className="fa-solid fa-star" style={{ fontSize: 10, color: presta.note > 0 ? "#F59E0B" : "#D1D5DB" }} aria-hidden="true" />
            {presta.note > 0 ? presta.note.toFixed(1) : "Nouveau"}
          </span>
        </div>

        <div className="text-[10px] sm:text-xs mt-0.5 line-clamp-1" style={{ color: "var(--muted)" }}>
          {presta.company && !presta.hide_company ? presta.company : presta.categorie}
        </div>

        <div className="text-[11px] sm:text-sm mt-0.5">
          <span className="font-bold" style={{ color: "var(--dark)" }}>{presta.prix}€</span>
        </div>
      </div>
    </div>
  );
}
