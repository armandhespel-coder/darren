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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-black text-2xl mb-2" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Merci pour votre avis !
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            Votre avis sur <strong>{prestataire.nom}</strong> a bien été enregistré.
          </p>
          <a href="/" className="inline-block mt-6 text-xs font-bold px-5 py-2.5 rounded-full text-white" style={{ background: "var(--grad)" }}>
            Retour au site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⭐</div>
          <h1 className="font-black text-2xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Laisser un avis
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            Vous évaluez <strong style={{ color: "var(--text)" }}>{prestataire.nom}</strong> · {prestataire.categorie}
          </p>
        </div>

        <div className="rounded-2xl p-6 sm:p-8" style={{ background: "white", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(74,108,247,0.12)" }}>
          {/* Note étoiles */}
          <div className="mb-6">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: "var(--blue2)" }}>
              Votre note *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNote(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="cursor-pointer transition-transform"
                  style={{ background: "none", border: "none", padding: 0, transform: (hovered || note) >= star ? "scale(1.2)" : "scale(1)" }}
                  aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                >
                  <svg width={32} height={32} viewBox="0 0 24 24" fill={(hovered || note) >= star ? "#F5842A" : "none"} stroke={(hovered || note) >= star ? "#F5842A" : "var(--border)"} strokeWidth={1.5} aria-hidden="true">
                    <path d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.77 7.82 22 9 14.14 4 9.27l5.91-.91L12 2z"/>
                  </svg>
                </button>
              ))}
            </div>
            {note > 0 && (
              <p className="text-xs font-bold mt-1.5" style={{ color: "var(--muted)" }}>
                {["", "Mauvais", "Décevant", "Correct", "Bien", "Excellent !"][note]}
              </p>
            )}
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
              rows={4}
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
            className="w-full text-white font-extrabold py-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--grad)", boxShadow: "0 6px 20px rgba(74,108,247,0.3)" }}
          >
            {saving ? "Envoi…" : "Envoyer mon avis"}
          </button>
        </div>
      </div>
    </div>
  );
}
