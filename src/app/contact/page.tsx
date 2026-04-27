"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    setStatus(res.ok ? "success" : "error");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1.5px solid var(--border)",
    background: "var(--bg)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    color: "var(--dark2)",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 6,
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-nunito)" }}>
      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <a href="/">
            <img src="/logo.png" alt="Connect Event" style={{ height: 48, width: "auto", objectFit: "contain" }} />
          </a>
          <a href="/" style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            ← Retour à l&apos;accueil
          </a>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 900,
          color: "var(--dark2)",
          marginBottom: 8,
          fontFamily: "var(--font-raleway)",
        }}>
          Contactez-nous
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
          Une question, une demande de partenariat ou besoin d&apos;aide ?<br />
          On vous répond rapidement.
        </p>

        <div style={{
          background: "white",
          borderRadius: 20,
          padding: "36px",
          boxShadow: "var(--shadow2)",
          border: "1px solid var(--border)",
        }}>
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--dark2)", marginBottom: 8 }}>
                Message envoyé !
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>
                Nous vous répondrons dans les plus brefs délais.
              </p>
              <button
                onClick={() => { setStatus("idle"); setName(""); setEmail(""); setMessage(""); }}
                style={{
                  marginTop: 20,
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: "var(--grad2)",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelStyle}>Votre nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Jean Dupont"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="vous@exemple.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="Décrivez votre demande..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {status === "error" && (
                <p style={{
                  color: "#e53e3e",
                  fontSize: 13,
                  background: "#fff5f5",
                  border: "1px solid #fed7d7",
                  borderRadius: 10,
                  padding: "10px 14px",
                  margin: 0,
                }}>
                  Une erreur est survenue. Veuillez réessayer.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  padding: "14px 28px",
                  borderRadius: 12,
                  border: "none",
                  background: "var(--grad2)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  opacity: status === "loading" ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            flex: 1,
            minWidth: 200,
            background: "white",
            borderRadius: 14,
            padding: "20px 24px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow2)",
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📧</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Email</div>
            <a
              href="mailto:contact@connectevent.be"
              style={{ fontSize: 14, fontWeight: 700, color: "var(--blue2)", textDecoration: "none" }}
            >
              contact@connectevent.be
            </a>
          </div>

          <div style={{
            flex: 1,
            minWidth: 200,
            background: "white",
            borderRadius: 14,
            padding: "20px 24px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow2)",
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏱️</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Réponse</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--dark2)" }}>
              Sous 24 à 48h ouvrables
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
