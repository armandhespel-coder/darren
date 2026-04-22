"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface MsgRow {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  prestataire_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
  sender_email?: string;
  presta_nom?: string;
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<MsgRow | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!msgs?.length) { setLoading(false); return; }

    const senderIds = [...new Set(msgs.map((m) => m.sender_id))];
    const prestaIds = [...new Set(msgs.map((m) => m.prestataire_id).filter(Boolean))];

    const [{ data: profiles }, { data: prestas }] = await Promise.all([
      supabase.from("profiles").select("id, email").in("id", senderIds),
      prestaIds.length
        ? supabase.from("prestataires").select("id, nom").in("id", prestaIds)
        : Promise.resolve({ data: [] }),
    ]);

    const profMap: Record<string, string> = {};
    (profiles ?? []).forEach((p) => { profMap[p.id] = p.email; });
    const prestaMap: Record<string, string> = {};
    (prestas ?? []).forEach((p: { id: string; nom: string }) => { prestaMap[p.id] = p.nom; });

    const enriched = msgs.map((m) => ({
      ...m,
      sender_email: profMap[m.sender_id] ?? "Inconnu",
      presta_nom: m.prestataire_id ? prestaMap[m.prestataire_id] ?? "—" : "—",
    }));

    setMessages(enriched);
    if (enriched.length) setActive(enriched[0]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = messages.filter((m) =>
    `${m.sender_email} ${m.presta_nom} ${m.content}`.toLowerCase().includes(search.toLowerCase())
  );

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
            🔐 Admin · Messages
          </span>
        </div>
        <a href="/admin" className="text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: "var(--bg2)", color: "var(--muted)" }}>
          ← Admin
        </a>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-black text-3xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Messages
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            Tous les messages échangés sur la plateforme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4 items-start">
          {/* List */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full rounded-xl px-4 py-2 text-sm font-semibold outline-none"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {loading ? (
              <div className="py-12 text-center" style={{ color: "var(--muted)" }}>
                <p className="font-bold text-sm">Chargement...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center" style={{ color: "var(--muted)" }}>
                <div className="text-4xl mb-3">💬</div>
                <p className="font-bold text-sm">Aucun message.</p>
              </div>
            ) : (
              <div style={{ maxHeight: 600, overflowY: "auto" }}>
                {filtered.map((m) => (
                  <button key={m.id} onClick={() => setActive(m)}
                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: active?.id === m.id ? "rgba(74,108,247,0.05)" : "transparent",
                    }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                      style={{ background: "var(--grad)" }}>
                      {(m.sender_email?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-[11px] truncate" style={{ color: "var(--dark)" }}>
                          {m.sender_email}
                        </span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: "var(--muted)" }}>
                          {timeAgo(m.created_at)}
                        </span>
                      </div>
                      {m.presta_nom !== "—" && (
                        <div className="text-[10px] font-extrabold mb-0.5" style={{ color: "var(--blue2)" }}>
                          → {m.presta_nom}
                        </div>
                      )}
                      <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{m.content}</p>
                    </div>
                    {!m.read && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "var(--blue2)" }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          {active && (
            <div className="rounded-2xl p-6"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
              <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
                  style={{ background: "var(--grad)" }}>
                  {(active.sender_email?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <div className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>{active.sender_email}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>{timeAgo(active.created_at)}</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {active.presta_nom !== "—" && (
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
                      {active.presta_nom}
                    </span>
                  )}
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                    style={{
                      background: active.read ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                      color: active.read ? "#16a34a" : "#d97706",
                    }}>
                    {active.read ? "Lu" : "Non lu"}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{active.content}</p>
              <div className="mt-4 pt-4 grid grid-cols-2 gap-3 text-[11px] font-semibold"
                style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
                <div>
                  <span className="font-extrabold uppercase tracking-wider text-[9px] block mb-0.5" style={{ color: "var(--blue2)" }}>
                    Expéditeur ID
                  </span>
                  {active.sender_id.slice(0, 12)}...
                </div>
                {active.prestataire_id && (
                  <div>
                    <span className="font-extrabold uppercase tracking-wider text-[9px] block mb-0.5" style={{ color: "var(--blue2)" }}>
                      Prestataire ID
                    </span>
                    {active.prestataire_id.slice(0, 12)}...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
