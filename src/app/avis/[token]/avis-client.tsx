"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  token: string;
  prestataire: { id: string; nom: string; categorie: string };
}

export default function AvisClient({ token, prestataire }: Props) {
  const [note, setNote] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!note || !authorName.trim()) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: insertErr } = await supabase.from("reviews").insert({
      prestataire_id: prestataire.id,
      token_id: token,
      author_name: authorName.trim(),
      note,
      commentaire: commentaire.trim() || null,
    });

    if (insertErr) { setError(insertErr.message); setSaving(false); return; }

    await supabase.from("avis_tokens").update({ used_at: new Date().toISOString() }).eq("id", token);
    setDone(true);
    setSaving(false);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #12112A 0%, #1E1C3A 60%, #2A1042 100%)" }}>
        <div className="text-center max-w-md mx-auto px-6">
          <img src="/logo.png" alt="Connect Event" className="h-32 w-auto object-contain mx-auto mb-8" />
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-black text-2xl mb-3 text-white" style={{ fontFamily: "var(--font-raleway)" }}>
            Merci pour votre avis !
          </h1>
          <p className="text-sm font-semibold mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
            Votre avis sur <strong style={{ color: "white" }}>{prestataire.nom}</strong> a bien été enregistré.
          </p>
          <a href="/" className="inline-block text-xs font-bold px-6 py-3 rounded-full text-white" style={{ background: "var(--grad)", boxShadow: "0 8px 24px rgba(217,63,181,0.4)" }}>
            Retour au site →
          </a>
        </div>
      </div>
    );
  }

  const displayNote = hovered || note;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #12112A 0%, #1E1C3A 60%, #2A1042 100%)" }}>
      {/* Orbs */}
      <div className="fixed rounded-full pointer-events-none" style={{ width: 400, height: 400, background: "#4A6CF7", top: -150, left: -100, filter: "blur(100px)", opacity: 0.2 }} />
      <div className="fixed rounded-full pointer-events-none" style={{ width: 350, height: 350, background: "#D93FB5", bottom: -120, right: -80, filter: "blur(100px)", opacity: 0.2 }} />

      {/* Logo */}
      <header className="relative z-10 flex justify-center pt-8 pb-4">
        <img src="/logo.png" alt="Connect Event" className="h-32 w-auto object-contain" />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>
            {/* Header card */}
            <div className="px-8 pt-8 pb-6 text-center" style={{ borderBottom: "1px solid var(--border)" }}>
              <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                Évaluation prestataire
              </p>
              <h1 className="font-black text-2xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                {prestataire.nom}
              </h1>
              <span className="inline-block text-[11px] font-extrabold px-3 py-1 rounded-full" style={{ background: "rgba(74,108,247,0.08)", color: "var(--blue2)" }}>
                {prestataire.categorie}
              </span>
            </div>

            <div className="px-8 py-6">
              {/* Stars */}
              <div className="mb-6">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-5 text-center" style={{ color: "var(--muted)" }}>
                  Votre note *
                </label>
                <div className="flex gap-3 justify-center mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNote(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="cursor-pointer"
                      style={{
                        background: "none", border: "none", padding: "2px",
                        transform: displayNote >= star ? "scale(1.3)" : "scale(1)",
                        filter: displayNote >= star
                          ? "drop-shadow(0 0 10px rgba(251,191,36,0.7)) drop-shadow(0 0 4px rgba(245,158,11,0.5))"
                          : "none",
                        transition: "transform 0.15s ease, filter 0.15s ease",
                      }}
                      aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                    >
                      <i
                        className={displayNote >= star ? "fa-solid fa-star" : "fa-regular fa-star"}
                        style={{
                          fontSize: 44,
                          color: displayNote >= star ? "#F59E0B" : "#CBD5E1",
                          lineHeight: 1,
                        }}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center" style={{ minHeight: 24 }}>
                  {displayNote > 0 && (
                    <span className="text-base font-extrabold" style={{ color: "#F59E0B" }}>
                      {["", "Mauvais 😕", "Décevant 😐", "Correct 🙂", "Bien 😊", "Excellent ! 🤩"][displayNote]}
                    </span>
                  )}
                </div>
              </div>

              {/* Nom */}
              <div className="mb-4">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                  Votre prénom / nom *
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="Ex : Marie D."
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
                  style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* Commentaire */}
              <div className="mb-6">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                  Votre commentaire
                </label>
                <textarea
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  placeholder="Décrivez votre expérience…"
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all resize-none"
                  style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm font-bold" style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)", color: "#dc2626" }}>
                  ✕ {error}
                </div>
              )}

              <button
                onClick={submit}
                disabled={saving || !note || !authorName.trim()}
                className="w-full font-extrabold py-4 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white"
                style={{ background: "var(--grad)", boxShadow: "0 8px 24px rgba(217,63,181,0.35)", fontSize: "0.95rem", letterSpacing: "0.02em" }}
                onMouseEnter={e => { if (!saving && note && authorName.trim()) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
              >
                {saving ? "Envoi en cours…" : "⭐ Envoyer mon avis"}
              </button>
            </div>
          </div>

          <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            Connect Event — Votre avis aide la communauté
          </p>
        </div>
      </main>
    </div>
  );
}
