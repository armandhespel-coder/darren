"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  icon: string;
  position: number;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState("");
  const [iconInput, setIconInput] = useState("✨");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("site_categories").select("*").order("position");
    setCats((data as Category[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 2500);
  };

  const addCat = async () => {
    const name = nameInput.trim();
    if (!name) return;
    setSaving(true);
    const supabase = createClient();
    const nextPos = (cats[cats.length - 1]?.position ?? 0) + 1;
    const { error } = await supabase.from("site_categories").insert({ name, icon: iconInput || "✨", position: nextPos });
    if (error) flash("err", error.message);
    else { flash("ok", `Catégorie « ${name} » ajoutée.`); setNameInput(""); setIconInput("✨"); load(); }
    setSaving(false);
  };

  const deleteCat = async (id: string, name: string) => {
    if (!confirm(`Supprimer la catégorie « ${name} » ?\nLes prestataires avec cette catégorie ne seront pas supprimés.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("site_categories").delete().eq("id", id);
    if (error) flash("err", error.message);
    else { flash("ok", "Catégorie supprimée."); load(); }
  };

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
          padding: "0 40px",
          height: 68,
        }}
      >
        <div className="flex items-center gap-4">
          <a href="/"><img src="/logo.png" alt="Connect Event" className="h-16 w-auto object-contain" /></a>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full"
            style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}>
            🔐 Admin · Catégories
          </span>
        </div>
        <a href="/admin" className="text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: "var(--bg2)", color: "var(--muted)" }}>
          ← Admin
        </a>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-black text-3xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
          Gestion des catégories
        </h1>
        <p className="text-sm font-semibold mb-8" style={{ color: "var(--muted)" }}>
          Ces catégories sont utilisées sur toute la plateforme — filtres, création et modification de profils.
        </p>

        {msg && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-bold"
            style={{
              background: msg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1.5px solid ${msg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              color: msg.type === "ok" ? "#16a34a" : "#dc2626",
            }}>
            {msg.type === "ok" ? "✓" : "✕"} {msg.text}
          </div>
        )}

        {/* Add form */}
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
          <h2 className="font-black text-lg mb-4" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
            Ajouter une catégorie
          </h2>
          <div className="flex gap-3">
            <input
              value={iconInput}
              onChange={e => setIconInput(e.target.value)}
              placeholder="🎵"
              className="rounded-xl px-3 py-2.5 text-center text-lg font-bold outline-none transition-all"
              style={{ width: 56, background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
              onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCat()}
              placeholder="Ex : Cirque, Magicien…"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"
              style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
              onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
            <button
              onClick={addCat}
              disabled={saving || !nameInput.trim()}
              className="text-white text-sm font-extrabold px-5 rounded-xl cursor-pointer disabled:opacity-50"
              style={{ background: "var(--grad)", boxShadow: "0 4px 14px rgba(217,63,181,0.25)" }}
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Category list */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>
              {loading ? "Chargement…" : `${cats.length} catégorie${cats.length > 1 ? "s" : ""}`}
            </span>
          </div>

          {!loading && cats.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "var(--muted)" }}>
              <div className="text-3xl mb-2">📂</div>
              <p className="font-bold text-sm">Aucune catégorie. Ajoutez-en une.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {cats.map(cat => (
                <div key={cat.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>{cat.name}</span>
                  </div>
                  <button
                    onClick={() => deleteCat(cat.id, cat.name)}
                    className="text-[11px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                    style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
