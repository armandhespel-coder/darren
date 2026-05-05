"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Demande {
  id: string;
  prestataire_id: string | null;
  nom: string;
  email: string;
  telephone: string | null;
  contenu: string;
  lu: boolean;
  created_at: string;
  prestataire_nom?: string;
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDemandesPage() {
  const router = useRouter();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [active, setActive] = useState<Demande | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyResult, setReplyResult] = useState<"ok" | "err" | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { data } = await supabase
      .from("demandes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data?.length) { setLoading(false); return; }

    const prestaIds = [...new Set(data.map((d: Demande) => d.prestataire_id).filter(Boolean))] as string[];
    const { data: prestas } = prestaIds.length
      ? await supabase.from("prestataires").select("id, nom").in("id", prestaIds)
      : { data: [] };

    const prestaMap: Record<string, string> = {};
    (prestas ?? []).forEach((p: { id: string; nom: string }) => { prestaMap[p.id] = p.nom; });

    const enriched = data.map((d: Demande) => ({
      ...d,
      prestataire_nom: d.prestataire_id ? (prestaMap[d.prestataire_id] ?? "") : "",
    }));

    setDemandes(enriched);
    setActive(enriched[0] ?? null);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const markLu = useCallback(async (d: Demande) => {
    if (d.lu) return;
    const supabase = createClient();
    await supabase.from("demandes").update({ lu: true }).eq("id", d.id);
    setDemandes(ds => ds.map(x => x.id === d.id ? { ...x, lu: true } : x));
    setActive(a => a?.id === d.id ? { ...a, lu: true } : a);
  }, []);

  const openDemande = useCallback((d: Demande) => {
    setActive(d);
    markLu(d);
    setReplyText("");
    setReplyResult(null);
  }, [markLu]);

  const sendReply = async () => {
    if (!active || !replyText.trim()) return;
    setReplySending(true);
    setReplyResult(null);
    try {
      const res = await fetch("/api/admin/forward-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: active.email,
          subject: active.prestataire_nom
            ? `Votre demande pour ${active.prestataire_nom} — Connect Event`
            : "Votre demande — Connect Event",
          body: replyText.trim(),
        }),
      });
      setReplyResult(res.ok ? "ok" : "err");
      if (res.ok) setReplyText("");
    } catch {
      setReplyResult("err");
    }
    setReplySending(false);
  };

  const deleteDemande = async () => {
    if (!active) return;
    if (!confirm(`Supprimer la demande de ${active.nom} ?`)) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("demandes").delete().eq("id", active.id);
    const updated = demandes.filter(d => d.id !== active.id);
    setDemandes(updated);
    setActive(updated[0] ?? null);
    setDeleting(false);
  };

  const filtered = demandes.filter(d =>
    d.nom.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    (d.prestataire_nom ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const unread = demandes.filter(d => !d.lu).length;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.08)",
          padding: "0 40px",
          height: 68,
        }}>
        <div className="flex items-center gap-4">
          <a href="/"><img src="/logo.png" alt="Connect Event" className="h-16 w-auto object-contain" /></a>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full"
            style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
            🔐 Admin · Demandes
          </span>
        </div>
        <a href="/admin" className="text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
          ← Admin
        </a>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-black text-3xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Demandes clients
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            {demandes.length} demande{demandes.length !== 1 ? "s" : ""}
            {unread > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-extrabold"
                style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
                {unread} non lu{unread > 1 ? "es" : "e"}
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 items-start">
          {/* Liste */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full rounded-xl px-4 py-2 text-sm font-semibold outline-none"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")} />
            </div>

            {loading ? (
              <div className="py-12 text-center" style={{ color: "var(--muted)" }}>
                <p className="font-bold text-sm">Chargement…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center" style={{ color: "var(--muted)" }}>
                <div className="text-4xl mb-3">📋</div>
                <p className="font-bold text-sm">Aucune demande.</p>
              </div>
            ) : (
              <div style={{ maxHeight: 520, overflowY: "auto" }}>
                {filtered.map(d => (
                  <button key={d.id} onClick={() => openDemande(d)}
                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: active?.id === d.id ? "rgba(74,108,247,0.05)" : "transparent",
                    }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black text-white flex-shrink-0"
                      style={{ background: d.lu ? "var(--muted)" : "var(--grad)" }}>
                      {d.nom[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-extrabold text-[11px] truncate" style={{ color: d.lu ? "var(--muted)" : "var(--dark)" }}>
                          {d.nom}
                        </span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: "var(--muted)" }}>
                          {timeAgo(d.created_at)}
                        </span>
                      </div>
                      {d.prestataire_nom && (
                        <div className="text-[10px] font-extrabold mb-0.5" style={{ color: "var(--blue2)" }}>
                          → {d.prestataire_nom}
                        </div>
                      )}
                      <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{d.contenu}</p>
                    </div>
                    {!d.lu && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ background: "var(--blue2)" }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détail */}
          {active ? (
            <div className="rounded-2xl"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              {/* En-tête client */}
              <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-black text-white flex-shrink-0"
                      style={{ background: "var(--grad)" }}>
                      {active.nom[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div className="font-black text-base" style={{ color: "var(--dark)" }}>{active.nom}</div>
                      <a href={`mailto:${active.email}`}
                        className="text-xs font-semibold hover:underline" style={{ color: "var(--blue2)" }}>
                        {active.email}
                      </a>
                    </div>
                  </div>
                  <button onClick={deleteDemande} disabled={deleting}
                    title="Supprimer"
                    className="flex items-center justify-center rounded-full cursor-pointer transition-all disabled:opacity-50 flex-shrink-0"
                    style={{ width: 36, height: 36, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {active.telephone && (
                    <a href={`tel:${active.telephone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold"
                      style={{ background: "rgba(74,108,247,0.07)", border: "1.5px solid rgba(74,108,247,0.2)", color: "var(--blue2)", textDecoration: "none" }}>
                      📞 {active.telephone}
                    </a>
                  )}
                  {active.prestataire_nom && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold"
                      style={{ background: "rgba(217,63,181,0.07)", border: "1.5px solid rgba(217,63,181,0.2)", color: "var(--pink)" }}>
                      🎵 {active.prestataire_nom}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                    {timeAgo(active.created_at)}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="px-6 py-5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
                  Message
                </div>
                <div className="rounded-xl p-4 text-sm font-semibold whitespace-pre-line leading-relaxed"
                  style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}>
                  {active.contenu}
                </div>

                <div className="mt-5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                    Répondre à {active.nom}
                  </div>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={4}
                    placeholder={`Bonjour ${active.nom.split(" ")[0]},\n\n`}
                    className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none resize-none"
                    style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                    onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")}
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={sendReply}
                      disabled={replySending || !replyText.trim()}
                      className="px-5 py-2.5 rounded-full text-sm font-extrabold text-white cursor-pointer disabled:opacity-50"
                      style={{ background: "var(--grad2)" }}
                    >
                      {replySending ? "Envoi…" : "↩ Envoyer"}
                    </button>
                    {active.telephone && (
                      <a href={`tel:${active.telephone}`}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-extrabold"
                        style={{ background: "var(--bg2)", color: "var(--dark)", border: "1px solid var(--border)", textDecoration: "none" }}>
                        📞 Appeler
                      </a>
                    )}
                    {replyResult === "ok" && (
                      <span className="text-sm font-extrabold" style={{ color: "#16a34a" }}>✓ Envoyé !</span>
                    )}
                    {replyResult === "err" && (
                      <span className="text-sm font-extrabold" style={{ color: "#dc2626" }}>Erreur envoi</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl flex items-center justify-center"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)", minHeight: 400 }}>
              <div className="text-center" style={{ color: "var(--muted)" }}>
                <div className="text-4xl mb-3">📋</div>
                <p className="font-bold text-sm">Sélectionnez une demande</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
