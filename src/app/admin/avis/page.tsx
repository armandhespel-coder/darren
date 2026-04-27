"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Prestataire { id: string; nom: string; categorie: string; }
interface Token {
  id: string;
  prestataire_id: string;
  created_by: string;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  prestataires: { nom: string } | null;
}

export default function AdminAvisPage() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filterUsed, setFilterUsed] = useState<"all" | "used" | "unused">("all");

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data: presta }, { data: tok }] = await Promise.all([
      supabase.from("prestataires").select("id, nom, categorie").order("nom"),
      supabase.from("avis_tokens").select("*, prestataires(nom)").order("created_at", { ascending: false }),
    ]);
    setPrestataires((presta as Prestataire[]) ?? []);
    setTokens((tok as Token[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async (prestaId: string) => {
    setGenerating(prestaId);
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from("avis_tokens").insert({
      prestataire_id: prestaId,
      created_by: user.user?.email ?? "admin",
    });
    if (!error) await load();
    setGenerating(null);
  };

  const copyLink = async (tokenId: string) => {
    const url = `${window.location.origin}/avis/${tokenId}`;
    await navigator.clipboard.writeText(url);
    setCopied(tokenId);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = tokens.filter(t => {
    if (filterUsed === "used") return !!t.used_at;
    if (filterUsed === "unused") return !t.used_at;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.08)",
          padding: "0 clamp(16px,4vw,40px)",
          height: 68,
        }}
      >
        <div className="flex items-center gap-4">
          <a href="/"><img src="/logo.png" alt="Connect Event" className="h-16 md:h-20 w-auto object-contain" /></a>
          <span className="hidden sm:inline text-xs font-extrabold px-3 py-1 rounded-full"
            style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
            🔐 Admin · Avis clients
          </span>
        </div>
        <a href="/admin" className="text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: "var(--bg2)", color: "var(--muted)" }}>
          ← Admin
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-black text-3xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
          Liens avis clients
        </h1>
        <p className="text-sm font-semibold mb-8" style={{ color: "var(--muted)" }}>
          Générez un lien unique par prestataire. Le client ouvre le lien et laisse son avis — valide 30 jours, usage unique.
        </p>

        {/* Générer un lien */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
          <h2 className="font-black text-lg mb-4" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Générer un lien
          </h2>
          {loading ? (
            <div className="text-sm font-semibold" style={{ color: "var(--muted)" }}>Chargement…</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {prestataires.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <div>
                    <div className="text-sm font-extrabold" style={{ color: "var(--dark)" }}>{p.nom}</div>
                    <div className="text-[11px] font-semibold" style={{ color: "var(--muted)" }}>{p.categorie}</div>
                  </div>
                  <button
                    onClick={() => generate(p.id)}
                    disabled={generating === p.id}
                    className="text-xs font-extrabold px-3 py-1.5 rounded-full cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    style={{ background: "var(--grad)", color: "white", border: "none", boxShadow: "0 4px 12px rgba(74,108,247,0.2)" }}
                  >
                    {generating === p.id ? "…" : "+ Générer"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liste des tokens */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>
              {filtered.length} lien{filtered.length > 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              {(["all", "unused", "used"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterUsed(f)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all"
                  style={{
                    background: filterUsed === f ? "var(--grad2)" : "var(--bg2)",
                    color: filterUsed === f ? "white" : "var(--muted)",
                    border: "none",
                  }}
                >
                  {f === "all" ? "Tous" : f === "unused" ? "✅ Disponibles" : "✓ Utilisés"}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "var(--muted)" }}>
              <div className="text-3xl mb-2">🔗</div>
              <p className="font-bold text-sm">Aucun lien généré.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {filtered.map(t => {
                const expired = t.expires_at ? new Date(t.expires_at) < new Date() : false;
                const status = t.used_at ? "used" : expired ? "expired" : "active";
                return (
                  <div key={t.id} className="flex items-center justify-between gap-4 px-6 py-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-sm truncate" style={{ color: "var(--dark)" }}>
                        {t.prestataires?.nom ?? t.prestataire_id}
                      </div>
                      <div className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--muted)" }}>
                        Créé le {new Date(t.created_at).toLocaleDateString("fr-BE")}
                        {t.expires_at && ` · Expire le ${new Date(t.expires_at).toLocaleDateString("fr-BE")}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                        style={{
                          background: status === "active" ? "rgba(34,197,94,0.1)" : status === "used" ? "rgba(74,108,247,0.1)" : "rgba(239,68,68,0.1)",
                          color: status === "active" ? "#16a34a" : status === "used" ? "var(--blue2)" : "#dc2626",
                        }}
                      >
                        {status === "active" ? "✅ Disponible" : status === "used" ? "✓ Utilisé" : "⚠ Expiré"}
                      </span>
                      {status === "active" && (
                        <button
                          onClick={() => copyLink(t.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all"
                          style={{ background: copied === t.id ? "rgba(34,197,94,0.1)" : "var(--bg2)", color: copied === t.id ? "#16a34a" : "var(--muted)", border: "none" }}
                        >
                          {copied === t.id ? "✓ Copié !" : "📋 Copier le lien"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
