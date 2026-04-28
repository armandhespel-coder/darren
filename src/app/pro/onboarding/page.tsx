"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const CATEGORIES = ["DJ", "Décoratrice", "Matériel", "Voiture", "Traiteur", "Photo & Caméra", "Feux d'artifice", "Location de salle", "Gâteau"];
const CONTINENTS = ["Europe", "Afrique", "Amérique", "Asie", "Océanie"];
const DEFAULT_TAGS = ["Mariage", "Anniversaire", "Corporate", "Vinyl", "House", "Techno", "Latino", "Hip-Hop", "Soirée étudiante", "Cocktail", "Brunch", "Retro"];

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "", company: "", categorie: "DJ", continent: "Europe",
    description: "", prix: "", price_note: "", tags: [] as string[],
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      setUserId(data.user.id);
      // Si l'utilisateur a déjà un prestataire, rediriger vers le dashboard
      supabase.from("prestataires").select("id").eq("owner_id", data.user.id).single().then(({ data: p }) => {
        if (p) { router.push("/pro/dashboard"); return; }
        // Sinon : l'accès pro passe uniquement par le lien admin → rediriger
        router.push("/?message=acces_invite");
      });
    });
  }, [router]);

  const up = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleTag = (t: string) => setForm((f) => ({
    ...f,
    tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t],
  }));

  const handleSubmit = async () => {
    if (!userId) return;
    if (!form.nom.trim()) { setError("Le nom est obligatoire."); return; }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.from("prestataires").insert({
      owner_id: userId,
      nom: form.nom.trim(),
      company: form.company.trim() || null,
      categorie: form.categorie,
      continent: form.continent,
      description: form.description.trim() || null,
      prix: Number(form.prix) || 0,
      price_note: form.price_note.trim() || null,
      tags: form.tags,
      images: [],
      note: 0,
      is_available: true,
      is_premium: false,
      telephone: null,
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    // Upgrade role to 'pro'
    await supabase.from("profiles").update({ role: "pro" }).eq("id", userId);
    const supabase2 = createClient();
    const { data: { user } } = await supabase2.auth.getUser();
    fetch("/api/demande-prestataire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: form.nom.trim(),
        company: form.company.trim() || null,
        categorie: form.categorie,
        continent: form.continent,
        description: form.description.trim() || null,
        tags: form.tags,
        prix: Number(form.prix) || 0,
        price_note: form.price_note.trim() || null,
        email: user?.email ?? null,
      }),
    });
    router.push("/pro/dashboard");
  };

  const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all";
  const inputStyle = { background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" };
  const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "var(--blue2)");
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "var(--border)");

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="Connect Event" className="h-24 w-auto object-contain" />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all"
                style={{
                  background: step >= s ? "var(--grad)" : "var(--bg2)",
                  color: step >= s ? "white" : "var(--muted)",
                  border: `2px solid ${step >= s ? "transparent" : "var(--border)"}`,
                }}>
                {s}
              </div>
              {s < 3 && <div className="w-8 h-0.5 rounded" style={{ background: step > s ? "var(--blue2)" : "var(--border)" }} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: "white", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>

          {step === 1 && (
            <>
              <h1 className="font-black text-2xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                Bienvenue sur Connect Event 🎉
              </h1>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                Créez votre fiche prestataire en 3 étapes.
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                    Votre nom *
                  </label>
                  <input className={inputCls} style={inputStyle} value={form.nom}
                    onChange={(e) => up("nom", e.target.value)} onFocus={focusIn} onBlur={focusOut}
                    placeholder="DJ Martin" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                    Société / Alias
                  </label>
                  <input className={inputCls} style={inputStyle} value={form.company}
                    onChange={(e) => up("company", e.target.value)} onFocus={focusIn} onBlur={focusOut}
                    placeholder="Martin Events" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                      Catégorie
                    </label>
                    <select className={inputCls} style={{ ...inputStyle, appearance: "none" }} value={form.categorie}
                      onChange={(e) => up("categorie", e.target.value)} onFocus={focusIn} onBlur={focusOut}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                      Zone
                    </label>
                    <select className={inputCls} style={{ ...inputStyle, appearance: "none" }} value={form.continent}
                      onChange={(e) => up("continent", e.target.value)} onFocus={focusIn} onBlur={focusOut}>
                      {CONTINENTS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
                <button onClick={() => { if (!form.nom.trim()) { setError("Le nom est obligatoire."); return; } setError(""); setStep(2); }}
                  className="w-full py-3 rounded-xl font-extrabold text-sm text-white cursor-pointer mt-1"
                  style={{ background: "var(--grad)" }}>
                  Suivant →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-black text-2xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                Votre présentation
              </h1>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                Décrivez-vous et sélectionnez vos spécialités.
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                    Description
                  </label>
                  <textarea className={inputCls} style={inputStyle} rows={4} value={form.description}
                    onChange={(e) => up("description", e.target.value)}
                    onFocus={focusIn as React.FocusEventHandler<HTMLTextAreaElement>}
                    onBlur={focusOut as React.FocusEventHandler<HTMLTextAreaElement>}
                    placeholder="Parlez de votre style, vos références, votre zone d'intervention…" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                    Tags (sélectionnez vos spécialités)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_TAGS.map((t) => (
                      <button key={t} type="button" onClick={() => toggleTag(t)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer"
                        style={{
                          background: form.tags.includes(t) ? "rgba(74,108,247,0.12)" : "var(--bg)",
                          color: form.tags.includes(t) ? "var(--blue2)" : "var(--muted)",
                          border: `1.5px solid ${form.tags.includes(t) ? "rgba(74,108,247,0.3)" : "var(--border)"}`,
                        }}>
                        {form.tags.includes(t) ? "✓ " : ""}{t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl font-bold text-sm cursor-pointer"
                    style={{ background: "var(--bg2)", color: "var(--muted)", border: "1.5px solid var(--border)" }}>
                    ← Retour
                  </button>
                  <button onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl font-extrabold text-sm text-white cursor-pointer"
                    style={{ background: "var(--grad)" }}>
                    Suivant →
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="font-black text-2xl mb-1" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
                Votre tarif
              </h1>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                Indiquez un prix indicatif pour attirer les bons clients.
              </p>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                      Prix indicatif (€)
                    </label>
                    <input type="number" className={inputCls} style={inputStyle} value={form.prix}
                      onChange={(e) => up("prix", e.target.value)} onFocus={focusIn} onBlur={focusOut}
                      placeholder="850" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: "var(--blue2)" }}>
                      Unité
                    </label>
                    <input className={inputCls} style={inputStyle} value={form.price_note}
                      onChange={(e) => up("price_note", e.target.value)} onFocus={focusIn} onBlur={focusOut}
                      placeholder="/ soirée" />
                  </div>
                </div>
                {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(2)}
                    className="px-5 py-3 rounded-xl font-bold text-sm cursor-pointer"
                    style={{ background: "var(--bg2)", color: "var(--muted)", border: "1.5px solid var(--border)" }}>
                    ← Retour
                  </button>
                  <button onClick={handleSubmit} disabled={saving}
                    className="flex-1 py-3 rounded-xl font-extrabold text-sm text-white cursor-pointer disabled:opacity-50"
                    style={{ background: "var(--grad)", boxShadow: "0 6px 22px rgba(217,63,181,0.3)" }}>
                    {saving ? "Création..." : "🚀 Créer mon profil"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
