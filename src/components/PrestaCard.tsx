"use client";

import { useState } from "react";
import { Prestataire } from "@/types";

interface Props {
  presta: Prestataire;
  onSelect: (presta: Prestataire) => void;
  onContact: (presta: Prestataire) => void;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}

function IconCalendar() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012.48 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

function IconEvent() {
  return (
    <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" opacity={0.15} aria-hidden="true">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  );
}

function IconChevLeft() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function IconChevRight() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

export default function PrestaCard({ presta, onSelect, onContact, isFavorited, onToggleFavorite }: Props) {
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
      className="bg-white rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow2)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-6px)";
        el.style.boxShadow = "0 20px 50px rgba(74,108,247,0.18)";
        el.style.borderColor = "rgba(74,108,247,0.25)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "";
        el.style.boxShadow = "var(--shadow2)";
        el.style.borderColor = "var(--border)";
      }}
      onClick={() => onSelect(presta)}
    >
      {/* Image */}
      <div className="relative" style={{ height: 210, overflow: "hidden" }}>
        {images[imgIdx] ? (
          <img
            src={images[imgIdx]}
            alt={presta.nom}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1E1C3A, #2A1042)" }}
          >
            <IconEvent />
          </div>
        )}

        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(18,17,42,0.75) 0%, transparent 55%)" }}
        />

        {/* Carousel arrows */}
        {hasMultiple && (
          <>
            <button
              aria-label="Photo précédente"
              onClick={prev}
              className="absolute flex items-center justify-center rounded-full text-white transition-opacity duration-200 opacity-0 group-hover:opacity-100"
              style={{
                left: 10, top: "50%", transform: "translateY(-50%)",
                width: 32, height: 32,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
                border: "none",
                zIndex: 10,
              }}
            >
              <IconChevLeft />
            </button>
            <button
              aria-label="Photo suivante"
              onClick={next}
              className="absolute flex items-center justify-center rounded-full text-white transition-opacity duration-200 opacity-0 group-hover:opacity-100"
              style={{
                right: 10, top: "50%", transform: "translateY(-50%)",
                width: 32, height: 32,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
                border: "none",
                zIndex: 10,
              }}
            >
              <IconChevRight />
            </button>
            {/* Dots */}
            <div
              className="absolute flex gap-1 items-center"
              style={{ bottom: 42, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Photo ${i + 1}`}
                  onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                  style={{
                    width: i === imgIdx ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === imgIdx ? "white" : "rgba(255,255,255,0.5)",
                    border: "none",
                    padding: 0,
                    transition: "width 0.2s, background 0.2s",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Favorite heart button */}
        <button
          aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(presta.id);
          }}
          className="absolute flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
          style={{
            top: 14, right: 14,
            width: 44, height: 44,
            background: isFavorited ? "rgba(217,63,181,0.9)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            boxShadow: isFavorited ? "0 4px 12px rgba(217,63,181,0.4)" : "none",
          }}
        >
          <svg
            width={16} height={16}
            fill={isFavorited ? "white" : "none"}
            stroke={isFavorited ? "none" : "#8887A8"}
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Rating */}
        {presta.note > 0 && (
          <div
            className="absolute flex items-center gap-1 text-white text-sm font-bold"
            style={{ bottom: 14, right: 14 }}
          >
            <span style={{ color: "#FFD700" }}>★</span>
            {presta.note}
            {presta.reviews != null && (
              <span className="text-white/70 text-xs">({presta.reviews})</span>
            )}
          </div>
        )}

        {/* Availability ribbon */}
        <div
          className="absolute flex items-center gap-1.5 rounded-full text-xs font-bold text-white px-3 py-1"
          style={{ bottom: 14, left: 14, background: "rgba(18,17,42,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: presta.is_available ? "#4ADE80" : "#FB923C",
              boxShadow: presta.is_available ? "0 0 6px #4ADE80" : "0 0 6px #FB923C",
            }}
          />
          {presta.is_available ? "Disponible" : "Limité"}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3 gap-3">
          <div>
            <h3
              className="text-base font-extrabold leading-tight"
              style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}
            >
              {presta.nom}
            </h3>
            {presta.company && !presta.hide_company && (
              <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--muted)" }}>
                {presta.company}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-extrabold text-base" style={{ color: "var(--blue2)" }}>
              {presta.prix}€
            </div>
            {presta.price_note && (
              <div className="text-[10px] font-semibold" style={{ color: "var(--muted)" }}>
                {presta.price_note}
              </div>
            )}
          </div>
        </div>

        {presta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {presta.tags.slice(0, 4).map((tag, i) => (
              <span
                key={tag}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={
                  i === 0
                    ? { background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }
                    : { background: "var(--bg2)", color: "var(--muted)" }
                }
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {presta.description && (
          <p
            className="text-xs leading-relaxed font-semibold mb-4 line-clamp-2"
            style={{ color: "var(--muted)" }}
          >
            {presta.description}
          </p>
        )}

        <div className="flex gap-2">
          <a
            href={`/p/${presta.id}#disponibilites`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl transition-all duration-200"
            style={{
              height: 44,
              background: "var(--bg2)",
              color: "var(--text)",
              border: "1px solid transparent",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--blue2)";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--blue2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
            }}
          >
            <IconCalendar /> Disponibilités
          </a>

          {presta.is_premium && presta.telephone ? (
            <a
              href={`tel:${presta.telephone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-[2] flex items-center justify-center gap-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer text-white"
              style={{
                height: 44,
                background: "var(--grad2)",
                boxShadow: "0 4px 14px rgba(74,108,247,0.3)",
              }}
            >
              <IconPhone /> Appeler
            </a>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContact(presta);
              }}
              className="flex-[2] flex items-center justify-center gap-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer text-white"
              style={{
                height: 44,
                background: "var(--grad2)",
                boxShadow: "0 4px 14px rgba(74,108,247,0.3)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(74,108,247,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(74,108,247,0.3)";
              }}
            >
              Réserver <IconArrow />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
