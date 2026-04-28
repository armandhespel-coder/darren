"use client";

import { useState } from "react";
import Link from "next/link";
import DevenirPrestaireModal from "@/components/DevenirPrestaireModal";

function IconStar() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.77 7.82 22 9 14.14 4 9.27l5.91-.91L12 2z"/>
    </svg>
  );
}

const stepsClient = [
  { num: "01", title: "Recherchez", desc: "Filtrez par catégorie (DJ, traiteur, photo…), zone géographique et budget pour cibler les bons profils." },
  { num: "02", title: "Consultez les fiches", desc: "Description, photos, zone d'intervention, tarifs indicatifs — tout est là avant de contacter." },
  { num: "03", title: "Contactez directement", desc: "Prestataires Premium : numéro de téléphone visible. Autres : messagerie interne gratuite." },
  { num: "04", title: "Réservez", desc: "Finalisez les détails directement avec le prestataire. Vous gardez le contrôle." },
];

const stepsPro = [
  { num: "01", title: "Créez votre fiche", desc: "Inscription gratuite : catégorie, zone, photos, description et tarifs indicatifs." },
  { num: "02", title: "Recevez des demandes", desc: "Les clients vous contactent directement par téléphone (Premium) ou via le formulaire de contact." },
  { num: "03", title: "Passez Premium", desc: "Affichez votre téléphone, soyez mis en avant dans les résultats et gagnez un badge de confiance." },
  { num: "04", title: "Développez votre activité", desc: "Répondez, gérez vos disponibilités et construisez votre réputation sur la plateforme." },
];

export default function FonctionnementPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {showModal && <DevenirPrestaireModal onClose={() => setShowModal(false)} />}

      <header style={{ background: "var(--dark2)", padding: "1.2rem 2rem" }}>
        <Link href="/" style={{ color: "white", fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.4rem", textDecoration: "none" }}>
          Connect<span style={{ color: "var(--pink)" }}>Event</span>
        </Link>
      </header>

      <section style={{ background: "var(--dark2)", padding: "4rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "var(--blue2)", opacity: 0.12, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: -60, right: -60, width: 250, height: 250, borderRadius: "50%", background: "var(--pink)", opacity: 0.12, filter: "blur(70px)" }} />
        <h1 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "white", marginBottom: "1rem", position: "relative" }}>
          Comment ça marche ?
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.05rem", maxWidth: 540, margin: "0 auto", position: "relative" }}>
          Mariage, soirée d&apos;entreprise, anniversaire — trouvez le bon prestataire en quelques minutes.
        </p>
      </section>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "4rem 1.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.5rem", color: "var(--dark2)", marginBottom: "0.3rem" }}>
          Vous organisez un événement ?
        </h2>
        <p style={{ color: "#777", marginBottom: "2rem" }}>Trouvez le prestataire idéal rapidement.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1.25rem", marginBottom: "4rem" }}>
          {stepsClient.map((s) => (
            <div key={s.num} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", boxShadow: "var(--shadow2)" }}>
              <div style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "2rem", background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.75rem" }}>
                {s.num}
              </div>
              <h3 style={{ fontWeight: 700, color: "var(--dark2)", marginBottom: "0.5rem", fontSize: "1rem" }}>{s.title}</h3>
              <p style={{ color: "#666", fontSize: "0.88rem", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.5rem", color: "var(--dark2)", marginBottom: "0.3rem" }}>
          Vous êtes prestataire ?
        </h2>
        <p style={{ color: "#777", marginBottom: "2rem" }}>Développez votre activité événementielle.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1.25rem", marginBottom: "4rem" }}>
          {stepsPro.map((s) => (
            <div key={s.num} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", boxShadow: "var(--shadow2)" }}>
              <div style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "2rem", background: "var(--grad2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.75rem" }}>
                {s.num}
              </div>
              <h3 style={{ fontWeight: 700, color: "var(--dark2)", marginBottom: "0.5rem", fontSize: "1rem" }}>{s.title}</h3>
              <p style={{ color: "#666", fontSize: "0.88rem", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", background: "var(--dark2)", borderRadius: 20, padding: "3rem 2rem" }}>
          <h3 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.5rem", color: "white", marginBottom: "1rem" }}>
            Prêt à commencer ?
          </h3>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{ background: "var(--grad)", color: "white", padding: "0.8rem 2rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>
              Trouver un prestataire
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-white font-extrabold cursor-pointer transition-all"
              style={{
                background: "white",
                color: "var(--dark2)",
                padding: "0.8rem 2rem",
                borderRadius: 50,
                fontWeight: 700,
                fontSize: "0.95rem",
                border: "none",
                boxShadow: "0 4px 14px rgba(255,255,255,0.15)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(255,255,255,0.25)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(255,255,255,0.15)";
              }}
            >
              <IconStar /> Devenir prestataire
            </button>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "2rem", color: "#999", fontSize: "0.85rem", borderTop: "1px solid var(--border)" }}>
        <Link href="/" style={{ color: "var(--blue2)", textDecoration: "none" }}>← Retour à l&apos;accueil</Link>
      </footer>
    </div>
  );
}
