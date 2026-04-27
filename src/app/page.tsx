"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PrestaCard from "@/components/PrestaCard";
import PrestaModal from "@/components/PrestaModal";
import SearchBar, { MAX_BUDGET } from "@/components/SearchBar";
import DevenirPrestaireModal from "@/components/DevenirPrestaireModal";
import { Prestataire } from "@/types";

const DEFAULT_FILTERS = { search: "", categorie: "Tous", budgetMax: MAX_BUDGET };

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

// ─── Page principale ──────────────────────────────────────────────────────────

export default function HomePage() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPresta, setSelectedPresta] = useState<Prestataire | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPrestaireModal, setShowPrestaireModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [dbCategories, setDbCategories] = useState<Array<{ name: string; icon: string }>>([]);
  const [validTags, setValidTags] = useState<Set<string>>(new Set());
  const [dbTags, setDbTags] = useState<Array<{ name: string; category_name: string | null }>>([]);

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
    supabase.from("site_tags").select("name, category_name").then(({ data }) => {
      if (data?.length) {
        const typed = data as Array<{ name: string; category_name: string | null }>;
        setDbTags(typed);
        setValidTags(new Set(typed.map(t => t.name)));
      }
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

  const handleFiltersChange = (newFilters: typeof filters) => {
    if (newFilters.categorie !== filters.categorie) setSelectedTag("");
    setFilters(newFilters);
  };

  // Tags disponibles pour la catégorie sélectionnée (sous-catégories)
  const availableTags = useMemo(() => {
    if (filters.categorie === "Tous") return [];
    // Priorité : tags admin liés à cette catégorie
    const categoryTags = dbTags.filter(t => t.category_name === filters.categorie).map(t => t.name);
    if (categoryTags.length > 0) return categoryTags.sort();
    // Fallback : tags issus des prestataires de cette catégorie
    const tags = new Set<string>();
    prestataires
      .filter(p => p.categorie === filters.categorie)
      .forEach(p => p.tags.forEach(t => { if (validTags.size === 0 || validTags.has(t)) tags.add(t); }));
    return [...tags].sort();
  }, [dbTags, prestataires, filters.categorie, validTags]);

  const filtered = useMemo(() => {
    return prestataires.filter((p) => {
      if (showFavoritesOnly && !favorites.has(p.id)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = `${p.nom} ${p.company ?? ""} ${p.tags.join(" ")} ${p.description ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.categorie !== "Tous" && p.categorie !== filters.categorie) return false;
      if (selectedTag && !p.tags.includes(selectedTag)) return false;
      if (filters.budgetMax < MAX_BUDGET && p.prix > filters.budgetMax) return false;
      return true;
    });
  }, [prestataires, filters, selectedTag, showFavoritesOnly, favorites]);

  const activeCatIcon = useMemo(() => {
    if (filters.categorie === "Tous") return "✨";
    return dbCategories.find(c => c.name === filters.categorie)?.icon ?? "✨";
  }, [filters.categorie, dbCategories]);

  const categoryCount = useMemo(() => dbCategories.length || 8, [dbCategories]);

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
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.08)",
          padding: "0 clamp(12px, 4vw, 48px)",
          height: 80,
        }}
      >
        {/* Logo — toujours à gauche */}
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Connect Event" className="h-32 md:h-40 w-auto object-contain" />
        </a>

        {/* Liens desktop */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Accueil", href: "/", icon: <IconHome /> },
            { label: "Prestataires", href: "#prestataires", icon: <IconUsers /> },
            { label: "Contact", href: "/contact", icon: <IconPhone /> },
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

        {/* Droite : favoris + devenir prestataire + hamburger */}
        <div className="flex items-center gap-2">
          {/* Favoris */}
          <button
            aria-label={showFavoritesOnly ? "Masquer les favoris" : "Afficher les favoris"}
            onClick={() => setShowFavoritesOnly(f => !f)}
            className="flex items-center gap-1.5 px-3 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer"
            style={{
              height: 40,
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
            {favorites.size > 0 && <span className="font-extrabold">{favorites.size}</span>}
          </button>

          {/* Devenir prestataire — desktop uniquement */}
          <button
            onClick={() => setShowPrestaireModal(true)}
            className="hidden sm:flex items-center gap-1.5 text-white text-xs font-extrabold px-4 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer"
            style={{
              height: 40,
              background: "var(--grad)",
              boxShadow: "0 4px 14px rgba(217,63,181,0.3)",
              border: "none",
              letterSpacing: "0.04em",
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

          {/* Hamburger — TOUJOURS visible */}
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
                  minWidth: 200,
                }}
              >
                {userEmail ? (
                  <>
                    {ADMIN_EMAILS.includes(userEmail) && (
                      <a href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                        style={{ color: "var(--blue2)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <IconLock size={14} /> Admin
                      </a>
                    )}
                    <a href="/messages"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      💬 Messages
                    </a>
                    <a href="/pro/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      🏠 Espace Pro
                    </a>
                    <a href="/fonctionnement"
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
                  </>
                ) : (
                  <>
                    <a href="/auth/login"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      🔑 Connexion
                    </a>
                    <a href="/auth/register"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      📝 Créer un compte
                    </a>
                    {/* Devenir prestataire — mobile uniquement */}
                    <button
                      onClick={() => { setShowPrestaireModal(true); setShowMenu(false); }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-extrabold transition-all w-full text-left cursor-pointer sm:hidden"
                      style={{ color: "var(--pink)", background: "transparent", border: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(217,63,181,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      ✨ Devenir prestataire
                    </button>
                    <a href="/fonctionnement"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--muted)", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      ❓ Aide
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden text-center" style={{ background: "var(--dark2)", padding: "clamp(40px,8vw,80px) clamp(16px,4vw,48px) clamp(60px,10vw,100px)", paddingTop: "calc(80px + clamp(40px,8vw,80px))" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #12112A 0%, #1E1C3A 50%, #2A1042 100%)" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#4A6CF7", top:-200, left:-100, filter:"blur(80px)", opacity:0.35 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#D93FB5", bottom:-200, right:-100, filter:"blur(80px)", opacity:0.35 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:300, height:300, background:"#F5842A", top:"50%", left:"50%", transform:"translate(-50%,-50%)", filter:"blur(80px)", opacity:0.35 }} />

        <div className="relative z-10 max-w-3xl mx-auto px-2">
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
          <p className="mx-auto mb-8 anim-up" style={{ color: "rgba(255,255,255,0.6)", maxWidth: 500, lineHeight: 1.75, fontSize: "1rem", animationDelay: "0.1s" }}>
            DJ, décoratrices, traiteurs, photographes, feux d&apos;artifice et bien plus encore — trouvez les meilleurs experts en Belgique.
          </p>

          {/* CTA buttons — bien visibles */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 anim-up" style={{ animationDelay: "0.15s" }}>
            <button
              onClick={() => setShowPrestaireModal(true)}
              className="flex items-center justify-center gap-2 text-white font-extrabold px-8 py-4 rounded-2xl transition-all duration-200 cursor-pointer"
              style={{
                background: "var(--grad)",
                boxShadow: "0 8px 28px rgba(217,63,181,0.45)",
                fontSize: "1rem",
                letterSpacing: "0.02em",
                border: "none",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 36px rgba(217,63,181,0.55)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(217,63,181,0.45)";
              }}
            >
              <IconStar size={16} /> Devenir prestataire
            </button>
            <a
              href="#prestataires"
              className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-2xl transition-all duration-200"
              style={{
                color: "white",
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                fontSize: "1rem",
                textDecoration: "none",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)")}
            >
              Découvrir les prestataires →
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 anim-up" style={{ animationDelay: "0.2s" }}>
            {[
              [String(categoryCount), "Catégories"],
              [loading ? "..." : String(prestataires.length) + "+", "Prestataires"],
              ["Belgique", "Zone couverte"],
              ["100%", "Certifiés"],
            ].map(([val, label]) => (
              <div
                key={label}
                className="text-center px-4 sm:px-8 py-4 sm:py-5 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="font-black text-base sm:text-3xl whitespace-nowrap" style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {val}
                </div>
                <div className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter bar (floating) ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6" style={{ marginTop: -36 }}>
        <SearchBar filters={filters} onChange={handleFiltersChange} onSearch={() => {}} categories={dbCategories.map(c => c.name)} />
      </div>

      {/* ── Sous-catégories (tags) — apparaissent quand une catégorie est sélectionnée ── */}
      {availableTags.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
            Sous-catégories — {filters.categorie}
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedTag("")}
              className="flex-shrink-0 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-all"
              style={{
                padding: "8px 18px",
                background: !selectedTag ? "var(--grad2)" : "white",
                color: !selectedTag ? "white" : "var(--muted)",
                border: !selectedTag ? "1.5px solid transparent" : "1.5px solid var(--border)",
                boxShadow: !selectedTag ? "0 4px 14px rgba(74,108,247,0.25)" : "none",
              }}
            >
              Tous
            </button>
            {availableTags.map(tag => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(t => t === tag ? "" : tag)}
                  className="flex-shrink-0 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-all"
                  style={{
                    padding: "8px 18px",
                    background: isActive ? "var(--grad2)" : "white",
                    color: isActive ? "white" : "var(--muted)",
                    border: isActive ? "1.5px solid transparent" : "1.5px solid var(--border)",
                    boxShadow: isActive ? "0 4px 14px rgba(74,108,247,0.25)" : "none",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-4 pt-10 pb-20" id="prestataires">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h2
              className="font-black text-[1.5rem] sm:text-[1.7rem]"
              style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}
            >
              {showFavoritesOnly ? "❤️ Mes" : `${activeCatIcon} ${filters.categorie === "Tous" ? "Tous les" : ""}`}{" "}
              <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {showFavoritesOnly ? "favoris" : filters.categorie === "Tous" ? "prestataires" : filters.categorie}
              </span>
              {selectedTag && (
                <span className="text-sm font-bold ml-2" style={{ color: "var(--muted)", WebkitTextFillColor: "var(--muted)" }}>
                  · {selectedTag}
                </span>
              )}
            </h2>
            <p className="text-xs font-semibold mt-1" style={{ color: "var(--muted)" }}>Découvrez nos experts disponibles</p>
          </div>
          <span className="text-sm font-semibold px-4 py-1.5 rounded-full" style={{ background: "var(--bg2)", color: "var(--muted)" }}>
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" style={{ border: "1px solid var(--border)" }} />
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
              onClick={() => { setFilters(DEFAULT_FILTERS); setSelectedTag(""); setShowFavoritesOnly(false); }}
              className="mt-4 text-xs font-bold px-5 py-2 rounded-full cursor-pointer transition-all"
              style={{ background: "var(--bg2)", color: "var(--muted)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
        <div className="relative flex flex-wrap gap-6 items-center justify-between" style={{ padding: "clamp(24px,4vw,48px) clamp(16px,4vw,48px)" }}>
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Connect Event" className="h-12 w-auto object-contain" />
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
            style={{ height: 48, background: "var(--grad)", boxShadow: "0 4px 14px rgba(217,63,181,0.3)", border: "none" }}
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
      <footer style={{ background: "var(--dark)", padding: "24px clamp(16px,4vw,48px)" }}>
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
            © 2026{" "}
            <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 800 }}>
              Connect Event
            </span>{" "}
            — Tous droits réservés
          </div>

          <div className="flex items-center gap-3">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="flex items-center justify-center rounded-full transition-all"
              style={{ width: 36, height: 36, background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)")}
            >
              <svg width={16} height={16} fill="white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
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
