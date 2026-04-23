"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PrestaCard from "@/components/PrestaCard";
import PrestaModal from "@/components/PrestaModal";
import SearchBar, { MAX_BUDGET } from "@/components/SearchBar";
import { Prestataire } from "@/types";

// ─── Types & constantes ───────────────────────────────────────────────────────

const DEFAULT_FILTERS = { search: "", categorie: "Tous", budgetMax: MAX_BUDGET };

const CATEGORY_PILLS = [
  { label: "Tous", icon: "✨" },
  { label: "DJ", icon: "🎧" },
  { label: "Décoratrice", icon: "🌸" },
  { label: "Matériel", icon: "🎪" },
  { label: "Voiture", icon: "🚗" },
  { label: "Traiteur", icon: "🍽️" },
  { label: "Photo & Caméra", icon: "📸" },
  { label: "Feux d'artifice", icon: "🎆" },
  { label: "Location de salle", icon: "🏛️" },
  { label: "Gâteau", icon: "🎂" },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconHome({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function IconUsers({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

function IconPhone({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012.48 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function IconMail({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 7l-10 7L2 7"/>
    </svg>
  );
}

function IconMapPin({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function IconLock({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
}

function IconStar({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.77 7.82 22 9 14.14 4 9.27l5.91-.91L12 2z"/>
    </svg>
  );
}

function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconCheckWhite() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ─── Composant "Devenir prestataire" modal ────────────────────────────────────

interface ProForm { nom: string; service: string; email: string; telephone: string; message: string; }
const SERVICES = ["DJ","Décoratrice","Matériel","Voiture","Traiteur","Photo & Caméra","Feux d'artifice","Location de salle","Gâteau","Autre"];

function DevenirPrestaireModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<ProForm>({ nom: "", service: "", email: "", telephone: "", message: "" });
  const [success, setSuccess] = useState(false);

  const update = (k: keyof ProForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.service) return;
    const subject = encodeURIComponent(`Candidature prestataire — ${form.service} — ${form.nom}`);
    const body = encodeURIComponent(
      `Nom : ${form.nom}\nService : ${form.service}\nEmail : ${form.email}\nTéléphone : ${form.telephone}\n\nMessage :\n${form.message}`
    );
    window.location.href = `mailto:yagan_darren@hotmail.com?subject=${subject}&body=${body}`;
    setSuccess(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(18,17,42,0.7)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden anim-popin"
        style={{ maxHeight: "92vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(74,108,247,0.25)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ background: "linear-gradient(135deg, var(--dark2), #2A1042)", padding: "28px 32px" }}
          className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-raleway)" }}>
              Rejoindre Connect Event
            </h2>
            <p className="text-white/50 text-sm mt-1">Présentez votre offre et touchez des milliers de clients</p>
          </div>
          <button
            aria-label="Fermer"
            onClick={onClose}
            className="flex items-center justify-center rounded-full text-white/70 hover:text-white cursor-pointer transition-all"
            style={{ width: 44, height: 44, background: "rgba(255,255,255,0.1)", border: "none", flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
          >
            <IconX />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--grad)", boxShadow: "0 8px 28px rgba(217,63,181,0.4)" }}>
              <IconCheckWhite />
            </div>
            <h3 className="text-xl font-black mb-3" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              Message envoyé !
            </h3>
            <p className="text-sm font-semibold leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
              Notre équipe vous contactera sous 24 à 48h pour finaliser votre inscription.
            </p>
            <button onClick={onClose}
              className="text-white text-sm font-extrabold px-8 rounded-xl cursor-pointer"
              style={{ height: 44, background: "var(--grad2)" }}>
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-8 flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                Nom / Prénom *
              </label>
              <input
                required value={form.nom} onChange={e => update("nom", e.target.value)}
                placeholder="Marie Dupont"
                className="w-full rounded-xl px-4 text-sm font-semibold outline-none transition-all"
                style={{ height: 44, background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                Service proposé *
              </label>
              <select
                required value={form.service} onChange={e => update("service", e.target.value)}
                className="w-full rounded-xl px-4 text-sm font-semibold outline-none cursor-pointer"
                style={{ height: 44, background: "var(--bg)", border: "1.5px solid var(--border)", color: form.service ? "var(--text)" : "var(--muted)", appearance: "none" }}
              >
                <option value="">Sélectionner une catégorie...</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                  Email *
                </label>
                <input
                  required type="email" value={form.email} onChange={e => update("email", e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full rounded-xl px-4 text-sm font-semibold outline-none transition-all"
                  style={{ height: 44, background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                  Téléphone
                </label>
                <input
                  type="tel" value={form.telephone} onChange={e => update("telephone", e.target.value)}
                  placeholder="+32 4 ..."
                  className="w-full rounded-xl px-4 text-sm font-semibold outline-none transition-all"
                  style={{ height: 44, background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                Décrivez votre offre
              </label>
              <textarea
                rows={3} value={form.message} onChange={e => update("message", e.target.value)}
                placeholder="Votre expérience, zone géographique, tarifs, style..."
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all resize-none"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-white font-extrabold rounded-xl cursor-pointer transition-all text-sm mt-1"
              style={{ height: 52, background: "var(--grad)", boxShadow: "0 6px 22px rgba(217,63,181,0.3)", letterSpacing: "0.06em" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 30px rgba(217,63,181,0.4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 22px rgba(217,63,181,0.3)";
              }}
            >
              <IconCheck /> Envoyer ma candidature
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function HomePage() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [selectedPresta, setSelectedPresta] = useState<Prestataire | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPrestaireModal, setShowPrestaireModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [dbCategories, setDbCategories] = useState<Array<{ name: string; icon: string }>>([]);
  const [validTags, setValidTags] = useState<Set<string>>(new Set());

  const router = useRouter();
  const ADMIN_EMAILS = ["armand.hespel@hotmail.com", "yagan_darren@hotmail.com", "studiohesperides@gmail.com"];

  useEffect(() => {
    const saved = localStorage.getItem("ce_favorites");
    if (saved) setFavorites(new Set(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("site_categories").select("name, icon").order("position").then(({ data }) => {
      if (data?.length) setDbCategories(data as Array<{ name: string; icon: string }>);
    });
    supabase.from("site_tags").select("name").then(({ data }) => {
      if (data?.length) setValidTags(new Set((data as Array<{ name: string }>).map(t => t.name)));
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("ce_favorites", JSON.stringify([...next]));
      return next;
    });
  };

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("prestataires")
      .select("*")
      .order("is_premium", { ascending: false })
      .then(({ data }) => {
        setPrestataires((data as Prestataire[]) ?? []);
        setLoading(false);
      });
  }, []);

  // Nettoyer les favoris orphelins après chargement
  useEffect(() => {
    if (loading) return;
    const validIds = new Set(prestataires.map(p => p.id));
    setFavorites(prev => {
      const next = new Set([...prev].filter(id => validIds.has(id)));
      if (next.size !== prev.size) {
        localStorage.setItem("ce_favorites", JSON.stringify([...next]));
        return next;
      }
      return prev;
    });
  }, [prestataires, loading]);

  const filtered = useMemo(() => {
    return prestataires.filter((p) => {
      if (showFavoritesOnly && !favorites.has(p.id)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = `${p.nom} ${p.company ?? ""} ${p.tags.join(" ")} ${p.description ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.categorie !== "Tous" && p.categorie !== filters.categorie) return false;
      if (activeCategory !== "Tous" && p.categorie !== activeCategory) return false;
      if (filters.budgetMax < MAX_BUDGET && p.prix > filters.budgetMax) return false;
      return true;
    });
  }, [prestataires, filters, activeCategory, showFavoritesOnly, favorites]);

  const categoryPills = useMemo(() => [
    { label: "Tous", icon: "✨" },
    ...(dbCategories.length
      ? dbCategories.map(c => ({ label: c.name, icon: c.icon }))
      : CATEGORY_PILLS.slice(1)),
  ], [dbCategories]);

  const activeCat = categoryPills.find(c => c.label === activeCategory) ?? categoryPills[0];

  return (
    <>
      {selectedPresta && (
        <PrestaModal
          presta={selectedPresta}
          onClose={() => setSelectedPresta(null)}
          onContact={(p) => { setSelectedPresta(null); router.push(`/p/${p.id}`); }}
          validTags={validTags}
        />
      )}
      {showPrestaireModal && (
        <DevenirPrestaireModal onClose={() => setShowPrestaireModal(false)} />
      )}

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.08)",
          padding: "0 48px",
          height: 72,
        }}
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <img src="/logo.png" alt="Connect Event" className="h-20 w-auto object-contain" />
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Accueil", href: "/", icon: <IconHome /> },
            { label: "Prestataires", href: "#prestataires", icon: <IconUsers /> },
            { label: "Contact", href: "#contact", icon: <IconPhone /> },
          ].map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
              style={i === 0
                ? { background: "var(--grad2)", color: "white", boxShadow: "0 4px 14px rgba(74,108,247,0.35)" }
                : { color: "var(--muted)" }
              }
              onMouseEnter={i !== 0 ? e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--blue2)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(74,108,247,0.07)";
              } : undefined}
              onMouseLeave={i !== 0 ? e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)";
                (e.currentTarget as HTMLAnchorElement).style.background = "none";
              } : undefined}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label={showFavoritesOnly ? "Masquer les favoris" : "Afficher les favoris"}
            onClick={() => setShowFavoritesOnly(f => !f)}
            className="flex items-center gap-1.5 px-3 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
            style={{
              height: 44,
              background: showFavoritesOnly ? "rgba(217,63,181,0.1)" : "var(--bg2)",
              color: showFavoritesOnly ? "var(--pink)" : "var(--muted)",
              border: showFavoritesOnly ? "1.5px solid rgba(217,63,181,0.3)" : "1.5px solid transparent",
            }}
          >
            <svg width={14} height={14} fill={showFavoritesOnly ? "var(--pink)" : "none"}
              stroke={showFavoritesOnly ? "none" : "var(--muted)"} strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {favorites.size > 0 && (
              <span className="font-extrabold">{favorites.size}</span>
            )}
          </button>

          {userEmail ? (
            <div className="hidden md:flex items-center gap-2">
              {ADMIN_EMAILS.includes(userEmail) && (
                <a href="/admin"
                  className="flex items-center gap-1.5 text-xs font-extrabold px-3 rounded-full transition-all"
                  style={{ height: 36, background: "rgba(74,108,247,0.1)", color: "var(--blue2)", border: "1px solid rgba(74,108,247,0.25)" }}>
                  <IconLock /> Admin
                </a>
              )}
              {/* Menu hamburger */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(m => !m)}
                  aria-label="Menu"
                  className="flex flex-col items-center justify-center gap-[5px] cursor-pointer rounded-xl transition-all"
                  style={{
                    width: 40, height: 40,
                    background: showMenu ? "rgba(74,108,247,0.08)" : "var(--bg2)",
                    border: showMenu ? "1.5px solid rgba(74,108,247,0.35)" : "1.5px solid var(--border)",
                  }}
                >
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 16, height: 2,
                      background: showMenu ? "var(--blue2)" : "var(--muted)",
                      borderRadius: 2, display: "block", transition: "background 0.2s",
                    }} />
                  ))}
                </button>
                {showMenu && (
                  <div
                    className="absolute right-0 rounded-2xl overflow-hidden z-50"
                    style={{
                      top: "calc(100% + 8px)",
                      background: "white",
                      border: "1px solid var(--border)",
                      boxShadow: "0 12px 40px rgba(74,108,247,0.18)",
                      minWidth: 190,
                    }}
                  >
                    <a
                      href="/messages"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      💬 Messages
                    </a>
                    <a
                      href="/fonctionnement"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      ❓ Aide
                    </a>
                    <button
                      onClick={async () => {
                        const s = createClient();
                        await s.auth.signOut();
                        setUserEmail(null);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all w-full text-left cursor-pointer"
                      style={{ color: "#dc2626", background: "transparent", border: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      🚪 Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <a href="/auth/login"
              className="text-xs font-bold hidden md:block transition-colors duration-200"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--blue2)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
              Connexion
            </a>
          )}

          <button
            onClick={() => setShowPrestaireModal(true)}
            className="flex items-center gap-1.5 text-white text-xs font-extrabold px-4 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer"
            style={{
              height: 44,
              background: "var(--grad)",
              boxShadow: "0 4px 14px rgba(217,63,181,0.3)",
              letterSpacing: "0.04em",
              border: "none",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 22px rgba(217,63,181,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(217,63,181,0.3)";
            }}
          >
            <IconStar /> Devenir prestataire
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden text-center" style={{ background: "var(--dark2)", padding: "80px 48px 100px" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #12112A 0%, #1E1C3A 50%, #2A1042 100%)" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#4A6CF7", top:-200, left:-100, filter:"blur(80px)", opacity:0.35 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#D93FB5", bottom:-200, right:-100, filter:"blur(80px)", opacity:0.35 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:300, height:300, background:"#F5842A", top:"50%", left:"50%", transform:"translate(-50%,-50%)", filter:"blur(80px)", opacity:0.35 }} />

        <div className="relative z-10">
          <h1
            className="font-black text-white leading-tight mb-4 anim-up"
            style={{ fontFamily: "var(--font-raleway)", fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
          >
            Réservez les meilleurs<br />
            prestataires pour votre<br />
            <em style={{ fontStyle: "italic", background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              événement
            </em>
          </h1>
          <p className="mx-auto mb-12 anim-up" style={{ color: "rgba(255,255,255,0.6)", maxWidth: 500, lineHeight: 1.75, fontSize: "1rem", animationDelay: "0.1s" }}>
            DJ, décoratrices, traiteurs, photographes, feux d&apos;artifice et bien plus encore —<br />
            trouvez les meilleurs experts en Belgique.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-0 mb-0 anim-up" style={{ animationDelay: "0.2s" }}>
            {[
              [String(categoryPills.length - 1), "Catégories"],
              [loading ? "..." : String(prestataires.length) + "+", "Prestataires"],
              ["Belgique", "Zone couverte"],
              ["100%", "Certifiés"],
            ].map(([val, label], i, arr) => (
              <div key={label} className="flex items-center">
                <div
                  className="text-center px-8 py-5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: i === 0 ? "16px 0 0 16px" : i === arr.length - 1 ? "0 16px 16px 0" : "0",
                    borderRight: i < arr.length - 1 ? "none" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="font-black text-3xl" style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {val}
                  </div>
                  <div className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter bar (floating) ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6" style={{ marginTop: -36 }}>
        <SearchBar filters={filters} onChange={setFilters} onSearch={() => {}} categories={dbCategories.map(c => c.name)} />
      </div>

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-6 pt-14 pb-20" id="prestataires">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-10">
          {categoryPills.map(({ label, icon }) => {
            const count = label === "Tous" ? prestataires.length : prestataires.filter(p => p.categorie === label).length;
            const isActive = activeCategory === label;
            return (
              <button
                key={label}
                onClick={() => { setActiveCategory(label); setShowFavoritesOnly(false); }}
                className="flex-shrink-0 flex items-center gap-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap"
                style={{
                  padding: "10px 22px",
                  background: isActive ? "var(--grad2)" : "white",
                  color: isActive ? "white" : "var(--muted)",
                  border: isActive ? "1.5px solid transparent" : "1.5px solid var(--border)",
                  boxShadow: isActive ? "0 6px 20px rgba(74,108,247,0.3)" : "none",
                }}
              >
                <span>{icon}</span>
                {label}
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                  style={isActive
                    ? { background: "rgba(255,255,255,0.25)" }
                    : { background: "var(--bg2)", color: "var(--muted)" }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h2
              className="font-black text-[1.7rem]"
              style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}
            >
              {showFavoritesOnly ? "❤️ Mes" : `${activeCat.icon} ${activeCat.label === "Tous" ? "Tous les" : ""}`}{" "}
              <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {showFavoritesOnly ? "favoris" : activeCat.label === "Tous" ? "prestataires" : activeCat.label + "s"}
              </span>
            </h2>
            <p className="text-xs font-semibold mt-1" style={{ color: "var(--muted)" }}>Découvrez nos experts disponibles</p>
          </div>
          <span className="text-sm font-semibold px-4 py-1.5 rounded-full" style={{ background: "var(--bg2)", color: "var(--muted)" }}>
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" style={{ border: "1px solid var(--border)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl" style={{ border: "2px dashed var(--border)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bg2)" }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                <path d="M8 11h6M11 8v6"/>
              </svg>
            </div>
            <h3 className="font-extrabold text-lg mb-2" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              {showFavoritesOnly ? "Aucun favori" : "Aucun résultat"}
            </h3>
            <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
              {showFavoritesOnly ? "Cliquez sur ♥ sur les cartes pour ajouter vos favoris." : "Essayez de modifier vos filtres."}
            </p>
            <button
              onClick={() => { setFilters(DEFAULT_FILTERS); setActiveCategory("Tous"); setShowFavoritesOnly(false); }}
              className="mt-4 text-xs font-bold px-5 py-2 rounded-full cursor-pointer transition-all"
              style={{ background: "var(--bg2)", color: "var(--muted)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <PrestaCard
                key={p.id}
                presta={p}
                onSelect={setSelectedPresta}
                onContact={(p) => router.push(`/p/${p.id}`)}
                isFavorited={favorites.has(p.id)}
                onToggleFavorite={toggleFavorite}
                validTags={validTags}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Contact band ── */}
      <section
        id="contact"
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--dark2) 0%, #2A1042 100%)", marginTop: 40 }}
      >
        <div className="absolute rounded-full pointer-events-none" style={{ width:300, height:300, background:"#4A6CF7", top:-100, right:100, filter:"blur(80px)", opacity:0.15 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:200, height:200, background:"#D93FB5", bottom:-80, left:100, filter:"blur(60px)", opacity:0.15 }} />
        <div className="relative flex flex-wrap gap-6 items-center justify-between" style={{ padding: "48px 48px" }}>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black"
              style={{ background: "var(--grad2)", boxShadow: "0 6px 20px rgba(74,108,247,0.4)" }}
            >
              CE
            </div>
            <span className="font-black text-white text-lg" style={{ fontFamily: "var(--font-raleway)" }}>
              Connect Event
            </span>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { icon: <IconMail />, label: "Email", val: "yagan_darren@hotmail.com" },
              { icon: <IconPhone />, label: "Téléphone", val: "04 83 03 32 02" },
              { icon: <IconMapPin />, label: "Zone couverte", val: "Belgique" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: 40, height: 40, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{item.label}</div>
                  <div className="text-sm font-bold text-white">{item.val}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowPrestaireModal(true)}
            className="flex items-center gap-2 text-white text-sm font-extrabold px-6 rounded-full cursor-pointer transition-all whitespace-nowrap"
            style={{ height: 48, background: "var(--grad)", boxShadow: "0 4px 14px rgba(217,63,181,0.3)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(217,63,181,0.45)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(217,63,181,0.3)";
            }}
          >
            <IconStar /> Devenir prestataire
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--dark)", padding: "24px 48px" }}>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: "Confidentialité", href: "/confidentialite" },
              { label: "Conditions générales", href: "/cgv" },
              { label: "Fonctionnement", href: "/fonctionnement" },
              { label: "À propos", href: "/a-propos" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-xs font-semibold transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.8)")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)")}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © 2025{" "}
            <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 800 }}>
              Connect Event
            </span>{" "}
            — Tous droits réservés
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex items-center justify-center rounded-full transition-all"
              style={{ width: 36, height: 36, background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)")}
            >
              <svg width={16} height={16} fill="white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center justify-center rounded-full transition-all"
              style={{ width: 36, height: 36, background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)")}
            >
              <svg width={16} height={16} fill="white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
