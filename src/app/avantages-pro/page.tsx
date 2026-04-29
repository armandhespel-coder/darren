import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Espace Prestataire — Connect Event",
  description: "Rejoignez Connect Event et développez votre activité événementielle en Belgique.",
};

const avantages = [
  { icon: "🎯", title: "Visibilité immédiate", desc: "Votre fiche visible par des centaines d'organisateurs d'événements en Belgique dès votre inscription." },
  { icon: "📞", title: "Contacts directs (Premium)", desc: "Affichez votre numéro de téléphone et recevez des appels directs sans intermédiaire." },
  { icon: "⭐", title: "Badge de confiance", desc: "Un badge Premium visible sur votre fiche pour rassurer les clients sur votre sérieux." },
  { icon: "📅", title: "Gestion des disponibilités", desc: "Gérez votre calendrier directement depuis votre tableau de bord." },
  { icon: "🏆", title: "Mise en avant", desc: "Les prestataires Premium apparaissent en tête des résultats de recherche." },
  { icon: "🌍", title: "100% local", desc: "Une plateforme pensée pour les prestataires belges, avec une communauté qui grandit." },
];

export default function AvantagesPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ background: "var(--dark2)", padding: "0.6rem 2rem" }}>
        <Link href="/">
          <Image src="/logo.png" alt="Connect Event" width={80} height={56} style={{ objectFit: "contain", display: "block" }} />
        </Link>
      </header>

      {/* Hero */}
      <section style={{ background: "var(--dark2)", padding: "5rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, left: -100, width: 350, height: 350, borderRadius: "50%", background: "var(--blue2)", opacity: 0.12, filter: "blur(100px)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "var(--pink)", opacity: 0.12, filter: "blur(80px)" }} />

        <p style={{ color: "var(--pink)", fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "1rem", position: "relative" }}>
          Espace Prestataire
        </p>
        <h1 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "1.5rem", position: "relative", lineHeight: 1.2 }}>
          Développez votre activité<br />événementielle en Belgique
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.05rem", maxWidth: 520, margin: "0 auto 2.5rem", position: "relative", lineHeight: 1.8 }}>
          Rejoignez des dizaines de prestataires DJ, traiteurs, photographes et décorateurs qui ont déjà rejoint Connect Event.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
          <Link href="/fonctionnement"
            style={{ background: "rgba(255,255,255,0.08)", color: "white", padding: "0.9rem 2.5rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: "1rem", border: "1.5px solid rgba(255,255,255,0.2)" }}>
            Comment ça marche ?
          </Link>
        </div>
      </section>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "4rem 1.5rem" }}>
        {/* Avantages */}
        <h2 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.6rem", color: "var(--dark2)", marginBottom: "0.5rem", textAlign: "center" }}>
          Pourquoi rejoindre Connect Event ?
        </h2>
        <p style={{ color: "#777", textAlign: "center", marginBottom: "2.5rem" }}>Tout ce dont vous avez besoin pour être trouvé et réservé.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "4rem" }}>
          {avantages.map((a) => (
            <div key={a.title} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: "1.75rem", boxShadow: "var(--shadow2)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{a.icon}</div>
              <h3 style={{ fontWeight: 700, color: "var(--dark2)", marginBottom: "0.5rem", fontSize: "1rem" }}>{a.title}</h3>
              <p style={{ color: "#666", fontSize: "0.88rem", lineHeight: 1.65 }}>{a.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div style={{ background: "var(--dark2)", borderRadius: 24, padding: "3rem 2rem", textAlign: "center" }}>
          <h3 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.5rem", color: "white", marginBottom: "0.75rem" }}>
            Intéressé ? Contactez-nous.
          </h3>
          <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: "2rem", fontSize: "0.95rem" }}>
            Notre équipe vous accompagne pour créer votre fiche et démarrer rapidement.
          </p>
          <Link href="/contact"
            style={{ background: "var(--grad)", color: "white", padding: "0.9rem 2.5rem", borderRadius: 50, fontWeight: 800, textDecoration: "none", fontSize: "1rem", boxShadow: "0 8px 28px rgba(217,63,181,0.4)", display: "inline-block" }}>
            Nous contacter →
          </Link>
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "2rem", color: "#999", fontSize: "0.85rem", borderTop: "1px solid var(--border)" }}>
        <Link href="/" style={{ color: "var(--blue2)", textDecoration: "none" }}>← Retour à l&apos;accueil</Link>
      </footer>
    </div>
  );
}
