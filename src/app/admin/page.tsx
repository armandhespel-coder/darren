"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Prestataire } from "@/types";

const CONTINENTS = ["Europe", "Afrique", "Amérique", "Asie", "Océanie"];
const FALLBACK_CATS = [
  "DJ", "Décoratrice", "Matériel", "Voiture", "Traiteur",
  "Photo & Caméra", "Feux d'artifice", "Location de salle", "Gâteau",
];

interface FormData {
  nom: string; company: string; categorie: string; continent: string;
  prix: string; price_note: string;
  hide_company: boolean;
  images: string[];
  tags: string[];
  specialites: string[];
  description: string;
  is_available: boolean; is_premium: boolean; telephone: string;
}

function emptyForm(cats: string[]): FormData {
  return {
    nom: "", company: "", categorie: cats[0] ?? "DJ", continent: "Europe",
    prix: "", price_note: "",
    hide_company: false,
    images: [],
    tags: [],
    specialites: [],
    description: "",
    is_available: true, is_premium: false, telephone: "",
  };
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5"
      style={{ color: "var(--blue2)" }}>
      {children}
    </label>
  );
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (v: string) => void;
}
function Input({ value, onChange, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"
      style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
      onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
      onBlur={e => (e.target.style.borderColor = "var(--border)")}
    />
  );
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}
function Select({ value, onChange, children, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none cursor-pointer"
      style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)", appearance: "none" }}
    >
      {children}
    </select>
  );
}

function AdminPhotoUpload({ images, onChange, prestataireId }: {
  images: string[]; onChange: (imgs: string[]) => void; prestataireId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || images.length >= 8) return;
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("prestataire_id", prestataireId);
      const res = await fetch("/api/upload-photo", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Upload échoué."); }
      const { url } = await res.json();
      onChange([...images, url]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div>
      <input type="file" ref={fileRef} accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFile} />
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((src, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden"
              style={{ width: 72, height: 72, border: "1.5px solid var(--border)", flexShrink: 0 }}>
              <img src={src} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] text-white font-extrabold"
                  style={{ background: "rgba(74,108,247,0.8)", padding: "2px 0" }}>
                  Couv.
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black cursor-pointer"
                style={{ background: "rgba(239,68,68,0.9)", border: "none" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        disabled={uploading || images.length >= 8}
        onClick={() => fileRef.current?.click()}
        className="w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
        style={{ background: "var(--bg)", border: "1.5px dashed var(--border)", color: "var(--muted)" }}
      >
        {uploading ? "Upload en cours…" : `+ Ajouter une photo (${images.length}/8)`}
      </button>
      {err && <p className="text-xs mt-1 font-semibold" style={{ color: "#ef4444" }}>{err}</p>}
    </div>
  );
}

function UserGrowthChart({ profiles }: { profiles: Array<{ created_at: string }> }) {
  const now = new Date();
  const DAYS = 14;
  const counts = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (DAYS - 1 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const count = profiles.filter(p => p.created_at.slice(0, 10) === dateStr).length;
    return { count, label: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) };
  });
  const max = Math.max(...counts.map(c => c.count), 1);
  const H = 60;
  const W = DAYS * 26;

  return (
    <div>
      <svg width="100%" height={H + 16} viewBox={`0 0 ${W} ${H + 16}`} preserveAspectRatio="xMidYMid meet">
        {counts.map((c, i) => {
          const barH = Math.max((c.count / max) * H, 2);
          const x = i * 26;
          return (
            <g key={i}>
              <rect x={x + 4} y={H - barH} width={18} height={barH} rx={4}
                fill={c.count > 0 ? "var(--blue2)" : "var(--border)"} opacity={c.count > 0 ? 0.85 : 0.4} />
              {c.count > 0 && (
                <text x={x + 13} y={H - barH - 3} textAnchor="middle" fontSize={7} fill="var(--blue2)" fontWeight={700}>
                  {c.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-[9px] font-semibold mt-0.5" style={{ color: "var(--muted)" }}>
        <span>{counts[0].label}</span>
        <span>{counts[DAYS - 1].label}</span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const newPrestaIdRef = useRef(crypto.randomUUID());

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATS);
  const [form, setForm] = useState<FormData>(() => emptyForm(FALLBACK_CATS));
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [stats, setStats] = useState({ premium: 0, users: 0, messages: 0 });
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableSpecialites, setAvailableSpecialites] = useState<string[]>([]);
  const [userProfiles, setUserProfiles] = useState<Array<{ created_at: string }>>([]);

  const up = (k: keyof FormData, v: string | boolean | string[]) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    const [
      { data },
      premiumRes,
      usersRes,
      msgsRes,
      { data: catsData },
      { data: profilesData },
      { data: tagsData },
      { data: specialitesData },
    ] = await Promise.all([
      supabase.from("prestataires").select("*").order("created_at", { ascending: false }),
      supabase.from("prestataires").select("*", { count: "exact", head: true }).eq("is_premium", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
      supabase.from("messages").select("*", { count: "exact", head: true }).eq("read", false),
      supabase.from("site_categories").select("name").order("position"),
      supabase.from("profiles").select("created_at").eq("role", "client").order("created_at", { ascending: false }).limit(200),
      supabase.from("site_subcategories").select("name").order("name"),
      supabase.from("site_tags").select("name").order("name"),
    ]);
    setPrestataires((data as Prestataire[]) ?? []);
    setStats({ premium: premiumRes.count ?? 0, users: usersRes.count ?? 0, messages: msgsRes.count ?? 0 });
    setUserProfiles((profilesData ?? []) as Array<{ created_at: string }>);
    if (catsData?.length) {
      const cats = (catsData as Array<{ name: string }>).map(c => c.name);
      setCategories(cats);
    }
    if (tagsData?.length) setAvailableTags((tagsData as Array<{ name: string }>).map(t => t.name));
    if (specialitesData?.length) setAvailableSpecialites((specialitesData as Array<{ name: string }>).map(t => t.name));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      load();
    });
  }, [load, router, supabase.auth]);

  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) setShowMobileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const payload = {
      nom: form.nom.trim(),
      company: form.company.trim() || null,
      hide_company: form.hide_company,
      categorie: form.categorie,
      continent: form.continent,
      prix: Number(form.prix) || 0,
      price_note: form.price_note.trim() || null,
      images: form.images,
      tags: form.tags,
      specialites: form.specialites,
      description: form.description.trim() || null,
      is_available: form.is_available,
      is_premium: form.is_premium,
      telephone: form.is_premium ? (form.telephone.trim() || null) : null,
    };

    if (editId) {
      const { error } = await supabase.from("prestataires").update(payload).eq("id", editId);
      if (error) setMsg({ type: "err", text: error.message });
      else { setMsg({ type: "ok", text: "Prestataire mis à jour !" }); resetForm(); load(); }
    } else {
      const res = await fetch("/api/admin/new-prestataire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: newPrestaIdRef.current }),
      });
      const json = await res.json();
      if (!res.ok) setMsg({ type: "err", text: json.error ?? "Erreur création." });
      else {
        const link = `${window.location.origin}/claim/${json.token_id}`;
        setCreatedLink(link);
        setMsg({ type: "ok", text: "Prestataire créé ! Copiez le lien ci-dessous et envoyez-le au prestataire." });
        newPrestaIdRef.current = crypto.randomUUID();
        resetForm();
        load();
      }
    }
    setSaving(false);
  };

  const handleEdit = (p: Prestataire) => {
    setEditId(p.id);
    setForm({
      nom: p.nom, company: p.company ?? "",
      categorie: p.categorie, continent: p.continent ?? "Europe",
      prix: String(p.prix), price_note: p.price_note ?? "",
      hide_company: p.hide_company ?? false,
      images: p.images ?? [],
      tags: p.tags ?? [],
      specialites: p.specialites ?? [],
      description: p.description ?? "",
      is_available: p.is_available, is_premium: p.is_premium,
      telephone: p.telephone ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce prestataire définitivement ?")) return;
    const { error } = await supabase.from("prestataires").delete().eq("id", id);
    if (error) setMsg({ type: "err", text: error.message });
    else { setMsg({ type: "ok", text: "Prestataire supprimé." }); load(); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const resetForm = () => { setForm(emptyForm(categories)); setEditId(null); };

  const filtered = prestataires.filter(p =>
    `${p.nom} ${p.categorie}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-base font-bold" style={{ color: "var(--muted)" }}>Chargement...</div>
      </div>
    );
  }

  const currentPrestaId = editId ?? newPrestaIdRef.current;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.08)",
          padding: "0 40px",
          height: 68,
        }}
      >
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Connect Event" className="h-16 md:h-20 w-auto object-contain" />
          </a>
          <div className="text-xs font-extrabold px-3 py-1 rounded-full"
            style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
            🔐 Admin
          </div>
        </div>
        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-3">
          <a href="/admin/tags"
            className="text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            🏷️ Sous-cat.
          </a>
          <a href="/admin/categories"
            className="text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            📂 Catégories
          </a>
          <a href="/admin/utilisateurs"
            className="text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            👥 Utilisateurs
          </a>
          <a href="/admin/messages"
            className="text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            💬 Messages
          </a>
          <a href="/admin/avis"
            className="text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            ⭐ Avis
          </a>
          <a href="/"
            className="text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: "var(--bg2)", color: "var(--muted)" }}>
            ← Site
          </a>
          <button
            onClick={handleLogout}
            className="text-xs font-extrabold px-4 py-2 rounded-full text-white cursor-pointer transition-all"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            Déconnexion
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden relative" ref={mobileMenuRef}>
          <button
            onClick={() => setShowMobileMenu(m => !m)}
            aria-label="Menu"
            className="flex flex-col items-center justify-center gap-[5px] cursor-pointer rounded-xl transition-all"
            style={{
              width: 40, height: 40,
              background: showMobileMenu ? "rgba(74,108,247,0.08)" : "var(--bg2)",
              border: showMobileMenu ? "1.5px solid rgba(74,108,247,0.35)" : "1.5px solid var(--border)",
            }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ width:16, height:2, background: showMobileMenu ? "var(--blue2)" : "var(--muted)", borderRadius:2, display:"block" }} />
            ))}
          </button>
          {showMobileMenu && (
            <div className="absolute right-0 rounded-2xl overflow-hidden z-50"
              style={{ top: "calc(100% + 8px)", background: "white", border: "1px solid var(--border)", boxShadow: "0 12px 40px rgba(74,108,247,0.18)", minWidth: 200 }}>
              {[
                { href: "/admin/tags", label: "🏷️ Sous-catégories" },
                { href: "/admin/categories", label: "📂 Catégories" },
                { href: "/admin/utilisateurs", label: "👥 Utilisateurs" },
                { href: "/admin/messages", label: "💬 Messages" },
                { href: "/admin/avis", label: "⭐ Avis" },
                { href: "/", label: "← Site" },
              ].map((item, i, arr) => (
                <a key={item.href} href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                  style={{ color: "var(--text)", textDecoration: "none", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {item.label}
                </a>
              ))}
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-extrabold w-full text-left cursor-pointer transition-all"
                style={{ color: "#dc2626", background: "transparent", border: "none", borderTop: "1px solid var(--border)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                🚪 Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="font-black text-3xl mb-1"
            style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Tableau de bord{" "}
            <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Admin
            </span>
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            Gérez les prestataires, catégories, tags et messages
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Prestataires", value: prestataires.length, icon: "🎵", color: "var(--blue2)", bg: "rgba(74,108,247,0.08)" },
            { label: "Premium", value: stats.premium, icon: "⭐", color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
            { label: "Clients", value: stats.users, icon: "👥", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
            { label: "Non lus", value: stats.messages, icon: "📨", color: "#d97706", bg: "rgba(217,119,6,0.08)" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div className="font-black text-3xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* User growth chart */}
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
          <h2 className="font-black text-base mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Nouveaux clients — 14 derniers jours
          </h2>
          <p className="text-xs font-semibold mb-4" style={{ color: "var(--muted)" }}>
            {userProfiles.filter(p => {
              const d = new Date(); d.setDate(d.getDate() - 14);
              return new Date(p.created_at) >= d;
            }).length} inscriptions sur la période
          </p>
          <UserGrowthChart profiles={userProfiles} />
        </div>

        {/* Flash message */}
        {msg && (
          <div className="mb-6 px-5 py-3 rounded-xl text-sm font-bold"
            style={{
              background: msg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1.5px solid ${msg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              color: msg.type === "ok" ? "#16a34a" : "#dc2626",
            }}>
            {msg.type === "ok" ? "✓" : "✕"} {msg.text}
          </div>
        )}

        {/* Lien à envoyer au prestataire */}
        {createdLink && (
          <div className="mb-6 rounded-2xl p-5"
            style={{ background: "rgba(74,108,247,0.05)", border: "2px solid rgba(74,108,247,0.25)" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-extrabold text-sm mb-1" style={{ color: "var(--blue2)" }}>
                  🔗 Lien à envoyer au prestataire
                </p>
                <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                  En cliquant sur ce lien, ils s&apos;inscrivent et deviennent automatiquement pro.
                </p>
              </div>
              <button
                onClick={() => setCreatedLink(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, lineHeight: 1 }}
              >✕</button>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <code className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl break-all"
                style={{ background: "white", border: "1.5px solid var(--border)", color: "var(--dark)", minWidth: 0 }}>
                {createdLink}
              </code>
              <button
                onClick={() => { navigator.clipboard.writeText(createdLink!); }}
                className="text-xs font-extrabold px-4 py-2 rounded-xl cursor-pointer text-white flex-shrink-0"
                style={{ background: "var(--grad2)" }}
              >
                📋 Copier
              </button>
              <a
                href={`mailto:?subject=${encodeURIComponent("Votre invitation prestataire — Connect Event")}&body=${encodeURIComponent(
                  `Bonjour,\n\nVous avez été invité(e) à rejoindre Connect Event en tant que prestataire événementiel.\n\nCliquez sur le lien ci-dessous pour créer votre compte et configurer votre profil :\n\n${createdLink}\n\nCe lien est valable 90 jours.\n\nÀ très bientôt,\nL'équipe Connect Event\nwww.connect-event.be`
                )}`}
                className="text-xs font-extrabold px-4 py-2 rounded-xl text-white flex-shrink-0 flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", textDecoration: "none", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}
              >
                📧 Envoyer par mail
              </a>
            </div>
          </div>
        )}

        {/* ── Lien d'invitation (sans fiche) ── */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <button
            onClick={async () => {
              const res = await fetch("/api/admin/generate-invite-link", { method: "POST" });
              const json = await res.json();
              if (json.token_id) {
                const link = `${window.location.origin}/claim/${json.token_id}`;
                navigator.clipboard.writeText(link);
                setCreatedLink(link);
              }
            }}
            className="flex items-center gap-2 text-sm font-extrabold px-5 py-2.5 rounded-xl cursor-pointer text-white transition-all"
            style={{ background: "linear-gradient(135deg, #4A6CF7, #D93FB5)", boxShadow: "0 4px 14px rgba(74,108,247,0.3)" }}
          >
            ✉️ Générer un lien d&apos;invitation prestataire
          </button>
          <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
            Le prestataire créera lui-même sa fiche après inscription.
          </p>
        </div>

        {/* ── Grid : Form + Table ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">

          {/* ─── Formulaire ─── */}
          <div className="rounded-2xl"
            style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)", padding: "28px" }}>
            <h2 className="font-black text-xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              {editId ? "✏️ Modifier" : "➕ Ajouter"} un prestataire
            </h2>
            <p className="text-xs font-semibold mb-6" style={{ color: "var(--muted)" }}>
              Remplis les champs puis enregistre.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div>
                <Label>Nom du prestataire *</Label>
                <Input required value={form.nom} onChange={v => up("nom", v)} placeholder="Nom du prestataire" />
              </div>

              <div>
                <Label>Entreprise</Label>
                <Input value={form.company} onChange={v => up("company", v)} placeholder="Nom de l'entreprise" />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hide_company}
                    onChange={e => up("hide_company", e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: "var(--blue2)" }}
                  />
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Masquer le nom d&apos;entreprise sur le site</span>
                </label>
              </div>

              <div>
                <Label>Catégorie *</Label>
                <Select value={form.categorie} onChange={v => up("categorie", v)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>

              <div>
                <Label>Continent</Label>
                <Select value={form.continent} onChange={v => up("continent", v)}>
                  {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prix *</Label>
                  <Input required type="number" value={form.prix} onChange={v => up("prix", v)} placeholder="600" />
                </div>
                <div>
                  <Label>Note prix</Label>
                  <Input value={form.price_note} onChange={v => up("price_note", v)} placeholder="/ soirée" />
                </div>
              </div>

              <div>
                <Label>Disponibilité</Label>
                <Select value={form.is_available ? "true" : "false"} onChange={v => up("is_available", v === "true")}>
                  <option value="true">Disponible</option>
                  <option value="false">Limité</option>
                </Select>
              </div>

              {/* Premium */}
              <div className="rounded-xl p-4"
                style={{ background: form.is_premium ? "rgba(74,108,247,0.06)" : "var(--bg)", border: "1.5px solid var(--border)" }}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_premium}
                    onChange={e => up("is_premium", e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: "var(--blue2)" }}
                  />
                  <span className="text-sm font-extrabold" style={{ color: "var(--dark)" }}>Premium (téléphone visible)</span>
                </label>
                {form.is_premium && (
                  <div className="mt-3">
                    <Label>Téléphone</Label>
                    <Input value={form.telephone} onChange={v => up("telephone", v)} placeholder="+32 4 12 34 56 78" type="tel" />
                  </div>
                )}
              </div>

              {/* Photos */}
              <div>
                <Label>Photos</Label>
                <AdminPhotoUpload
                  images={form.images}
                  onChange={imgs => up("images", imgs)}
                  prestataireId={currentPrestaId}
                />
              </div>

              {/* Sous-catégories */}
              <div>
                <Label>Sous-catégories</Label>
                {availableTags.length === 0 ? (
                  <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    Aucune sous-catégorie — <a href="/admin/tags" style={{ color: "var(--blue2)" }}>Admin › Sous-cat.</a>
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {availableTags.map(tag => {
                      const isOn = form.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => up("tags", isOn ? form.tags.filter(t => t !== tag) : [...form.tags, tag])}
                          className="text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all"
                          style={{
                            background: isOn ? "rgba(74,108,247,0.12)" : "var(--bg)",
                            color: isOn ? "var(--blue2)" : "var(--muted)",
                            border: isOn ? "1.5px solid rgba(74,108,247,0.35)" : "1.5px solid var(--border)",
                          }}
                        >
                          {isOn ? "✓ " : ""}{tag}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Spécialités (tags libres) */}
              <div>
                <Label>Spécialités</Label>
                {availableSpecialites.length === 0 ? (
                  <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    Aucune spécialité — ajoutez-en via <a href="/admin/tags" style={{ color: "var(--blue2)" }}>Admin › Tags libres</a>.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {availableSpecialites.map(tag => {
                      const isOn = form.specialites.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => up("specialites", isOn ? form.specialites.filter(t => t !== tag) : [...form.specialites, tag])}
                          className="text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all"
                          style={{
                            background: isOn ? "rgba(217,63,181,0.1)" : "var(--bg)",
                            color: isOn ? "var(--pink)" : "var(--muted)",
                            border: isOn ? "1.5px solid rgba(217,63,181,0.3)" : "1.5px solid var(--border)",
                          }}
                        >
                          {isOn ? "✓ " : ""}{tag}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => up("description", e.target.value)}
                  placeholder="Description du prestataire..."
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all resize-none"
                  style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 text-white font-extrabold py-3 rounded-xl cursor-pointer transition-all text-sm disabled:opacity-50"
                  style={{ background: "var(--grad)", boxShadow: "0 6px 22px rgba(217,63,181,0.3)" }}
                >
                  {saving ? "Enregistrement..." : editId ? "💾 Mettre à jour" : "💾 Enregistrer"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 font-bold text-sm rounded-xl cursor-pointer transition-all"
                    style={{ background: "var(--bg2)", color: "var(--muted)", border: "1.5px solid var(--border)" }}
                  >
                    Nouveau
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ─── Table ─── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
            <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-5"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <h2 className="font-black text-xl" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                  Gestion des prestataires
                </h2>
                <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--muted)" }}>
                  {prestataires.length} prestataire{prestataires.length > 1 ? "s" : ""} au total
                </p>
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="rounded-xl px-4 py-2 text-sm font-semibold outline-none transition-all"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)", width: 220 }}
                onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div className="overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-16" style={{ color: "var(--muted)" }}>
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-bold text-sm">
                    {prestataires.length === 0
                      ? "Aucun prestataire. Ajoutez-en un via le formulaire."
                      : "Aucun résultat pour cette recherche."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                      {["Nom", "Catégorie", "Prix", "Premium", "Dispo", "Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest"
                          style={{ color: "var(--muted)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr
                        key={p.id}
                        style={{ borderBottom: "1px solid var(--border)", background: editId === p.id ? "rgba(74,108,247,0.04)" : "white" }}
                        onMouseEnter={e => { if (editId !== p.id) (e.currentTarget as HTMLElement).style.background = "var(--bg)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = editId === p.id ? "rgba(74,108,247,0.04)" : "white"; }}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {p.images?.[0] && (
                              <img src={p.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                style={{ border: "1px solid var(--border)" }} />
                            )}
                            <div>
                              <div className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>{p.nom}</div>
                              {p.company && !p.hide_company && (
                                <div className="text-[11px] font-semibold" style={{ color: "var(--muted)" }}>{p.company}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                            style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
                            {p.categorie}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-extrabold text-sm" style={{ color: "var(--dark)" }}>
                          {p.prix} €
                          {p.price_note && (
                            <span className="font-semibold ml-1 text-[11px]" style={{ color: "var(--muted)" }}>
                              {p.price_note}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span style={{ fontSize: 16 }}>{p.is_premium ? "⭐" : "—"}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                            style={{
                              background: p.is_available ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                              color: p.is_available ? "#16a34a" : "#dc2626",
                            }}>
                            {p.is_available ? "Dispo" : "Limité"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(p)}
                              className="text-[11px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                              style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)", border: "1px solid rgba(74,108,247,0.2)" }}>
                              ✏️ Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="text-[11px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                              style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}>
                              🗑️ Supp.
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
