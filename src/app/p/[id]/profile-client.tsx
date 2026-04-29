"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Prestataire, Review } from "@/types";
import Navbar from "@/components/Navbar";

const STARS = (note: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <i key={i}
      className={i < Math.round(note) ? "fa-solid fa-star" : "fa-regular fa-star"}
      style={{ fontSize: 14, color: "#f59e0b" }}
      aria-hidden
    />
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
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 1, transition: "transform 0.1s" }}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          <i
            className={n <= (hover || value) ? "fa-solid fa-star" : "fa-regular fa-star"}
            style={{
              fontSize: 28,
              color: n <= (hover || value) ? "#f59e0b" : "#CBD5E1",
              filter: n <= (hover || value) ? "drop-shadow(0 0 4px rgba(245,158,11,0.5))" : "none",
              transition: "color 0.15s, filter 0.15s",
            }}
            aria-hidden
          />
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

function ChevIcon({ dir }: { dir: "left" | "right" }) {
  const rot = dir === "left" ? 90 : -90;
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
      strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function DispoCalendar({ prestataire: p }: { prestataire: Prestataire }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthName = base.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const firstDay = (base.getDay() + 6) % 7;
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const busySet = new Set(p.busy_dates ?? []);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const freeCount = daysInMonth - [...busySet].filter(d => d.startsWith(
    `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}`
  )).length;

  return (
    <div id="disponibilites" className="mt-4 rounded-2xl p-6 scroll-mt-20"
      style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
      <h2 className="font-black text-lg mb-3" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
        Disponibilités
      </h2>

      <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
        style={{
          background: p.is_available ? "rgba(74,222,128,0.07)" : "rgba(251,146,60,0.07)",
          border: `1px solid ${p.is_available ? "rgba(74,222,128,0.25)" : "rgba(251,146,60,0.25)"}`,
        }}>
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: p.is_available ? "#4ADE80" : "#FB923C", boxShadow: p.is_available ? "0 0 6px #4ADE80" : "0 0 6px #FB923C" }} />
        <span className="text-sm font-extrabold" style={{ color: p.is_available ? "#16a34a" : "#ea580c" }}>
          {p.is_available ? "Disponible pour de nouvelles réservations" : "Agenda chargé en ce moment"}
        </span>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <div className="flex items-center justify-between px-4 py-3"
          style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={() => setMonthOffset(o => o - 1)}
            className="flex items-center justify-center rounded-lg transition-all cursor-pointer"
            style={{ width: 32, height: 32, background: "white", border: "1px solid var(--border)", color: "var(--muted)" }}
            aria-label="Mois précédent"
          >
            <ChevIcon dir="left" />
          </button>
          <span className="text-sm font-extrabold capitalize" style={{ color: "var(--dark)" }}>{monthName}</span>
          <button
            onClick={() => setMonthOffset(o => o + 1)}
            className="flex items-center justify-center rounded-lg transition-all cursor-pointer"
            style={{ width: 32, height: 32, background: "white", border: "1px solid var(--border)", color: "var(--muted)" }}
            aria-label="Mois suivant"
          >
            <ChevIcon dir="right" />
          </button>
        </div>

        <div style={{ padding: "12px 16px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
            {["L","M","M","J","V","S","D"].map((d, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--muted)", padding: "4px 0" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const dateStr = `${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
              const isBusy = busySet.has(dateStr);
              const isToday = base.getFullYear() === today.getFullYear() && base.getMonth() === today.getMonth() && d === today.getDate();
              const isPast = new Date(dateStr) < new Date(today.toDateString());
              return (
                <div key={i} style={{
                  textAlign: "center", borderRadius: 8, padding: "6px 2px",
                  background: isBusy ? "rgba(251,146,60,0.12)" : isToday ? "rgba(74,108,247,0.1)" : "transparent",
                  border: isToday ? "1.5px solid rgba(74,108,247,0.4)" : "1.5px solid transparent",
                  opacity: isPast ? 0.4 : 1,
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: isBusy ? "#ea580c" : isToday ? "var(--blue2)" : "var(--dark)",
                  }}>{d}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, marginTop: 1,
                    color: isBusy ? "#ea580c" : isToday ? "var(--blue2)" : "transparent" }}>
                    {isBusy ? "Pris" : isToday ? "Auj." : "·"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 py-3"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(74,222,128,0.4)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>{freeCount} libre{freeCount > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(251,146,60,0.4)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Pris</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileClient({ prestataire: p }: { prestataire: Prestataire }) {
  const [activeImg, setActiveImg] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookingMsg, setBookingMsg] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingGuests, setBookingGuests] = useState("");
  const [bookingLocation, setBookingLocation] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [msgError, setMsgError] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewNote, setReviewNote] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    setCanReview(new URLSearchParams(window.location.search).get("avis") === "1");
  }, []);

  useEffect(() => {
    fetch(`/api/reviews?prestataire_id=${p.id}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews ?? []); setLoadingReviews(false); })
      .catch(() => setLoadingReviews(false));
  }, [p.id]);

  const dateUnavailable = !!(bookingDate && (p.busy_dates ?? []).includes(bookingDate));

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMsg.trim() || !bookingPhone.trim() || dateUnavailable) return;
    setSending(true);
    setMsgError("");
    const parts: string[] = [];
    parts.push(`📞 Téléphone : ${bookingPhone.trim()}`);
    if (bookingDate) parts.push(`📅 Date de l'événement : ${new Date(bookingDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`);
    if (bookingGuests) parts.push(`👥 Nombre de personnes : ${bookingGuests}`);
    if (bookingLocation) parts.push(`📍 Lieu : ${bookingLocation}`);
    parts.push(`💬 Message : ${bookingMsg.trim()}`);
    const content = `Demande de réservation — ${p.nom}\n\n${parts.join("\n")}`;
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prestataire_id: p.id, receiver_id: p.owner_id, content }),
    });
    setSending(false);
    if (!res.ok) {
      const d = await res.json();
      setMsgError(d.error ?? "Erreur lors de l'envoi.");
    } else {
      setSent(true);
      setBookingMsg(""); setBookingDate(""); setBookingGuests(""); setBookingLocation(""); setBookingPhone("");
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
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* Left: Images */}
          <div>
            {/* Main image with nav arrows */}
            <div className="rounded-2xl overflow-hidden aspect-video relative"
              style={{ background: "var(--dark2)" }}>
              <img src={images[activeImg]} alt={p.nom} className="w-full h-full object-cover" />

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-xl cursor-pointer transition-all"
                    style={{ width: 36, height: 36, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
                    aria-label="Photo précédente"
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-xl cursor-pointer transition-all"
                    style={{ width: 36, height: 36, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
                    aria-label="Photo suivante"
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </>
              )}

              {/* Badges */}
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

              {/* Image counter */}
              {images.length > 1 && (
                <span className="absolute bottom-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                  style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                  {activeImg + 1} / {images.length}
                </span>
              )}
            </div>

            {/* Thumbnails */}
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

            {/* Vidéo */}
            {p.video_url && (
              <div className="mt-4 rounded-2xl overflow-hidden"
                style={{ background: "var(--dark2)", border: "1px solid var(--border)" }}>
                {p.video_url.includes("youtube.com") || p.video_url.includes("youtu.be") ? (
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                    <iframe
                      src={p.video_url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                      title="Vidéo prestataire"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                    />
                  </div>
                ) : (
                  <video controls className="w-full" style={{ maxHeight: 400 }}>
                    <source src={p.video_url} />
                  </video>
                )}
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

            {/* Spécialités (free-form tags) */}
            {(p.specialites?.length ?? 0) > 0 && (
              <div className="mt-4 rounded-2xl p-6"
                style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
                <h2 className="font-black text-lg mb-3" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                  Spécialités
                </h2>
                <div className="flex flex-wrap gap-2">
                  {p.specialites!.map((tag) => (
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
            <DispoCalendar prestataire={p} />
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
              </div>

              <h1 className="font-black text-2xl mb-0.5" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                {p.nom}
              </h1>
              {p.company && (
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--muted)" }}>{p.company}</p>
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

              {/* Téléphone — premium uniquement */}
              {p.is_premium && p.telephone && (
                <a
                  href={`tel:${p.telephone}`}
                  className="flex items-center justify-center gap-2 w-full rounded-xl font-extrabold text-white text-sm mb-3"
                  style={{ height: 46, background: "var(--grad)", boxShadow: "0 6px 18px rgba(217,63,181,0.3)", textDecoration: "none", letterSpacing: "0.04em" }}
                >
                  📞 Appeler — {p.telephone}
                </a>
              )}

              {/* Rating — toujours visible si note > 0 */}
              {(avgNote > 0 || p.note > 0) && (
                <div className="flex items-center gap-2 py-3 px-4 rounded-xl mb-2"
                  style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)" }}>
                  <div className="flex">{STARS(avgNote || p.note)}</div>
                  <span className="text-sm font-extrabold" style={{ color: "#b45309" }}>
                    {(avgNote || p.note).toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    ({reviews.length || p.reviews || 0} avis)
                  </span>
                </div>
              )}
            </div>

            {/* Contact form */}
            <div id="contact" className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <h2 className="font-black text-lg mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                Envoyer une demande
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
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>On vous répondra rapidement.</p>
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
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold" style={{ color: "var(--muted)" }}>Téléphone *</label>
                    <input
                      type="tel" value={bookingPhone} onChange={(e) => setBookingPhone(e.target.value)}
                      required placeholder="ex: +32 470 12 34 56"
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--blue2)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold" style={{ color: "var(--muted)" }}>Date de l&apos;événement</label>
                      <input
                        type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                        className="rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ background: "var(--bg)", border: `1.5px solid ${dateUnavailable ? "#ef4444" : "var(--border)"}`, color: "var(--text)" }}
                        onFocus={(e) => (e.target.style.borderColor = dateUnavailable ? "#ef4444" : "var(--blue2)")}
                        onBlur={(e) => (e.target.style.borderColor = dateUnavailable ? "#ef4444" : "var(--border)")}
                      />
                      {dateUnavailable && <p className="text-[11px] font-semibold" style={{ color: "#ef4444" }}>Cette date n&apos;est pas disponible.</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold" style={{ color: "var(--muted)" }}>Nb de personnes</label>
                      <input
                        type="number" min={1} value={bookingGuests} onChange={(e) => setBookingGuests(e.target.value)}
                        placeholder="ex: 150"
                        className="rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--blue2)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold" style={{ color: "var(--muted)" }}>Lieu de l&apos;événement</label>
                    <input
                      type="text" value={bookingLocation} onChange={(e) => setBookingLocation(e.target.value)}
                      placeholder="ex: Bruxelles, salle des fêtes..."
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--blue2)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold" style={{ color: "var(--muted)" }}>Votre message *</label>
                    <textarea
                      rows={3} value={bookingMsg} onChange={(e) => setBookingMsg(e.target.value)}
                      required placeholder={`Bonjour, je recherche un ${p.categorie?.toLowerCase() ?? "prestataire"} pour...`}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                      style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--blue2)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                  {msgError && <p className="text-red-500 text-xs font-semibold">{msgError}</p>}
                  <button type="submit" disabled={sending || !bookingMsg.trim() || !bookingPhone.trim() || dateUnavailable}
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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-black text-2xl" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              Avis clients{" "}
              {reviews.length > 0 && (
                <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  ({reviews.length})
                </span>
              )}
            </h2>
            {(avgNote > 0 || p.note > 0) && (
              <div className="flex items-center gap-2">
                <div className="flex">{STARS(avgNote || p.note)}</div>
                <span className="font-extrabold text-lg" style={{ color: "var(--dark)" }}>{(avgNote || p.note).toFixed(1)}</span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>/ 5</span>
              </div>
            )}
          </div>

          <div className={`grid gap-6 items-start ${canReview ? "grid-cols-1 lg:grid-cols-[1fr_360px]" : "grid-cols-1"}`}>
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
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Les avis sont collectés directement par le prestataire.</p>
                </div>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="rounded-2xl p-5"
                    style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: "var(--grad2)" }}>
                          {(r as Review & { author_name?: string }).author_name?.[0]?.toUpperCase() ?? "A"}
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: "var(--dark)" }}>
                            {(r as Review & { author_name?: string }).author_name ?? "Client vérifié"}
                          </div>
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

            {/* Add review form — uniquement via lien token ?avis=1 */}
            {canReview && (
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
                    <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>Connectez-vous pour laisser un avis.</p>
                    <a href={`/auth/login?next=/p/${p.id}?avis=1#avis`}
                      className="inline-block text-sm font-extrabold px-5 py-2.5 rounded-xl text-white"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}>
                      Se connecter
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>Note *</label>
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
                        rows={4} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Décrivez votre expérience..."
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                        style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--blue2)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      />
                    </div>
                    {reviewError && <p className="text-red-500 text-xs font-semibold">{reviewError}</p>}
                    <button type="submit" disabled={submittingReview || reviewNote === 0}
                      className="w-full py-3 rounded-xl font-extrabold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      style={{ background: "var(--grad)", boxShadow: "0 4px 16px rgba(217,63,181,0.25)" }}>
                      {submittingReview ? "Envoi..." : "Publier mon avis"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
