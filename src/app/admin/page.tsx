"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Prestataire } from "@/types";

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  "DJ", "Décoratrice", "Matériel", "Voiture", "Traiteur",
  "Photo & Caméra", "Feux d'artifice", "Location de salle", "Gâteau",
];
const CONTINENTS = ["Europe", "Afrique", "Amérique", "Asie", "Océanie"];
const EMPTY: FormData = {
  nom: "", company: "", categorie: "DJ", continent: "Europe",
  prix: "", price_note: "", note: "", reviews: "", badge: "",
  image: "", tags: "", description: "",
  is_available: true, is_premium: false, telephone: "",
};

interface FormData {
  nom: string; company: string; categorie: string; continent: string;
  prix: string; price_note: string; note: string; reviews: string; badge: string;
  image: string; tags: string; description: string;
  is_available: boolean; is_premium: boolean; telephone: string;
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

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

// ─── Page Admin ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const up = (k: keyof FormData, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("prestataires")
      .select("*")
      .order("created_at", { ascending: false });
    setPrestataires((data as Prestataire[]) ?? []);
    setLoading(false);
  }, [supabase]);

  // Auth guard — protection réelle assurée par le Server Component layout.tsx
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      load();
    });
  }, [load, router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const payload = {
      nom: form.nom.trim(),
      company: form.company.trim() || null,
      categorie: form.categorie,
      continent: form.continent,
      prix: Number(form.prix) || 0,
      price_note: form.price_note.trim() || null,
      note: form.note ? Number(form.note) : 0,
      reviews: form.reviews ? Number(form.reviews) : 0,
      badge: form.badge.trim() || null,
      images: form.image.trim() ? [form.image.trim()] : [],
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
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
      const { data: ud } = await supabase.auth.getUser();
      const { error } = await supabase.from("prestataires").insert({ ...payload, owner_id: ud.user?.id });
      if (error) setMsg({ type: "err", text: error.message });
      else { setMsg({ type: "ok", text: "Prestataire ajouté !" }); resetForm(); load(); }
    }
    setSaving(false);
  };

  const handleEdit = (p: Prestataire) => {
    setEditId(p.id);
    setForm({
      nom: p.nom, company: p.company ?? "",
      categorie: p.categorie, continent: p.continent ?? "Europe",
      prix: String(p.prix), price_note: p.price_note ?? "",
      note: String(p.note), reviews: String(p.reviews ?? ""),
      badge: p.badge ?? "", image: p.images?.[0] ?? "",
      tags: p.tags?.join(", ") ?? "", description: p.description ?? "",
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

  const resetForm = () => { setForm(EMPTY); setEditId(null); };

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
            <img src="/logo.png" alt="Connect Event" className="h-16 w-auto object-contain" />
          </a>
          <div
            className="text-xs font-extrabold px-3 py-1 rounded-full"
            style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}
          >
            🔐 Admin
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/portail"
            className="text-xs font-extrabold px-4 py-2 rounded-full transition-all text-white"
            style={{ background: "var(--grad)" }}
          >
            ✉️ Portail prestataires
          </a>
          <a
            href="/"
            className="text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: "var(--bg2)", color: "var(--muted)" }}
          >
            ← Voir le site
          </a>
          <button
            onClick={handleLogout}
            className="text-xs font-extrabold px-4 py-2 rounded-full text-white cursor-pointer transition-all"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Title */}
        <div className="mb-8">
          <h1
            className="font-black text-3xl mb-1"
            style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}
          >
            Tableau de bord{" "}
            <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Admin
            </span>
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
            Gérez les prestataires, modifiez les infos et les prix
          </p>
        </div>

        {/* Flash message */}
        {msg && (
          <div
            className="mb-6 px-5 py-3 rounded-xl text-sm font-bold"
            style={{
              background: msg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1.5px solid ${msg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              color: msg.type === "ok" ? "#16a34a" : "#dc2626",
            }}
          >
            {msg.type === "ok" ? "✓" : "✕"} {msg.text}
          </div>
        )}

        {/* ── Grid : Form + Table ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">

          {/* ─── Formulaire ─── */}
          <div
            className="rounded-2xl"
            style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)", padding: "28px" }}
          >
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Catégorie *</Label>
                  <Select value={form.categorie} onChange={v => up("categorie", v)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Continent *</Label>
                  <Select value={form.continent} onChange={v => up("continent", v)}>
                    {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Note (0-5)</Label>
                  <Input type="number" step="0.1" min="0" max="5" value={form.note} onChange={v => up("note", v)} placeholder="4.9" />
                </div>
                <div>
                  <Label>Nb avis</Label>
                  <Input type="number" value={form.reviews} onChange={v => up("reviews", v)} placeholder="120" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Disponibilité</Label>
                  <Select value={form.is_available ? "true" : "false"} onChange={v => up("is_available", v === "true")}>
                    <option value="true">Disponible</option>
                    <option value="false">Limité</option>
                  </Select>
                </div>
                <div>
                  <Label>Badge</Label>
                  <Input value={form.badge} onChange={v => up("badge", v)} placeholder="Top DJ" />
                </div>
              </div>

              {/* Premium */}
              <div
                className="rounded-xl p-4"
                style={{ background: form.is_premium ? "rgba(74,108,247,0.06)" : "var(--bg)", border: "1.5px solid var(--border)" }}
              >
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
                    <Input value={form.telephone} onChange={v => up("telephone", v)} placeholder="+33 6 12 34 56 78" type="tel" />
                  </div>
                )}
              </div>

              <div>
                <Label>Image URL</Label>
                <Input value={form.image} onChange={v => up("image", v)} placeholder="https://..." type="url" />
              </div>

              <div>
                <Label>Tags (virgules)</Label>
                <Input value={form.tags} onChange={v => up("tags", v)} placeholder="Mariage, Luxe, Photo" />
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

              {/* Actions */}
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
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}
          >
            {/* Header table */}
            <div
              className="flex items-center justify-between flex-wrap gap-3 px-6 py-5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
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
                style={{
                  background: "var(--bg)", border: "1.5px solid var(--border)",
                  color: "var(--text)", width: 220,
                }}
                onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Table */}
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
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest"
                          style={{ color: "var(--muted)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr
                        key={p.id}
                        style={{ borderBottom: "1px solid var(--border)", background: editId === p.id ? "rgba(74,108,247,0.04)" : "white" }}
                        onMouseEnter={e => { if (editId !== p.id) (e.currentTarget as HTMLElement).style.background = "var(--bg)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = editId === p.id ? "rgba(74,108,247,0.04)" : "white"; }}
                      >
                        <td className="px-5 py-3">
                          <div className="font-extrabold text-sm" style={{ color: "var(--dark)" }}>
                            {p.nom}
                          </div>
                          {p.company && (
                            <div className="text-[11px] font-semibold" style={{ color: "var(--muted)" }}>{p.company}</div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                            style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)" }}
                          >
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
                          <span
                            className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                            style={{
                              background: p.is_available ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                              color: p.is_available ? "#16a34a" : "#dc2626",
                            }}
                          >
                            {p.is_available ? "Dispo" : "Limité"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(p)}
                              className="text-[11px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                              style={{ background: "rgba(74,108,247,0.1)", color: "var(--blue2)", border: "1px solid rgba(74,108,247,0.2)" }}
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="text-[11px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                              style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}
                            >
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
