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
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function DemandesPage() {
  const router = useRouter();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [active, setActive] = useState<Demande | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (uid: string) => {
    const supabase = createClient();

    // Récupérer le prestataire du pro
    const { data: presta } = await supabase
      .from("prestataires")
      .select("id")
      .eq("owner_id", uid)
      .single();

    if (!presta) { setLoading(false); return; }

    // Lire les demandes pour ce prestataire
    const { data } = await supabase
      .from("demandes")
      .select("*")
      .eq("prestataire_id", presta.id)
      .order("created_at", { ascending: false });

    if (!data?.length) { setLoading(false); return; }

    setDemandes(data);
    setActive(data[0]);
    setLoading(false);

    // Marquer comme lues
    await supabase.from("demandes").update({ lu: true }).eq("prestataire_id", presta.id).eq("lu", false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login?next=/pro/demandes"); return; }
      load(data.user.id);
    });
  }, [load, router]);

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
        <a href="/pro/dashboard"><img src="/logo.png" alt="Connect Event" className="h-10 w-auto object-contain" /></a>
        <h1 className="font-black text-lg" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
          Mes demandes
        </h1>
        <a href="/pro/dashboard" className="text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: "var(--bg2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
          ← Dashboard
        </a>
      </header>

      {demandes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-black text-xl mb-2" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Aucune demande reçue
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Les messages des clients apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 items-start">
          {/* List */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="font-black text-sm" style={{ color: "var(--dark)" }}>
                {demandes.length} demande{demandes.length > 1 ? "s" : ""}
              </h2>
            </div>
            {demandes.map((d) => (
              <button key={d.id} onClick={() => setActive(d)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all"
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: active?.id === d.id ? "rgba(74,108,247,0.05)" : "transparent",
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
                  style={{ background: "var(--grad)" }}>
                  {d.nom[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-xs truncate" style={{ color: "var(--dark)" }}>
                      {d.nom}
                    </span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: "var(--muted)" }}>
                      {timeAgo(d.created_at)}
                    </span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>{d.contenu}</p>
                </div>
                {!d.lu && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "var(--blue2)" }} />
                )}
              </button>
            ))}
          </div>

          {/* Detail */}
          {active && (
            <div className="rounded-2xl overflow-hidden flex flex-col"
              style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)", minHeight: 400 }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
                    style={{ background: "var(--grad)" }}>
                    {active.nom[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>{active.nom}</div>
                    <div className="text-[11px]" style={{ color: "var(--muted)" }}>{timeAgo(active.created_at)}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 px-6 py-5 flex flex-col gap-4">
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{active.contenu}</p>

                {/* Coordonnées pour répondre */}
                <div className="rounded-xl p-4 flex flex-col gap-2"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: "var(--blue2)" }}>
                    Coordonnées du client
                  </p>
                  <a href={`mailto:${active.email}`}
                    className="text-sm font-bold flex items-center gap-2"
                    style={{ color: "var(--blue2)" }}>
                    ✉️ {active.email}
                  </a>
                  {active.telephone && (
                    <a href={`tel:${active.telephone}`}
                      className="text-sm font-bold flex items-center gap-2"
                      style={{ color: "var(--blue2)" }}>
                      📞 {active.telephone}
                    </a>
                  )}
                </div>

                <a href={`mailto:${active.email}?subject=Réponse à votre demande — Connect Event`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-extrabold text-sm text-white"
                  style={{ background: "var(--grad)", boxShadow: "0 4px 14px rgba(217,63,181,0.3)" }}>
                  ✉️ Répondre par email
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
