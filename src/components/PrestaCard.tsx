"use client";

import { Prestataire } from "@/types";

interface Props {
  presta: Prestataire;
  onSelect: (presta: Prestataire) => void;
  onContact: (presta: Prestataire) => void;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function PrestaCard({ presta, onSelect, onContact, isFavorited, onToggleFavorite }: Props) {
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
        {presta.images[0] ? (
          <img
            src={presta.images[0]}
            alt={presta.nom}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1E1C3A, #2A1042)" }}
          >
            <span className="text-5xl opacity-20">🎉</span>
          </div>
        )}

        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(18,17,42,0.75) 0%, transparent 55%)" }}
        />

        {/* Badge */}
        {presta.badge && (
          <div
            className="absolute text-[10px] font-extrabold text-white uppercase tracking-wider px-3 py-1.5 rounded-full"
            style={{
              top: 14, left: 14,
              background: "var(--grad)",
              boxShadow: "0 4px 14px rgba(217,63,181,0.4)",
            }}
          >
            {presta.badge}
          </div>
        )}

        {/* Favorite heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(presta.id);
          }}
          className="absolute flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
          style={{
            top: 14, right: 14,
            width: 32, height: 32,
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
            {presta.company && (
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(presta);
            }}
            className="flex-1 text-xs font-bold py-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:border"
            style={{
              background: "var(--bg2)",
              color: "var(--text)",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--blue2)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--blue2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
            }}
          >
            📅 Disponibilités
          </button>

          {presta.is_premium && presta.telephone ? (
            <a
              href={`tel:${presta.telephone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-[2] flex items-center justify-center gap-1.5 text-xs font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-white"
              style={{
                background: "var(--grad2)",
                boxShadow: "0 4px 14px rgba(74,108,247,0.3)",
              }}
            >
              📞 Appeler
            </a>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onContact(presta);
              }}
              className="flex-[2] text-xs font-extrabold py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-white hover:translate-y-[-1px]"
              style={{
                background: "var(--grad2)",
                boxShadow: "0 4px 14px rgba(74,108,247,0.3)",
              }}
            >
              Réserver →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
