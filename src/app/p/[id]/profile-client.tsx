"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Prestataire } from "@/types";

const STARS = (note: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill={i < Math.round(note) ? "#f59e0b" : "none"}
      stroke="#f59e0b" strokeWidth={1.5} aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ));

export default function ProfileClient({ prestataire: p }: { prestataire: Prestataire }) {
  const [activeImg, setActiveImg] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [msgError, setMsgError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

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

              {p.note > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">{STARS(p.note)}</div>
                  <span className="text-sm font-extrabold" style={{ color: "var(--dark)" }}>{p.note.toFixed(1)}</span>
                  {p.reviews && (
                    <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                      ({p.reviews} avis)
                    </span>
                  )}
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
      </div>
    </div>
  );
}
