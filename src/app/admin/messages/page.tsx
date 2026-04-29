"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Msg {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  prestataire_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  key: string;
  partnerId: string;
  partnerEmail: string;
  messages: Msg[];
  unread: number;
  lastTime: string;
  prestaNom: string;
  prestaEmail: string;
}

interface FwdState {
  to: string;
  from: string;
  subject: string;
  body: string;
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fwdOpen, setFwdOpen] = useState(false);
  const [fwd, setFwd] = useState<FwdState>({ to: "", from: "contact@connect-event.be", subject: "", body: "" });
  const [fwdSending, setFwdSending] = useState(false);
  const [fwdResult, setFwdResult] = useState<"ok" | "err" | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setAdminId(user.id);

    const { data: msgs } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
    if (!msgs?.length) { setLoading(false); return; }

    const unreadIds = (msgs as Msg[]).filter(m => !m.read && m.sender_id !== user.id).map(m => m.id);
    if (unreadIds.length > 0) {
      await supabase.from("messages").update({ read: true }).in("id", unreadIds);
      (msgs as Msg[]).forEach(m => { if (unreadIds.includes(m.id)) m.read = true; });
    }

    const partnerIds = [...new Set(msgs.flatMap((m: Msg) => {
      if (m.sender_id === user.id) return m.receiver_id ? [m.receiver_id] : [];
      return [m.sender_id];
    }))].filter(Boolean);

    const prestaIds = [...new Set(msgs.map((m: Msg) => m.prestataire_id).filter(Boolean))];

    const [{ data: profiles }, { data: prestas }] = await Promise.all([
      partnerIds.length ? supabase.from("profiles").select("id, email").in("id", partnerIds) : Promise.resolve({ data: [] }),
      prestaIds.length ? supabase.from("prestataires").select("id, nom, email, owner_id").in("id", prestaIds) : Promise.resolve({ data: [] }),
    ]);

    const profMap: Record<string, string> = {};
    (profiles ?? []).forEach((p: { id: string; email: string }) => { profMap[p.id] = p.email; });

    const ownerIds = [...new Set((prestas ?? []).map((p: { owner_id?: string }) => p.owner_id).filter(Boolean))] as string[];
    const { data: ownerProfiles } = ownerIds.length
      ? await supabase.from("profiles").select("id, email").in("id", ownerIds)
      : { data: [] };
    const ownerMap: Record<string, string> = {};
    (ownerProfiles ?? []).forEach((p: { id: string; email: string }) => { ownerMap[p.id] = p.email; });

    const prestaMap: Record<string, string> = {};
    const prestaEmailMap: Record<string, string> = {};
    (prestas ?? []).forEach((p: { id: string; nom: string; email?: string | null; owner_id?: string }) => {
      prestaMap[p.id] = p.nom;
      prestaEmailMap[p.id] = p.email ?? profMap[p.owner_id ?? ""] ?? ownerMap[p.owner_id ?? ""] ?? "";
    });

    // Group by client + prestataire so each request is a separate conversation
    const convMap = new Map<string, Conversation>();
    for (const msg of msgs as Msg[]) {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!partnerId || partnerId === user.id) continue;

      const convKey = msg.prestataire_id ? `${partnerId}-${msg.prestataire_id}` : partnerId;

      if (!convMap.has(convKey)) {
        convMap.set(convKey, {
          key: convKey,
          partnerId,
          partnerEmail: profMap[partnerId] ?? "Inconnu",
          messages: [],
          unread: 0,
          lastTime: msg.created_at,
          prestaNom: msg.prestataire_id ? (prestaMap[msg.prestataire_id] ?? "") : "",
          prestaEmail: msg.prestataire_id ? (prestaEmailMap[msg.prestataire_id] ?? "") : "",
        });
      }
      const conv = convMap.get(convKey)!;
      conv.messages.push(msg);
      if (msg.created_at > conv.lastTime) conv.lastTime = msg.created_at;
      if (!msg.read && msg.sender_id !== user.id) conv.unread++;
    }

    const list = [...convMap.values()].sort((a, b) => b.lastTime.localeCompare(a.lastTime));
    setConversations(list);
    setActive(prev => {
      if (prev) {
        const updated = list.find(c => c.key === prev.key);
        return updated ?? list[0] ?? null;
      }
      return list[0] ?? null;
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length]);

  const openConv = useCallback(async (conv: Conversation) => {
    setActive(conv);
    if (conv.unread > 0) {
      const supabase = createClient();
      const ids = conv.messages.filter(m => !m.read).map(m => m.id);
      if (ids.length) await supabase.from("messages").update({ read: true }).in("id", ids);
      setConversations(cs => cs.map(c =>
        c.key === conv.key ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c
      ));
      setActive(a => a?.key === conv.key
        ? { ...a, unread: 0, messages: a.messages.map(m => ({ ...m, read: true })) }
        : a
      );
    }
  }, []);

  const openForward = useCallback(() => {
    if (!active) return;
    const clientMsgs = active.messages.filter(m => m.sender_id !== adminId);
    const lastClient = clientMsgs[clientMsgs.length - 1]?.content ?? "";
    setFwd({
      to: active.prestaEmail,
      from: "contact@connect-event.be",
      subject: active.prestaNom ? `Demande client — ${active.prestaNom}` : "Demande client via Connect Event",
      body: `Bonjour,\n\nUn client vous a contacté via Connect Event.\n\nClient : ${active.partnerEmail}\n\n---\n\n${lastClient}\n\n---\n\nCordialement,\nL'équipe Connect Event`,
    });
    setFwdResult(null);
    setFwdOpen(true);
  }, [active, adminId]);

  const sendForward = async () => {
    if (!fwd.to || !fwd.body) return;
    setFwdSending(true);
    setFwdResult(null);
    try {
      const res = await fetch("/api/admin/forward-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fwd),
      });
      setFwdResult(res.ok ? "ok" : "err");
      if (res.ok) setTimeout(() => setFwdOpen(false), 1500);
    } catch {
      setFwdResult("err");
    }
    setFwdSending(false);
  };

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !active || !adminId) return;
    setSending(true);
    const supabase = createClient();
    const { data: newMsg, error } = await supabase.from("messages").insert({
      sender_id: adminId,
      receiver_id: active.partnerId,
      prestataire_id: active.messages[0]?.prestataire_id ?? null,
      content: text,
      read: false,
    }).select().single();

    if (!error && newMsg) {
      const updated = { ...active, messages: [...active.messages, newMsg as Msg], lastTime: (newMsg as Msg).created_at };
      setActive(updated);
      setConversations(cs => cs.map(c => c.key === active.key ? updated : c));
      setReply("");
    }
    setSending(false);
  };

  const deleteConversation = async () => {
    if (!active || !adminId) return;
    if (!confirm(`Supprimer cette conversation avec ${active.partnerEmail} ?`)) return;
    setDeleting(true);
    const supabase = createClient();
    const ids = active.messages.map(m => m.id);
    await supabase.from("messages").delete().in("id", ids);
    const updated = conversations.filter(c => c.key !== active.key);
    setConversations(updated);
    setActive(updated[0] ?? null);
    setDeleting(false);
  };

  const filtered = conversations.filter(c =>
    c.partnerEmail.toLowerCase().includes(search.toLowerCase()) ||
    c.prestaNom.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all";
  const inputStyle = { background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Forward modal */}
      {fwdOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setFwdOpen(false); }}
        >
          <div className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: "white", boxShadow: "0 30px 80px rgba(0,0,0,0.25)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="font-black text-base" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                📧 Transmettre par email
              </h2>
              <button onClick={() => setFwdOpen(false)}
                className="rounded-xl flex items-center justify-center cursor-pointer"
                style={{ width: 32, height: 32, background: "var(--bg2)", border: "none", color: "var(--muted)", fontSize: 18 }}>
                ×
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5" style={{ color: "var(--blue2)" }}>
                  Destinataire (À)
                </label>
                <input type="email" value={fwd.to} onChange={e => setFwd(f => ({ ...f, to: e.target.value }))}
                  className={inputCls} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5" style={{ color: "var(--blue2)" }}>
                  Expéditeur (De)
                </label>
                <input type="email" value={fwd.from} onChange={e => setFwd(f => ({ ...f, from: e.target.value }))}
                  className={inputCls} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5" style={{ color: "var(--blue2)" }}>
                  Objet
                </label>
                <input type="text" value={fwd.subject} onChange={e => setFwd(f => ({ ...f, subject: e.target.value }))}
                  className={inputCls} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5" style={{ color: "var(--blue2)" }}>
                  Message
                </label>
                <textarea value={fwd.body} onChange={e => setFwd(f => ({ ...f, body: e.target.value }))}
                  rows={7} className={inputCls + " resize-none"} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")} />
              </div>
              {fwdResult === "ok" && <p className="text-sm font-extrabold text-center" style={{ color: "#16a34a" }}>✓ Email envoyé !</p>}
              {fwdResult === "err" && <p className="text-sm font-extrabold text-center" style={{ color: "#dc2626" }}>Erreur lors de l'envoi.</p>}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setFwdOpen(false)}
                className="text-sm font-bold px-4 py-2 rounded-full cursor-pointer"
                style={{ background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                Annuler
              </button>
              <button onClick={sendForward} disabled={fwdSending || !fwd.to || !fwd.body}
                className="text-white text-sm font-extrabold px-5 py-2 rounded-full cursor-pointer disabled:opacity-50"
                style={{ background: "var(--grad2)", border: "none", boxShadow: "0 4px 14px rgba(74,108,247,0.25)" }}>
                {fwdSending ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}

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
          style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
          ← Admin
        </a>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-black text-3xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Conversations
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            {conversations.length} demande{conversations.length !== 1 ? "s" : ""}
            {conversations.some(c => c.unread > 0) && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-extrabold"
                style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
                {conversations.reduce((s, c) => s + c.unread, 0)} non lu{conversations.reduce((s, c) => s + c.unread, 0) > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 items-start">
          {/* ── Conversation list ── */}
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
                <div className="text-4xl mb-3">💬</div>
                <p className="font-bold text-sm">Aucune demande.</p>
              </div>
            ) : (
              <div style={{ maxHeight: 520, overflowY: "auto" }}>
                {filtered.map(conv => (
                  <button key={conv.key} onClick={() => openConv(conv)}
                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: active?.key === conv.key ? "rgba(74,108,247,0.05)" : "transparent",
                    }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black text-white flex-shrink-0"
                      style={{ background: "var(--grad)" }}>
                      {(conv.partnerEmail[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-extrabold text-[11px] truncate" style={{ color: "var(--dark)" }}>
                          {conv.partnerEmail}
                        </span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: "var(--muted)" }}>
                          {timeAgo(conv.lastTime)}
                        </span>
                      </div>
                      {conv.prestaNom && (
                        <div className="text-[10px] font-extrabold mb-0.5" style={{ color: "var(--blue2)" }}>
                          → {conv.prestaNom}
                        </div>
                      )}
                      <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                        {conv.messages[conv.messages.length - 1]?.content ?? ""}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full text-[10px] font-black text-white flex items-center justify-center"
                        style={{ background: "var(--blue2)", marginTop: 2 }}>
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Thread ── */}
          {active ? (
            <div className="rounded-2xl flex flex-col"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)", minHeight: 480 }}>
              {/* Thread header */}
              <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                {/* Client info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ background: "var(--grad)" }}>
                    {(active.partnerEmail[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: "var(--muted)" }}>Client</div>
                    <div className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>{active.partnerEmail}</div>
                  </div>
                </div>

                {/* Presta + actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {active.prestaNom && (
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full"
                      style={{ background: "rgba(74,108,247,0.08)", color: "var(--blue2)", border: "1px solid rgba(74,108,247,0.15)" }}>
                      📋 {active.prestaNom}
                    </span>
                  )}
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-full"
                    style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                    {active.messages.length} message{active.messages.length !== 1 ? "s" : ""}
                  </span>

                  <div className="flex-1" />

                  {/* Transmettre — même style que boutons nav admin */}
                  <button onClick={openForward}
                    className="text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer"
                    style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--blue2)"; e.currentTarget.style.borderColor = "rgba(74,108,247,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                    📧 Transmettre
                  </button>

                  <button onClick={deleteConversation} disabled={deleting}
                    title="Supprimer la conversation"
                    className="flex items-center justify-center rounded-full cursor-pointer transition-all disabled:opacity-50"
                    style={{ width: 36, height: 36, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3" style={{ maxHeight: 360 }}>
                {active.messages.map(m => {
                  const isAdmin = m.sender_id === adminId;
                  const phoneLine = m.content.split("\n").find(l => l.startsWith("📞"));
                  const phone = phoneLine?.replace("📞 Téléphone : ", "").trim();

                  return (
                    <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div style={{ maxWidth: "80%" }}>
                        {!isAdmin && phone && (
                          <a href={`tel:${phone}`}
                            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl text-xs font-extrabold"
                            style={{ background: "rgba(74,108,247,0.07)", border: "1.5px solid rgba(74,108,247,0.2)", color: "var(--blue2)", textDecoration: "none" }}>
                            📞 {phone}
                          </a>
                        )}
                        <div className="px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-pre-line"
                          style={isAdmin ? {
                            background: "var(--grad2)", color: "white", borderBottomRightRadius: 6,
                          } : {
                            background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderBottomLeftRadius: 6,
                          }}>
                          {m.content}
                        </div>
                        <div className="flex items-center gap-2 mt-1"
                          style={{ justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                          <span className="text-[10px]" style={{ color: "var(--muted)" }}>{timeAgo(m.created_at)}</span>
                          {!isAdmin && (
                            <span className="text-[10px] font-extrabold" style={{ color: m.read ? "#16a34a" : "#d97706" }}>
                              {m.read ? "✓ Lu" : "Non lu"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply */}
              <div className="px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex gap-3 items-end">
                  <textarea value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder="Répondre… (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
                    rows={2}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all resize-none"
                    style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                    onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                  <button onClick={sendReply} disabled={sending || !reply.trim()}
                    className="text-white text-sm font-extrabold px-5 py-2.5 rounded-full cursor-pointer disabled:opacity-50 flex-shrink-0"
                    style={{ background: "var(--grad2)", boxShadow: "0 4px 14px rgba(74,108,247,0.25)" }}>
                    {sending ? "…" : "Envoyer"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl flex items-center justify-center"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)", minHeight: 480 }}>
              <div className="text-center" style={{ color: "var(--muted)" }}>
                <div className="text-4xl mb-3">💬</div>
                <p className="font-bold text-sm">Sélectionnez une demande</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
