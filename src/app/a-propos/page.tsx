import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos — Connect Event",
};

const values = [
  { icon: "🎯", title: "Simplicité", desc: "Trouver un prestataire doit être rapide. Pas de formulaires interminables — juste une mise en relation directe." },
  { icon: "🤝", title: "Confiance", desc: "Chaque prestataire est vérifié manuellement avant d'apparaître sur la plateforme." },
  { icon: "🌍", title: "Local d'abord", desc: "On soutient les professionnels de l'événementiel belge. DJ à Bruxelles, traiteur à Liège — en 2 clics." },
  { icon: "💡", title: "Innovation", desc: "On construit la plateforme la plus intelligente du secteur pour matcher besoins et prestataires." },
];

export default function AProposPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <header style={{ background: "var(--dark2)", padding: "1.2rem 2rem" }}>
        <Link href="/" style={{ color: "white", fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.4rem", textDecoration: "none" }}>
          Connect<span style={{ color: "var(--pink)" }}>Event</span>
        </Link>
      </header>

      <section style={{ background: "var(--dark2)", padding: "5rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, left: -100, width: 350, height: 350, borderRadius: "50%", background: "var(--blue2)", opacity: 0.1, filter: "blur(100px)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "var(--pink)", opacity: 0.1, filter: "blur(80px)" }} />
        <p style={{ color: "var(--pink)", fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "1rem", position: "relative" }}>Notre histoire</p>
        <h1 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "1.5rem", position: "relative", lineHeight: 1.2 }}>
          La marketplace événementielle<br />pensée pour la Belgique
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.05rem", maxWidth: 560, margin: "0 auto", position: "relative", lineHeight: 1.8 }}>
          Connect Event est né d&apos;une frustration simple : trouver un bon prestataire pour un événement prend trop de temps et implique trop d&apos;intermédiaires.
        </p>
      </section>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "4rem 1.5rem" }}>

        <section style={{ background: "white", borderRadius: 20, padding: "2.5rem", boxShadow: "var(--shadow2)", border: "1px solid var(--border)", marginBottom: "3rem" }}>
          <h2 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.4rem", color: "var(--dark2)", marginBottom: "1rem" }}>Notre mission</h2>
          <p style={{ color: "#555", lineHeight: 1.9, fontSize: "1rem" }}>
            Connecter les organisateurs d&apos;événements avec les meilleurs prestataires belges, de manière simple, transparente et rapide. Mariage, soirée d&apos;entreprise, anniversaire, festival — Connect Event est la référence pour trouver DJ, traiteur, photographe, décorateur et bien plus.
          </p>
        </section>

        <h2 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.4rem", color: "var(--dark2)", marginBottom: "0.3rem" }}>Nos valeurs</h2>
        <p style={{ color: "#777", marginBottom: "2rem" }}>Ce qui guide chaque décision.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1.25rem", marginBottom: "3.5rem" }}>
          {values.map((v) => (
            <div key={v.title} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: "1.75rem", boxShadow: "var(--shadow2)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{v.icon}</div>
              <h3 style={{ fontWeight: 700, color: "var(--dark2)", marginBottom: "0.5rem" }}>{v.title}</h3>
              <p style={{ color: "#666", fontSize: "0.88rem", lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>

        <section style={{ background: "var(--dark2)", borderRadius: 20, padding: "2.5rem", marginBottom: "3rem", display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>
            🎪
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, color: "white", fontSize: "1.15rem", marginBottom: "0.3rem" }}>Une startup belge indépendante</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, fontSize: "0.95rem", maxWidth: 560 }}>
              Connect Event est développé par Hesperides Studio, basé en Belgique. On est une petite équipe passionnée par l&apos;événementiel et la technologie — et on construit une plateforme qu&apos;on aurait voulu avoir nous-mêmes.
            </p>
          </div>
        </section>

        <section style={{ textAlign: "center", padding: "2rem 0" }}>
          <h2 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.4rem", color: "var(--dark2)", marginBottom: "0.75rem" }}>Une question ? Un partenariat ?</h2>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>On répond toujours aux messages.</p>
          <a href="mailto:yagan_darren@hotmail.com" style={{ background: "var(--grad)", color: "white", padding: "0.9rem 2.5rem", borderRadius: 50, fontWeight: 700, textDecoration: "none", fontSize: "1rem", display: "inline-block" }}>
            yagan_darren@hotmail.com
          </a>
        </section>
      </main>

      <footer style={{ textAlign: "center", padding: "2rem", color: "#999", fontSize: "0.85rem", borderTop: "1px solid var(--border)" }}>
        <Link href="/" style={{ color: "var(--blue2)", textDecoration: "none" }}>← Retour à l&apos;accueil</Link>
      </footer>
    </div>
  );
}
