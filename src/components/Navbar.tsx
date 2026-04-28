"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import DevenirPrestaireModal from "./DevenirPrestaireModal";

const ADMIN_EMAILS = ["armand.hespel@hotmail.com", "yagan_darren@hotmail.com"];

function IconHome() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012.48 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function IconLock() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
}

function IconStar() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.77 7.82 22 9 14.14 4 9.27l5.91-.91L12 2z"/>
    </svg>
  );
}

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userIsPrestataire, setUserIsPrestataire] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPrestaireModal, setShowPrestaireModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUserEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        setUserIsPrestataire(profile?.role === "pro");
      }
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {showPrestaireModal && <DevenirPrestaireModal onClose={() => setShowPrestaireModal(false)} />}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 20px rgba(74,108,247,0.08)",
          padding: "0 clamp(12px, 4vw, 48px)",
          height: 80,
        }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Connect Event" className="h-32 md:h-40 w-auto object-contain" />
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Accueil", href: "/", icon: <IconHome />, active: false },
            { label: "Prestataires", href: "/#prestataires", icon: <IconUsers />, active: false },
            { label: "Contact", href: "/contact", icon: <IconPhone />, active: false },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--blue2)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(74,108,247,0.07)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted)";
                (e.currentTarget as HTMLAnchorElement).style.background = "none";
              }}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Espace Pro — caché pour les pros */}
          {!userIsPrestataire && <button
            onClick={() => router.push("/pro/avantages")}
            className="hidden sm:flex items-center gap-1.5 text-xs font-extrabold px-4 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer"
            style={{ height: 40, background: "transparent", border: "1.5px solid var(--border)", color: "var(--text)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--blue2)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--blue2)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
            }}
          >
            🏠 Espace Pro
          </button>}

          {/* Devenir prestataire — caché pour les pros */}
          {!userIsPrestataire && <button
            onClick={() => setShowPrestaireModal(true)}
            className="hidden sm:flex items-center gap-1.5 text-white text-xs font-extrabold px-4 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer"
            style={{ height: 40, background: "var(--grad)", boxShadow: "0 4px 14px rgba(217,63,181,0.3)", border: "none", letterSpacing: "0.04em" }}
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
          </button>}

          {/* Hamburger */}
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
                  borderRadius: 2, display: "block", transition: "background 0.2s",
                }} />
              ))}
            </button>

            {showMenu && (
              <div className="absolute right-0 rounded-2xl overflow-hidden z-50"
                style={{ top: "calc(100% + 8px)", background: "white", border: "1px solid var(--border)", boxShadow: "0 12px 40px rgba(74,108,247,0.18)", minWidth: 200 }}>
                {userEmail ? (
                  <>
                    {ADMIN_EMAILS.includes(userEmail) && (
                      <a href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                        style={{ color: "var(--blue2)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <IconLock /> Admin
                      </a>
                    )}
                    {!userIsPrestataire && <a href="/messages"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      💬 Messages
                    </a>}
                    {!userIsPrestataire && <button
                      onClick={() => { router.push("/pro/avantages"); setShowMenu(false); }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all w-full text-left cursor-pointer"
                      style={{ color: "var(--text)", background: "transparent", border: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      🏠 Espace Pro
                    </button>}
                    <a href="/fonctionnement"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      ❓ Aide
                    </a>
                    <button
                      onClick={async () => {
                        const s = createClient();
                        await s.auth.signOut();
                        window.location.href = '/';
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all w-full text-left cursor-pointer"
                      style={{ color: "#dc2626", background: "transparent", border: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      🚪 Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/auth/login"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      🔑 Connexion
                    </a>
                    <a href="/auth/register"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      📝 Créer un compte
                    </a>
                    <button
                      onClick={() => { setShowPrestaireModal(true); setShowMenu(false); }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-extrabold transition-all w-full text-left cursor-pointer sm:hidden"
                      style={{ color: "var(--pink)", background: "transparent", border: "none", borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(217,63,181,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      ✨ Devenir prestataire
                    </button>
                    <a href="/fonctionnement"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all"
                      style={{ color: "var(--muted)", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      ❓ Aide
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
