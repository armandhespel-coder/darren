"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Tag {
  id: string;
  name: string;
  category_name: string | null;
  created_at: string;
}

interface Category {
  name: string;
  icon: string;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data: tagsData }, { data: catsData }] = await Promise.all([
      supabase.from("site_subcategories").select("*").order("category_name").order("name"),
      supabase.from("site_categories").select("name, icon").order("position"),
    ]);
    setTags((tagsData as Tag[]) ?? []);
    setCategories((catsData as Category[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 2500);
  };

  const addTag = async () => {
    const name = input.trim();
    if (!name) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("site_subcategories").insert({ name, category_name: selectedCat || null });
    if (error) flash("err", error.message);
    else { flash("ok", `Tag « ${name} » ajouté.`); setInput(""); load(); }
    setSaving(false);
  };

  const deleteTag = async (id: string, name: string) => {
    if (!confirm(`Supprimer le tag « ${name} » ?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("site_tags").delete().eq("id", id);
    if (error) flash("err", error.message);
    else { flash("ok", "Tag supprimé."); load(); }
  };

  const filtered = filterCat === "all" ? tags :
    filterCat === "global" ? tags.filter(t => !t.category_name) :
    tags.filter(t => t.category_name === filterCat);

  const grouped = filtered.reduce<Record<string, Tag[]>>((acc, tag) => {
    const key = tag.category_name ?? "__global__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(tag);
    return acc;
  }, {});

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
            🔐 Admin · Sous-catégories
          </span>
        </div>
        <a href="/admin" className="text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: "var(--bg2)", color: "var(--muted)" }}>
          ← Admin
        </a>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-black text-3xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
          Sous-catégories
        </h1>
        <p className="text-sm font-semibold mb-8" style={{ color: "var(--muted)" }}>
          Associez des tags à des catégories pour créer des sous-catégories sur le site. Un tag sans catégorie est global.
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
            Ajouter un tag
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag()}
                placeholder="Ex : Lieux, Jazz, Outdoor…"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
              <button
                onClick={addTag}
                disabled={saving || !input.trim()}
                className="text-white text-sm font-extrabold px-5 rounded-xl cursor-pointer disabled:opacity-50"
                style={{ background: "var(--grad)", boxShadow: "0 4px 14px rgba(217,63,181,0.25)" }}
              >
                Ajouter
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                Catégorie associée
              </label>
              <select
                value={selectedCat}
                onChange={e => setSelectedCat(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none cursor-pointer"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)", appearance: "none" }}
              >
                <option value="">— Aucune (tag global)</option>
                {categories.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { key: "all", label: `Tous (${tags.length})` },
            { key: "global", label: `🌐 Global (${tags.filter(t => !t.category_name).length})` },
            ...categories.map(c => ({ key: c.name, label: `${c.icon} ${c.name} (${tags.filter(t => t.category_name === c.name).length})` })),
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterCat(f.key)}
              className="text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all"
              style={{
                background: filterCat === f.key ? "var(--grad2)" : "white",
                color: filterCat === f.key ? "white" : "var(--muted)",
                border: filterCat === f.key ? "1.5px solid transparent" : "1.5px solid var(--border)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tag list */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>
              {loading ? "Chargement…" : `${filtered.length} tag${filtered.length > 1 ? "s" : ""}`}
            </span>
          </div>

          {!loading && filtered.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "var(--muted)" }}>
              <div className="text-3xl mb-2">🏷️</div>
              <p className="font-bold text-sm">Aucun tag. Ajoutez-en un.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {Object.entries(grouped).map(([key, groupTags]) => {
                const cat = key === "__global__" ? null : categories.find(c => c.name === key);
                return (
                  <div key={key}>
                    <div className="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-widest"
                      style={{ background: "var(--bg)", color: "var(--blue2)", borderBottom: "1px solid var(--border)" }}>
                      {cat ? `${cat.icon} ${cat.name}` : "🌐 Global (sans catégorie)"}
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                      {groupTags.map(tag => (
                        <div key={tag.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                          style={{ background: "rgba(74,108,247,0.08)", color: "var(--blue2)", border: "1px solid rgba(74,108,247,0.2)" }}>
                          <span>{tag.name}</span>
                          <button
                            onClick={() => deleteTag(tag.id, tag.name)}
                            aria-label="Supprimer"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, lineHeight: 1, opacity: 0.7 }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
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
