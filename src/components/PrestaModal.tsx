"use client";

import { Prestataire } from "@/types";

interface Props {
  presta: Prestataire;
  onClose: () => void;
  onContact: (presta: Prestataire) => void;
}

export default function PrestaModal({ presta, onClose, onContact }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(18,17,42,0.7)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden anim-popin"
        style={{ maxHeight: "92vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(74,108,247,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image header */}
        <div className="relative" style={{ height: 220, flexShrink: 0 }}>
          {presta.images[0] ? (
            <img src={presta.images[0]} alt={presta.nom} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1E1C3A, #2A1042)" }}
            >
              <span className="text-6xl opacity-20">🎉</span>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,17,42,0.8) 0%, transparent 50%)" }} />

          {presta.badge && (
            <div
              className="absolute text-[10px] font-extrabold text-white uppercase tracking-wider px-3 py-1.5 rounded-full"
              style={{ top: 16, left: 16, background: "var(--grad)", boxShadow: "0 4px 14px rgba(217,63,181,0.4)" }}
            >
              {presta.badge}
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute flex items-center justify-center rounded-full cursor-pointer transition-all duration-200"
            style={{
              top: 16, right: 16,
              width: 34, height: 34,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              color: "rgba(255,255,255,0.8)",
              border: "none",
            }}
          >
            ✕
          </button>

          <div className="absolute px-6" style={{ bottom: 18, left: 0, right: 0 }}>
            <h2
              className="text-2xl font-black text-white leading-tight"
              style={{ fontFamily: "var(--font-raleway)" }}
            >
              {presta.nom}
            </h2>
            {presta.company && (
              <p className="text-white/60 text-sm font-semibold mt-0.5">{presta.company}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
                {presta.categorie}
              </span>
              <span
                className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                style={{ background: presta.is_available ? "rgba(74,222,128,0.6)" : "rgba(251,146,60,0.6)" }}
              >
                {presta.is_available ? "✓ Disponible" : "⚠ Limité"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-7">
          <div className="flex items-center justify-between mb-5">
            {presta.note > 0 ? (
              <div className="flex items-center gap-2">
                <span style={{ color: "#FFD700", fontSize: "1.1rem" }}>★</span>
                <span className="font-extrabold text-base" style={{ color: "var(--dark)" }}>{presta.note}</span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>/ 5</span>
                {presta.reviews != null && (
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    ({presta.reviews} avis)
                  </span>
                )}
              </div>
            ) : <div />}
            <div className="text-right">
              <span className="font-extrabold text-2xl" style={{ color: "var(--blue2)", fontFamily: "var(--font-raleway)" }}>
                {presta.prix}€
              </span>
              {presta.price_note && (
                <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>{presta.price_note}</span>
              )}
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-5 font-semibold" style={{ color: "var(--muted)" }}>
            {presta.description || "Aucune description disponible."}
          </p>

          {presta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {presta.tags.map((tag, i) => (
                <span
                  key={tag}
                  className="text-xs font-bold px-3 py-1 rounded-full"
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

          {presta.is_premium && presta.telephone ? (
            <a
              href={`tel:${presta.telephone}`}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-extrabold text-white transition-all text-sm"
              style={{
                background: "var(--grad)",
                boxShadow: "0 6px 20px rgba(217,63,181,0.3)",
                letterSpacing: "0.06em",
              }}
            >
              📞 Appeler — {presta.telephone}
            </a>
          ) : (
            <button
              onClick={() => { onContact(presta); onClose(); }}
              className="w-full py-4 rounded-2xl font-extrabold text-white transition-all cursor-pointer text-sm"
              style={{
                background: "var(--grad)",
                boxShadow: "0 6px 20px rgba(217,63,181,0.3)",
                letterSpacing: "0.06em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 30px rgba(217,63,181,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(217,63,181,0.3)";
              }}
            >
              ✓ Envoyer une demande de réservation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
