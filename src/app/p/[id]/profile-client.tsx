"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Prestataire, Review } from "@/types";

const STARS = (note: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill={i < Math.round(note) ? "#f59e0b" : "none"}
      stroke="#f59e0b" strokeWidth={1.5} aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ));

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 0 }}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          <svg width={28} height={28} viewBox="0 0 24 24"
            fill={n <= (hover || value) ? "#f59e0b" : "none"}
            stroke="#f59e0b" strokeWidth={1.5} aria-hidden>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} jours`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Il y a ${months} mois`;
  return `Il y a ${Math.floor(months / 12)} an${Math.floor(months / 12) > 1 ? "s" : ""}`;
}

export default function ProfileClient({ prestataire: p }: { prestataire: Prestataire }) {
  const [activeImg, setActiveImg] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [msgError, setMsgError] = useState("");

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewNote, setReviewNote] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    fetch(`/api/reviews?prestataire_id=${p.id}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews ?? []); setLoadingReviews(false); })
      .catch(() => setLoadingReviews(false));
  }, [p.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    setMsgError("");
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prestataire_id: p.id,
        receiver_id: p.owner_id,
        content: msg.trim(),
      }),
    });
    setSending(false);
    if (!res.ok) {
      const d = await res.json();
      setMsgError(d.error ?? "Erreur lors de l'envoi.");
    } else {
      setSent(true);
      setMsg("");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNote) return;
    setSubmittingReview(true);
    setReviewError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestataire_id: p.id, note: reviewNote, commentaire: reviewComment }),
    });
    setSubmittingReview(false);
    if (!res.ok) {
      const d = await res.json();
      setReviewError(d.error ?? "Erreur lors de l'envoi.");
    } else {
      const d = await res.json();
      setReviews(prev => [d.review, ...prev]);
      setReviewSent(true);
      setReviewNote(0);
      setReviewComment("");
    }
  };

  const avgNote = reviews.length ? reviews.reduce((a, r) => a + r.note, 0) / reviews.length : 0;
  const images = p.images?.length ? p.images : ["https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.06)",
          height: 64,
        }}
      >
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Connect Event" className="h-12 w-auto object-contain" />
        </a>
        <div className="flex items-center gap-3">
          <a href="/"
            className="text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            ← Retour
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* Left: Images */}
          <div>
            <div className="rounded-2xl overflow-hidden aspect-video relative"
              style={{ background: "var(--dark2)" }}>
              <img
                src={images[activeImg]}
                alt={p.nom}
                className="w-full h-full object-cover"
              />
              {p.is_available && (
                <span className="absolute top-4 left-4 text-xs font-extrabold px-3 py-1.5 rounded-full text-white"
                  style={{ background: "rgba(34,197,94,0.85)", backdropFilter: "blur(6px)" }}>
                  Disponible
                </span>
              )}
              {p.badge && (
                <span className="absolute top-4 right-4 text-xs font-extrabold px-3 py-1.5 rounded-full text-white"
                  style={{ background: "var(--grad)", backdropFilter: "blur(6px)" }}>
                  {p.badge}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
                    style={{ border: activeImg === i ? "2.5px solid var(--blue2)" : "2px solid var(--border)" }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            {p.description && (
              <div className="mt-6 rounded-2xl p-6"
                style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
                <h2 className="font-black text-lg mb-3" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                  À propos
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{p.description}</p>
              </div>
            )}

            {/* Tags */}
            {p.tags?.length > 0 && (
              <div className="mt-4 rounded-2xl p-6"
                style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
                <h2 className="font-black text-lg mb-3" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                  Spécialités
                </h2>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span key={tag}
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(74,108,247,0.08)", color: "var(--blue2)", border: "1px solid rgba(74,108,247,0.15)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Disponibilités */}
            <div id="disponibilites" className="mt-4 rounded-2xl p-6 scroll-mt-20"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <h2 className="font-black text-lg mb-3" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                Disponibilités
              </h2>
              <div className="flex items-center gap-3 p-4 rounded-xl"
                style={{
                  background: p.is_available ? "rgba(74,222,128,0.07)" : "rgba(251,146,60,0.07)",
                  border: `1px solid ${p.is_available ? "rgba(74,222,128,0.3)" : "rgba(251,146,60,0.3)"}`,
                }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background: p.is_available ? "#4ADE80" : "#FB923C",
                    boxShadow: p.is_available ? "0 0 8px #4ADE80" : "0 0 8px #FB923C",
                  }} />
                <div>
                  <div className="text-sm font-extrabold"
                    style={{ color: p.is_available ? "#16a34a" : "#ea580c" }}>
                    {p.is_available ? "Disponible pour de nouvelles réservations" : "Agenda chargé en ce moment"}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {p.is_available
                      ? "Contactez ce prestataire pour confirmer vos dates."
                      : "Ce prestataire a un agenda chargé. Vous pouvez tout de même envoyer une demande."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Info card + contact */}
          <div className="flex flex-col gap-4">
            {/* Info card */}
            <div className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
                    {p.categorie}
                  </span>
                </div>
                {p.continent && (
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>📍 {p.continent}</span>
                )}
              </div>

              <h1 className="font-black text-2xl mb-0.5" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                {p.nom}
              </h1>
              {p.company && (
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--muted)" }}>{p.company}</p>
              )}

              {(avgNote > 0 || p.note > 0) && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">{STARS(avgNote || p.note)}</div>
                  <span className="text-sm font-extrabold" style={{ color: "var(--dark)" }}>
                    {(avgNote || p.note).toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    ({reviews.length || p.reviews || 0} avis)
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black" style={{
                  background: "var(--grad)", WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  {p.prix} €
                </span>
                {p.price_note && (
                  <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>{p.price_note}</span>
                )}
              </div>

              {p.is_premium && p.telephone ? (
                <a href={`tel:${p.telephone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-extrabold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: "var(--grad)", boxShadow: "0 6px 22px rgba(217,63,181,0.3)" }}>
                  📞 Appeler — {p.telephone}
                </a>
              ) : (
                <a href="#contact"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-extrabold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: "var(--grad)", boxShadow: "0 6px 22px rgba(217,63,181,0.3)" }}>
                  ✉️ Envoyer une demande
                </a>
              )}
            </div>

            {/* Contact form */}
            <div id="contact" className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <h2 className="font-black text-lg mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                Envoyer un message
              </h2>
              <p className="text-xs font-semibold mb-4" style={{ color: "var(--muted)" }}>
                Décrivez votre projet et votre date
              </p>

              {sent ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold" style={{ color: "var(--dark)" }}>Message envoyé !</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    {p.nom.split(" ")[0]} vous répondra rapidement.
                  </p>
                  <button onClick={() => setSent(false)}
                    className="text-xs mt-3 font-semibold underline" style={{ color: "var(--blue2)" }}>
                    Envoyer un autre message
                  </button>
                </div>
              ) : !userId ? (
                <div className="text-center py-2">
                  <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
                    Connectez-vous pour envoyer un message.
                  </p>
                  <a href={`/auth/login?next=/p/${p.id}`}
                    className="inline-block text-sm font-extrabold px-5 py-2.5 rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}>
                    Se connecter
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                  <textarea
                    rows={4}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    required
                    placeholder={`Bonjour ${p.nom.split(" ")[0]}, je cherche un prestataire pour...`}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                    style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--blue2)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                  {msgError && (
                    <p className="text-red-500 text-xs font-semibold">{msgError}</p>
                  )}
                  <button type="submit" disabled={sending || !msg.trim()}
                    className="w-full py-3 rounded-xl font-extrabold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    style={{ background: "var(--grad)", boxShadow: "0 4px 16px rgba(217,63,181,0.25)" }}>
                    {sending ? "Envoi..." : "Envoyer ma demande"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── Reviews section (full width) ── */}
        <div className="mt-8" id="avis">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-2xl" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              Avis clients{" "}
              {reviews.length > 0 && (
                <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  ({reviews.length})
                </span>
              )}
            </h2>
            {avgNote > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">{STARS(avgNote)}</div>
                <span className="font-extrabold text-lg" style={{ color: "var(--dark)" }}>{avgNote.toFixed(1)}</span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>/ 5</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Reviews list */}
            <div className="flex flex-col gap-4">
              {loadingReviews ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-2xl h-28 animate-pulse"
                    style={{ background: "white", border: "1px solid var(--border)" }} />
                ))
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl p-8 text-center"
                  style={{ background: "white", border: "2px dashed var(--border)" }}>
                  <div className="text-3xl mb-3">⭐</div>
                  <p className="font-bold text-sm" style={{ color: "var(--dark)" }}>Aucun avis pour l&apos;instant</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Soyez le premier à laisser un avis !</p>
                </div>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="rounded-2xl p-5"
                    style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: "var(--grad2)" }}>
                          A
                        </div>
                        <div>
                          <div className="flex gap-0.5">{STARS(r.note)}</div>
                        </div>
                      </div>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>{timeAgo(r.created_at)}</span>
                    </div>
                    {r.commentaire && (
                      <p className="text-sm leading-relaxed mt-2" style={{ color: "var(--text)" }}>
                        {r.commentaire}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add review form */}
            <div className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <h3 className="font-black text-lg mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                Laisser un avis
              </h3>
              <p className="text-xs font-semibold mb-4" style={{ color: "var(--muted)" }}>
                Partagez votre expérience avec ce prestataire
              </p>

              {reviewSent ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-3">🎉</div>
                  <p className="font-bold text-sm" style={{ color: "var(--dark)" }}>Merci pour votre avis !</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Votre retour aide les autres clients.</p>
                </div>
              ) : !userId ? (
                <div className="text-center py-4">
                  <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
                    Connectez-vous pour laisser un avis.
                  </p>
                  <a href={`/auth/login?next=/p/${p.id}#avis`}
                    className="inline-block text-sm font-extrabold px-5 py-2.5 rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}>
                    Se connecter
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                      Note *
                    </label>
                    <StarInput value={reviewNote} onChange={setReviewNote} />
                    {reviewNote > 0 && (
                      <span className="text-xs mt-1 block" style={{ color: "var(--muted)" }}>
                        {["", "Mauvais", "Passable", "Bien", "Très bien", "Excellent !"][reviewNote]}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                      Commentaire <span style={{ color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>(optionnel)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Décrivez votre expérience..."
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                      style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--blue2)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                  {reviewError && (
                    <p className="text-red-500 text-xs font-semibold">{reviewError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submittingReview || reviewNote === 0}
                    className="w-full py-3 rounded-xl font-extrabold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    style={{ background: "var(--grad)", boxShadow: "0 4px 16px rgba(217,63,181,0.25)" }}
                  >
                    {submittingReview ? "Envoi..." : "Publier mon avis"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
