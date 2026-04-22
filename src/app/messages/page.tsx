"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  prestataire_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
  presta_nom?: string;
  presta_image?: string;
  presta_categorie?: string;
}

interface Thread {
  prestataire_id: string | null;
  presta_nom: string;
  presta_image: string;
  presta_categorie: string;
  messages: MessageRow[];
  lastMessage: MessageRow;
  unread: number;
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function MessagesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order("created_at", { ascending: true });

    if (!msgs?.length) {
      setLoading(false);
      return;
    }

    const prestaIds = [...new Set(msgs.map((m) => m.prestataire_id).filter(Boolean))];
    let prestaMap: Record<string, { nom: string; image: string; categorie: string }> = {};
    if (prestaIds.length) {
      const { data: prestas } = await supabase
        .from("prestataires")
        .select("id, nom, images, categorie")
        .in("id", prestaIds);
      (prestas ?? []).forEach((p) => {
        prestaMap[p.id] = {
          nom: p.nom,
          image: p.images?.[0] ?? "",
          categorie: p.categorie,
        };
      });
    }

    const enriched: MessageRow[] = msgs.map((m) => ({
      ...m,
      presta_nom: m.prestataire_id ? prestaMap[m.prestataire_id]?.nom ?? "Prestataire" : "Message direct",
      presta_image: m.prestataire_id ? prestaMap[m.prestataire_id]?.image ?? "" : "",
      presta_categorie: m.prestataire_id ? prestaMap[m.prestataire_id]?.categorie ?? "" : "",
    }));

    const threadMap = new Map<string | null, MessageRow[]>();
    enriched.forEach((m) => {
      const key = m.prestataire_id;
      if (!threadMap.has(key)) threadMap.set(key, []);
      threadMap.get(key)!.push(m);
    });

    const thr: Thread[] = [];
    threadMap.forEach((messages, prestataire_id) => {
      const last = messages[messages.length - 1];
      thr.push({
        prestataire_id,
        presta_nom: last.presta_nom ?? "Prestataire",
        presta_image: last.presta_image ?? "",
        presta_categorie: last.presta_categorie ?? "",
        messages,
        lastMessage: last,
        unread: messages.filter((m) => !m.read && m.receiver_id === uid).length,
      });
    });

    thr.sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
    setThreads(thr);
    if (thr.length) setActive(thr[0]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login?next=/messages");
        return;
      }
      setUserId(data.user.id);
      load(data.user.id);
    });
  }, [load, router]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !active || !userId) return;
    setSending(true);
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prestataire_id: active.prestataire_id,
        receiver_id: active.messages.find((m) => m.sender_id !== userId)?.sender_id ?? null,
        content: reply.trim(),
      }),
    });
    setSending(false);
    if (res.ok) {
      setReply("");
      load(userId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-sm font-bold" style={{ color: "var(--muted)" }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          height: 64,
        }}>
        <a href="/"><img src="/logo.png" alt="Connect Event" className="h-12 w-auto object-contain" /></a>
        <h1 className="font-black text-lg" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
          Mes messages
        </h1>
        <a href="/" className="text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
          ← Retour
        </a>
      </header>

      {threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="text-5xl mb-4">💬</div>
          <p className="font-black text-xl mb-2" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Aucun message
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Trouvez un prestataire et envoyez votre première demande !
          </p>
          <a href="/" className="mt-6 text-sm font-extrabold px-6 py-3 rounded-xl text-white"
            style={{ background: "var(--grad)" }}>
            Explorer les prestataires
          </a>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 items-start">
          {/* Thread list */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="font-black text-sm" style={{ color: "var(--dark)" }}>Conversations</h2>
            </div>
            {threads.map((t) => (
              <button key={t.prestataire_id ?? "direct"} onClick={() => setActive(t)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all"
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: active?.prestataire_id === t.prestataire_id ? "rgba(74,108,247,0.05)" : "transparent",
                }}>
                <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden"
                  style={{ background: "var(--bg2)" }}>
                  {t.presta_image ? (
                    <img src={t.presta_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">💬</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm truncate" style={{ color: "var(--dark)" }}>
                      {t.presta_nom}
                    </span>
                    <span className="text-[10px] font-semibold ml-2 flex-shrink-0" style={{ color: "var(--muted)" }}>
                      {timeAgo(t.lastMessage.created_at)}
                    </span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>
                    {t.lastMessage.content}
                  </p>
                </div>
                {t.unread > 0 && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                    style={{ background: "var(--blue2)" }}>
                    {t.unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Conversation */}
          {active && (
            <div className="rounded-2xl overflow-hidden flex flex-col"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)", minHeight: 480 }}>
              {/* Conv header */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--bg2)" }}>
                  {active.presta_image ? (
                    <img src={active.presta_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">💬</div>
                  )}
                </div>
                <div>
                  <div className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>{active.presta_nom}</div>
                  {active.presta_categorie && (
                    <div className="text-[11px] font-semibold" style={{ color: "var(--muted)" }}>{active.presta_categorie}</div>
                  )}
                </div>
                {active.prestataire_id && (
                  <a href={`/p/${active.prestataire_id}`} className="ml-auto text-[11px] font-bold px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
                    Voir le profil
                  </a>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3" style={{ maxHeight: 360 }}>
                {active.messages.map((m) => {
                  const isMe = m.sender_id === userId;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
                        style={{
                          background: isMe ? "var(--grad)" : "var(--bg)",
                          color: isMe ? "white" : "var(--text)",
                          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        }}>
                        <p className="font-medium leading-relaxed">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : ""}`}
                          style={!isMe ? { color: "var(--muted)" } : {}}>
                          {timeAgo(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply */}
              <form onSubmit={handleReply} className="flex gap-3 p-4"
                style={{ borderTop: "1px solid var(--border)" }}>
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <button type="submit" disabled={sending || !reply.trim()}
                  className="px-5 rounded-xl font-extrabold text-sm text-white disabled:opacity-50 cursor-pointer"
                  style={{ background: "var(--grad)" }}>
                  {sending ? "..." : "Envoyer"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
