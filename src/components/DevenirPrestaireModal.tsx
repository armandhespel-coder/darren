"use client";

import { useState } from "react";

interface ProForm { nom: string; service: string; email: string; telephone: string; message: string; }
const SERVICES = ["DJ","Décoratrice","Matériel","Voiture","Traiteur","Photo & Caméra","Feux d'artifice","Location de salle","Gâteau","Autre"];

function IconX() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconCheckWhite() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export default function DevenirPrestaireModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<ProForm>({ nom: "", service: "", email: "", telephone: "", message: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k: keyof ProForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.service) return;
    setLoading(true);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.nom,
        email: form.email,
        message: `Candidature prestataire\n\nService : ${form.service}\nTéléphone : ${form.telephone || "—"}\n\n${form.message}`,
      }),
    });
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(18,17,42,0.7)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden anim-popin"
        style={{ maxHeight: "92vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(74,108,247,0.25)" }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{ background: "linear-gradient(135deg, var(--dark2), #2A1042)", padding: "28px 32px" }}
          className="flex justify-between items-start"
        >
          <div>
            <h2 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-raleway)" }}>
              Rejoindre Connect Event
            </h2>
            <p className="text-white/50 text-sm mt-1">Présentez votre offre et touchez des milliers de clients</p>
          </div>
          <button
            aria-label="Fermer"
            onClick={onClose}
            className="flex items-center justify-center rounded-full text-white/70 hover:text-white cursor-pointer transition-all"
            style={{ width: 44, height: 44, background: "rgba(255,255,255,0.1)", border: "none", flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
          >
            <IconX />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--grad)", boxShadow: "0 8px 28px rgba(217,63,181,0.4)" }}>
              <IconCheckWhite />
            </div>
            <h3 className="text-xl font-black mb-3" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
              Message envoyé !
            </h3>
            <p className="text-sm font-semibold leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
              Notre équipe vous contactera sous 24 à 48h pour finaliser votre inscription.
            </p>
            <button onClick={onClose}
              className="text-white text-sm font-extrabold px-8 rounded-xl cursor-pointer"
              style={{ height: 44, background: "var(--grad2)", border: "none" }}>
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-8 flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                Nom / Prénom *
              </label>
              <input
                required value={form.nom} onChange={e => update("nom", e.target.value)}
                placeholder="Marie Dupont"
                className="w-full rounded-xl px-4 text-sm font-semibold outline-none transition-all"
                style={{ height: 44, background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                Service proposé *
              </label>
              <select
                required value={form.service} onChange={e => update("service", e.target.value)}
                className="w-full rounded-xl px-4 text-sm font-semibold outline-none cursor-pointer"
                style={{ height: 44, background: "var(--bg)", border: "1.5px solid var(--border)", color: form.service ? "var(--text)" : "var(--muted)", appearance: "none" }}
              >
                <option value="">Sélectionner une catégorie...</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                  Email *
                </label>
                <input
                  required type="email" value={form.email} onChange={e => update("email", e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full rounded-xl px-4 text-sm font-semibold outline-none transition-all"
                  style={{ height: 44, background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                  Téléphone
                </label>
                <input
                  type="tel" value={form.telephone} onChange={e => update("telephone", e.target.value)}
                  placeholder="+32 4 ..."
                  className="w-full rounded-xl px-4 text-sm font-semibold outline-none transition-all"
                  style={{ height: 44, background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--blue2)" }}>
                Décrivez votre offre
              </label>
              <textarea
                rows={3} value={form.message} onChange={e => update("message", e.target.value)}
                placeholder="Votre expérience, zone géographique, tarifs, style..."
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all resize-none"
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)" }}
                onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-white font-extrabold rounded-xl cursor-pointer transition-all text-sm mt-1"
              disabled={loading}
              style={{ height: 52, background: "var(--grad)", boxShadow: "0 6px 22px rgba(217,63,181,0.3)", letterSpacing: "0.06em", border: "none", opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 30px rgba(217,63,181,0.4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 22px rgba(217,63,181,0.3)";
              }}
            >
              <IconCheck /> {loading ? "Envoi…" : "Envoyer ma candidature"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
