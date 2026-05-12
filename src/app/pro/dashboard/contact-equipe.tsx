"use client";

import { useState } from "react";

interface Props {
  userEmail: string;
}

export default function ContactEquipe({ userEmail }: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError("");
    const res = await fetch("/api/contact-equipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, message: message.trim() }),
    });
    setSending(false);
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Une erreur est survenue.");
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <p style={{ fontWeight: 800, fontSize: 18, color: "var(--dark)", marginBottom: 8 }}>
          Demande envoyée !
        </p>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          L&apos;équipe Connect Event va revenir vers vous rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ display: "block", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--blue2)", marginBottom: 6 }}>
          Votre email
        </label>
        <div style={{ padding: "10px 16px", borderRadius: 12, background: "var(--bg2)", border: "1.5px solid var(--border)", fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>
          {userEmail}
        </div>
      </div>
      <div>
        <label style={{ display: "block", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--blue2)", marginBottom: 6 }}>
          Votre message *
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Présentez-vous, indiquez votre catégorie de prestation…"
          rows={4}
          required
          style={{ width: "100%", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 600, outline: "none", resize: "none", background: "var(--bg)", border: "1.5px solid var(--border)", color: "var(--text)", boxSizing: "border-box" }}
          onFocus={e => (e.target.style.borderColor = "var(--blue2)")}
          onBlur={e => (e.target.style.borderColor = "var(--border)")}
        />
      </div>
      {error && (
        <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", background: "rgba(239,68,68,0.08)", borderRadius: 8, padding: "8px 12px" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={sending || !message.trim()}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: "var(--grad)", color: "white", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", opacity: sending || !message.trim() ? 0.5 : 1 }}
      >
        {sending ? "Envoi…" : "Envoyer ma demande →"}
      </button>
    </form>
  );
}
