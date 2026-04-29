"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Prestataire } from "@/types";
import Navbar from "@/components/Navbar";

interface Props {
  prestataire: Prestataire;
  userEmail: string;
}

function completionScore(p: Prestataire) {
  const checks = [
    p.images?.length >= 3,
    (p.description?.length ?? 0) > 30,
    p.prix > 0,
    p.tags?.length >= 1,
  ];
  const done = checks.filter(Boolean).length;
  return { done, total: checks.length, pct: Math.round((done / checks.length) * 100) };
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

function EditableCalendar({ prestataire: p }: { prestataire: Prestataire }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [busyDates, setBusyDates] = useState<string[]>(p.busy_dates ?? []);
  const [isAvailable, setIsAvailable] = useState(p.is_available);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthName = base.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const firstDay = (base.getDay() + 6) % 7;
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const busySet = new Set(busyDates);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toggleDate = async (dateStr: string) => {
    const next = new Set(busySet);
    if (next.has(dateStr)) next.delete(dateStr);
    else next.add(dateStr);
    const nextArr = [...next];
    setBusyDates(nextArr);
    setSaving(true);
    const supabase = createClient();
    await supabase.from("prestataires").update({ busy_dates: nextArr }).eq("id", p.id);
    setSaving(false);
  };

  const toggleAvailable = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    const supabase = createClient();
    await supabase.from("prestataires").update({ is_available: next }).eq("id", p.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <button
          onClick={toggleAvailable}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer"
          style={{
            background: isAvailable ? "rgba(74,222,128,0.1)" : "rgba(251,146,60,0.1)",
            border: `1.5px solid ${isAvailable ? "rgba(74,222,128,0.4)" : "rgba(251,146,60,0.4)"}`,
            color: isAvailable ? "#16a34a" : "#ea580c",
          }}
        >
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: isAvailable ? "#4ADE80" : "#FB923C",
            boxShadow: isAvailable ? "0 0 6px #4ADE80" : "0 0 6px #FB923C",
            flexShrink: 0,
          }} />
          {isAvailable ? "Disponible — cliquer pour changer" : "Agenda chargé — cliquer pour changer"}
        </button>
        {saving && (
          <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
            Sauvegarde...
          </span>
        )}
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
                <button
                  key={i}
                  onClick={() => !isPast && toggleDate(dateStr)}
                  disabled={isPast}
                  title={isPast ? undefined : (isBusy ? "Marquer comme libre" : "Marquer comme pris")}
                  style={{
                    textAlign: "center", borderRadius: 8, padding: "6px 2px",
                    background: isBusy ? "rgba(251,146,60,0.18)" : isToday ? "rgba(74,108,247,0.1)" : "transparent",
                    border: isBusy ? "1.5px solid rgba(251,146,60,0.5)" : isToday ? "1.5px solid rgba(74,108,247,0.4)" : "1.5px solid transparent",
                    opacity: isPast ? 0.35 : 1,
                    cursor: isPast ? "default" : "pointer",
                    transition: "background 0.15s, border 0.15s",
                  }}
                  onMouseEnter={e => { if (!isPast) (e.currentTarget as HTMLButtonElement).style.background = isBusy ? "rgba(251,146,60,0.28)" : "rgba(74,108,247,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isBusy ? "rgba(251,146,60,0.18)" : isToday ? "rgba(74,108,247,0.1)" : "transparent"; }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: isBusy ? "#ea580c" : isToday ? "var(--blue2)" : "var(--dark)" }}>{d}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, marginTop: 1, color: isBusy ? "#ea580c" : isToday ? "var(--blue2)" : "transparent" }}>
                    {isBusy ? "Pris" : isToday ? "Auj." : "·"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 py-3 flex-wrap"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(74,222,128,0.4)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Libre (cliquer pour bloquer)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(251,146,60,0.4)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Pris (cliquer pour libérer)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({ prestataire: p, userEmail }: Props) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isVisible, setIsVisible] = useState(p.is_visible !== false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  // Category / subcategory editor
  const [dbCategories, setDbCategories] = useState<Array<{ name: string }>>([]);
  const [dbSubcats, setDbSubcats] = useState<Array<{ name: string; category_name: string | null }>>([]);
  const [editCat, setEditCat] = useState(p.categorie);
  const [editSubcat, setEditSubcat] = useState(p.tags?.[0] ?? "");
  const [savingCat, setSavingCat] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("site_categories").select("name").order("position").then(({ data }) => {
      if (data?.length) setDbCategories(data as Array<{ name: string }>);
    });
    supabase.from("site_subcategories").select("name, category_name").then(({ data }) => {
      if (data?.length) setDbSubcats(data as Array<{ name: string; category_name: string | null }>);
    });
  }, []);

  const availableSubcats = dbSubcats.filter(s => s.category_name === editCat).map(s => s.name);

  const saveCategorySubcat = async () => {
    setSavingCat(true);
    const supabase = createClient();
    await supabase.from("prestataires").update({
      categorie: editCat,
      tags: editSubcat ? [editSubcat] : [],
    }).eq("id", p.id);
    setSavingCat(false);
  };

  const toggleVisibility = async () => {
    setTogglingVisibility(true);
    const next = !isVisible;
    setIsVisible(next);
    const supabase = createClient();
    await supabase.from("prestataires").update({ is_visible: next }).eq("id", p.id);
    setTogglingVisibility(false);
  };

  const { done, total, pct } = completionScore(p);

  const stats = [
    { label: "Profil complété", value: `${pct}%`, icon: "✨", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
    { label: "Statut", value: p.is_premium ? "Premium" : "Standard", icon: p.is_premium ? "⭐" : "○", color: p.is_premium ? "#7c3aed" : "var(--muted)", bg: p.is_premium ? "rgba(124,58,237,0.08)" : "var(--bg2)" },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-black text-3xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Bonjour{" "}
            <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {p.nom.split(" ")[0]} 👋
            </span>
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>{userEmail}</p>
        </div>

        {/* Visibility toggle — prominent */}
        <div
          className="flex items-center justify-between gap-4 mb-4 p-4 rounded-2xl flex-wrap"
          style={{
            background: isVisible ? "rgba(74,222,128,0.07)" : "rgba(239,68,68,0.06)",
            border: `1.5px solid ${isVisible ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
              background: isVisible ? "#4ADE80" : "#f87171",
              boxShadow: isVisible ? "0 0 8px #4ADE80" : "0 0 8px #f87171",
            }} />
            <div>
              <p className="font-extrabold text-sm" style={{ color: isVisible ? "#16a34a" : "#dc2626" }}>
                {isVisible ? "Fiche visible sur la plateforme" : "Fiche masquée — invisible pour les clients"}
              </p>
              <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                {isVisible ? "Les clients peuvent trouver votre profil." : "Votre profil n'apparaît pas dans les résultats."}
              </p>
            </div>
          </div>
          <button
            onClick={toggleVisibility}
            disabled={togglingVisibility}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-extrabold cursor-pointer transition-all disabled:opacity-50"
            style={{
              background: isVisible ? "rgba(239,68,68,0.1)" : "rgba(74,222,128,0.1)",
              color: isVisible ? "#dc2626" : "#16a34a",
              border: `1.5px solid ${isVisible ? "rgba(239,68,68,0.25)" : "rgba(74,222,128,0.25)"}`,
            }}
          >
            {isVisible ? "👁️ Masquer ma fiche" : "👁️ Rendre visible"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl p-5"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div className="font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          {/* Left */}
          <div className="flex flex-col gap-4">
            {/* Completion */}
            <div className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-lg" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                  Complétion du profil
                </h2>
                <span className="text-sm font-extrabold" style={{ color: "var(--blue2)" }}>{pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full mb-3" style={{ background: "var(--bg2)" }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--grad)" }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { lbl: "3+ photos", done: p.images?.length >= 3 },
                  { lbl: "Description", done: (p.description?.length ?? 0) > 30 },
                  { lbl: "Prix", done: p.prix > 0 },
                  { lbl: "Sous-catégorie", done: p.tags?.length >= 1 },
                ].map((c) => (
                  <div key={c.lbl} className="flex items-center gap-2 text-xs font-semibold"
                    style={{ color: c.done ? "#16a34a" : "var(--muted)" }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
                      background: c.done ? "rgba(22,163,74,0.15)" : "var(--bg2)",
                      color: c.done ? "#16a34a" : "var(--muted)",
                    }}>
                      {c.done ? "✓" : "○"}
                    </span>
                    {c.lbl}
                  </div>
                ))}
              </div>
              {done < total && (
                <a href={`/p/edit/${p.id}`}
                  className="mt-4 flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-extrabold text-white"
                  style={{ background: "var(--grad)" }}>
                  Compléter mon profil →
                </a>
              )}
            </div>

            {/* Catégorie & Sous-catégorie */}
            <div className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <h2 className="font-black text-lg mb-4" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                🏷️ Catégorie & Spécialité
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                    Catégorie
                  </label>
                  <select
                    value={editCat}
                    onChange={e => { setEditCat(e.target.value); setEditSubcat(""); }}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none"
                    style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)", appearance: "none" }}
                  >
                    {(dbCategories.length ? dbCategories : [{ name: p.categorie }]).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {availableSubcats.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--pink)" }}>
                      Sous-catégorie
                    </label>
                    <select
                      value={editSubcat}
                      onChange={e => setEditSubcat(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none"
                      style={{ background: "var(--bg)", border: "1.5px solid rgba(217,63,181,0.4)", color: "var(--text)", appearance: "none" }}
                    >
                      <option value="">— Sélectionner —</option>
                      {availableSubcats.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  onClick={saveCategorySubcat}
                  disabled={savingCat}
                  className="w-full py-2.5 rounded-xl text-sm font-extrabold text-white cursor-pointer disabled:opacity-50"
                  style={{ background: "var(--grad2)" }}
                >
                  {savingCat ? "Sauvegarde..." : "Enregistrer"}
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <h2 className="font-black text-lg mb-4" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                Actions rapides
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  { href: `/p/edit/${p.id}`, icon: "✏️", label: "Modifier mon profil", sub: "Photos, description, prix" },
                  { href: `/p/${p.id}`, icon: "👁️", label: "Voir ma fiche publique", sub: "Tel que vu par les clients" },
                ].map((item) => (
                  <a key={item.href} href={item.href}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ background: "var(--bg)", border: "1.5px solid var(--border)" }}>
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>{item.label}</div>
                      <div className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{item.sub}</div>
                    </div>
                    <svg className="ml-auto" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ color: "var(--muted)" }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Disponibilités */}
            <div className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-black text-lg" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                    📅 Disponibilités
                  </h2>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--muted)" }}>
                    Gérez votre calendrier directement ici
                  </p>
                </div>
                <button
                  onClick={() => setShowCalendar(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-full cursor-pointer transition-all"
                  style={{
                    background: showCalendar ? "var(--grad2)" : "var(--bg2)",
                    color: showCalendar ? "white" : "var(--blue2)",
                    border: "1.5px solid var(--border)",
                  }}
                >
                  {showCalendar ? "Fermer ▲" : "Ouvrir ▼"}
                </button>
              </div>

              {showCalendar && <EditableCalendar prestataire={p} />}

              {!showCalendar && (
                <div className="flex items-center gap-3 p-3 rounded-xl"
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
              )}
            </div>
          </div>

          {/* Right — profile preview */}
          <div className="rounded-2xl p-5"
            style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
            <h2 className="font-black text-base mb-3" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              Aperçu de votre fiche
            </h2>

            {/* Mini card preview */}
            <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid var(--border)", maxWidth: 220, margin: "0 auto 16px" }}>
              <div className="relative" style={{ aspectRatio: "4/3", background: p.images?.[0] ? undefined : "var(--dark2)" }}>
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🎵</div>
                )}
                <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: "rgba(74,108,247,0.85)" }}>
                  {p.categorie}
                </span>
              </div>
              <div className="p-3">
                <div className="font-extrabold text-xs" style={{ color: "var(--dark)" }}>{p.nom}</div>
                {p.company && <div className="text-[10px]" style={{ color: "var(--muted)" }}>{p.company}</div>}
                <div className="font-black text-sm mt-0.5" style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {p.prix} €{p.price_note && <span className="text-[10px] font-semibold" style={{ WebkitTextFillColor: "var(--muted)" }}> {p.price_note}</span>}
                </div>
              </div>
            </div>

            {/* Badge Confiance */}
            <div className="rounded-xl p-3 mb-3"
              style={{ background: "rgba(22,163,74,0.05)", border: "1.5px solid rgba(22,163,74,0.2)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">✅</span>
                <span className="font-extrabold text-xs" style={{ color: "#16a34a" }}>Badge Confiance — Gratuit</span>
              </div>
              <p className="text-[10px] font-semibold" style={{ color: "var(--muted)", lineHeight: 1.5 }}>
                Acquis avec une moyenne de <strong>3★ et 10 avis</strong> clients.
              </p>
              <p className="text-[10px] font-bold mt-1" style={{ color: "#ea580c" }}>
                Aucune mise en avant dans les résultats.
              </p>
            </div>

            {/* Badge Top */}
            <div className="rounded-xl p-3"
              style={{
                background: p.is_premium ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)",
                border: `1.5px solid ${p.is_premium ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.15)"}`,
              }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">⭐</span>
                <span className="font-extrabold text-xs" style={{ color: "#7c3aed" }}>
                  Badge Top — {p.is_premium ? "Actif" : "Payant"}
                </span>
                {p.is_premium && (
                  <span className="ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: "#7c3aed" }}>Premium</span>
                )}
              </div>
              <p className="text-[10px] font-semibold" style={{ color: "var(--muted)", lineHeight: 1.5 }}>
                Mieux référencié · Leads sérieux · <strong>Mise en avant</strong> dans les résultats.
              </p>
              {!p.is_premium && (
                <p className="text-[10px] font-bold mt-1" style={{ color: "#7c3aed" }}>
                  Contactez-nous pour activer Premium →
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
