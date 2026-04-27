"use client";

import { useState, useRef } from "react";
import DevenirPrestaireModal from "@/components/DevenirPrestaireModal";

function IconHome({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function IconUsers({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

function IconPhone({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012.48 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function IconStar({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.77 7.82 22 9 14.14 4 9.27l5.91-.91L12 2z"/>
    </svg>
  );
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showPrestaireModal, setShowPrestaireModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const navLinks = [
    { label: "Accueil", href: "/", icon: <IconHome /> },
    { label: "Prestataires", href: "/#prestataires", icon: <IconUsers /> },
    { label: "Contact", href: "/contact", icon: <IconPhone />, active: true },
  ];

  return (
    <>
      {showPrestaireModal && <DevenirPrestaireModal onClose={() => setShowPrestaireModal(false)} />}

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.08)",
          padding: "0 clamp(12px, 4vw, 48px)",
          height: 80,
        }}
      >
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Connect Event" className="h-32 md:h-40 w-auto object-contain" />
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
              style={item.active
                ? { background: "var(--grad2)", color: "white", boxShadow: "0 4px 14px rgba(74,108,247,0.35)" }
                : { color: "var(--muted)" }
              }
              onMouseEnter={!item.active ? e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--blue2)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(74,108,247,0.07)";
              } : undefined}
              onMouseLeave={!item.active ? e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)";
                (e.currentTarget as HTMLAnchorElement).style.background = "none";
              } : undefined}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrestaireModal(true)}
            className="hidden sm:flex items-center gap-1.5 text-white text-xs font-extrabold px-4 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer"
            style={{
              height: 40,
              background: "var(--grad)",
              boxShadow: "0 4px 14px rgba(217,63,181,0.3)",
              border: "none",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 22px rgba(217,63,181,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(217,63,181,0.3)";
            }}
          >
            <IconStar /> Devenir prestataire
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(m => !m)}
              aria-label="Menu"
              className="flex flex-col items-center justify-center gap-[5px] cursor-pointer rounded-xl transition-all"
              style={{
                width: 40, height: 40,
                background: showMenu ? "rgba(74,108,247,0.08)" : "var(--bg2)",
                border: showMenu ? "1.5px solid rgba(74,108,247,0.35)" : "1.5px solid var(--border)",
              }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 16, height: 2,
                  background: showMenu ? "var(--blue2)" : "var(--muted)",
                  borderRadius: 2, display: "block",
                }} />
              ))}
            </button>

            {showMenu && (
              <div
                className="absolute right-0 rounded-2xl overflow-hidden z-50"
                style={{
                  top: "calc(100% + 8px)",
                  background: "white",
                  border: "1px solid var(--border)",
                  boxShadow: "0 12px 40px rgba(74,108,247,0.18)",
                  minWidth: 200,
                }}
              >
                {[
                  { href: "/", label: "🏠 Accueil" },
                  { href: "/#prestataires", label: "🎭 Prestataires" },
                  { href: "/contact", label: "📞 Contact" },
                  { href: "/pro/dashboard", label: "⭐ Espace prestataire" },
                  { href: "/auth/login", label: "🔑 Connexion" },
                ].map((item, i, arr) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                    style={{
                      color: "var(--text)",
                      textDecoration: "none",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    onClick={() => setShowMenu(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-nunito)", paddingTop: 80 }}>
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
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏱️</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Réponse</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--dark2)" }}>
                Sous 24 à 48h ouvrables
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--dark)", padding: "24px clamp(16px,4vw,48px)" }}>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: "Confidentialité", href: "/confidentialite" },
              { label: "Conditions générales", href: "/cgv" },
              { label: "Fonctionnement", href: "/fonctionnement" },
              { label: "À propos", href: "/a-propos" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-xs font-semibold transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.8)")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)")}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © 2026{" "}
            <span style={{ background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 800 }}>
              Connect Event
            </span>{" "}
            — Tous droits réservés
          </div>

          <div className="flex items-center gap-3">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="flex items-center justify-center rounded-full transition-all"
              style={{ width: 36, height: 36, background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)")}
            >
              <svg width={16} height={16} fill="white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="flex items-center justify-center rounded-full transition-all"
              style={{ width: 36, height: 36, background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)")}
            >
              <svg width={16} height={16} fill="white" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
