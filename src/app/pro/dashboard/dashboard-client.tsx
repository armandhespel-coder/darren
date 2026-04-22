"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Prestataire } from "@/types";

interface Props {
  prestataire: Prestataire;
  userEmail: string;
  msgCount: number;
  unreadCount: number;
}

function completionScore(p: Prestataire) {
  const checks = [
    p.images?.length >= 3,
    (p.description?.length ?? 0) > 30,
    p.prix > 0,
    p.tags?.length >= 2,
  ];
  const done = checks.filter(Boolean).length;
  return { done, total: checks.length, pct: Math.round((done / checks.length) * 100) };
}

export default function DashboardClient({ prestataire: p, userEmail, msgCount, unreadCount }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const { done, total, pct } = completionScore(p);

  const stats = [
    { label: "Demandes reçues", value: msgCount, icon: "💬", color: "var(--blue2)", bg: "rgba(74,108,247,0.08)" },
    { label: "Non lues", value: unreadCount, icon: "🔔", color: "#d97706", bg: "rgba(217,119,6,0.08)" },
    { label: "Profil complété", value: `${pct}%`, icon: "✨", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
    { label: "Statut", value: p.is_premium ? "Premium" : "Standard", icon: p.is_premium ? "⭐" : "○", color: p.is_premium ? "#7c3aed" : "var(--muted)", bg: p.is_premium ? "rgba(124,58,237,0.08)" : "var(--bg2)" },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.08)",
          height: 68,
        }}>
        <div className="flex items-center gap-3">
          <a href="/"><img src="/logo.png" alt="Connect Event" className="h-14 w-auto object-contain" /></a>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full"
            style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
            Espace Pro
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href={`/p/${p.id}`} target="_blank"
            className="text-xs font-bold px-4 py-2 rounded-full"
            style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            Voir ma fiche →
          </a>
          <button onClick={handleLogout}
            className="text-xs font-extrabold px-4 py-2 rounded-full text-white cursor-pointer"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                  { lbl: "2+ tags", done: p.tags?.length >= 2 },
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

            {/* Quick actions */}
            <div className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <h2 className="font-black text-lg mb-4" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                Actions rapides
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  { href: `/p/edit/${p.id}`, icon: "✏️", label: "Modifier mon profil", sub: "Photos, description, disponibilités" },
                  { href: "/pro/demandes", icon: "💬", label: "Voir mes demandes", sub: `${msgCount} message${msgCount > 1 ? "s" : ""} reçu${msgCount > 1 ? "s" : ""}` },
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
          </div>

          {/* Right — profile preview */}
          <div className="rounded-2xl p-6"
            style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
            <h2 className="font-black text-lg mb-4" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              Aperçu de votre fiche
            </h2>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div className="relative aspect-video"
                style={{ background: p.images?.[0] ? undefined : "var(--dark2)" }}>
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
                )}
                <span className="absolute top-2 left-2 text-[10px] font-extrabold px-2 py-1 rounded-full text-white"
                  style={{ background: "rgba(74,108,247,0.85)" }}>
                  {p.categorie}
                </span>
              </div>
              <div className="p-4">
                <div className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>{p.nom}</div>
                {p.company && <div className="text-xs" style={{ color: "var(--muted)" }}>{p.company}</div>}
                <div className="font-black text-lg mt-1" style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {p.prix} €
                  {p.price_note && <span className="text-xs font-semibold" style={{ WebkitTextFillColor: "var(--muted)" }}> {p.price_note}</span>}
                </div>
                {p.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(74,108,247,0.08)", color: "var(--blue2)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {!p.is_premium && (
              <div className="mt-4 p-4 rounded-xl text-center"
                style={{ background: "rgba(124,58,237,0.06)", border: "1.5px solid rgba(124,58,237,0.2)" }}>
                <div className="text-lg mb-1">⭐</div>
                <p className="text-xs font-extrabold mb-1" style={{ color: "#7c3aed" }}>Passez Premium</p>
                <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                  Affichez votre téléphone et recevez des appels directs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
