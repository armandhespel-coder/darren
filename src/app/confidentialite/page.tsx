import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Connect Event",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontFamily: "var(--font-raleway)", fontWeight: 700, fontSize: "1.15rem", color: "var(--dark2)", marginBottom: "0.75rem", paddingBottom: "0.4rem", borderBottom: "2px solid var(--blue2)" }}>
        {title}
      </h2>
      <div style={{ color: "#444", lineHeight: 1.8, fontSize: "0.95rem" }}>{children}</div>
    </section>
  );
}

export default function ConfidentialitePage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <header style={{ background: "var(--dark2)", padding: "1.2rem 2rem" }}>
        <Link href="/" style={{ color: "white", fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.4rem", textDecoration: "none" }}>
          Connect<span style={{ color: "var(--pink)" }}>Event</span>
        </Link>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "2rem", color: "var(--dark2)", marginBottom: "0.5rem" }}>
          Politique de confidentialité
        </h1>
        <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "2.5rem" }}>Dernière mise à jour : avril 2026</p>

        <Section title="1. Responsable du traitement">
          <p>Connect Event, exploité par Hesperides Studio, est responsable du traitement de vos données personnelles collectées via la plateforme.</p>
          <p>Contact : <a href="mailto:yagan_darren@hotmail.com" style={{ color: "var(--blue2)" }}>yagan_darren@hotmail.com</a></p>
        </Section>

        <Section title="2. Données collectées">
          <ul>
            <li>Nom, prénom, adresse e-mail lors de l&apos;inscription</li>
            <li>Informations de profil prestataire (catégorie, zone géographique, description, photos)</li>
            <li>Messages échangés via la messagerie interne</li>
            <li>Données de navigation (cookies techniques et analytiques)</li>
            <li>Informations de paiement traitées par Stripe (nous ne stockons pas les données bancaires)</li>
          </ul>
        </Section>

        <Section title="3. Finalités du traitement">
          <ul>
            <li>Création et gestion de votre compte</li>
            <li>Mise en relation clients et prestataires</li>
            <li>Traitement des abonnements premium</li>
            <li>Amélioration de la plateforme</li>
            <li>Envoi de communications liées au service</li>
          </ul>
        </Section>

        <Section title="4. Base légale">
          <p>Le traitement est fondé sur votre consentement lors de l&apos;inscription, l&apos;exécution du contrat de service, et nos intérêts légitimes à améliorer la plateforme.</p>
        </Section>

        <Section title="5. Conservation des données">
          <p>Vos données sont conservées pendant toute la durée de votre compte actif, puis 3 ans après suppression, sauf obligation légale contraire.</p>
        </Section>

        <Section title="6. Partage des données">
          <p>Vos données ne sont jamais vendues. Elles peuvent être partagées avec :</p>
          <ul>
            <li>Supabase (hébergement base de données) — Union européenne</li>
            <li>Stripe (paiements) — certifié PCI DSS</li>
            <li>Vercel (hébergement) — région Europe</li>
          </ul>
        </Section>

        <Section title="7. Vos droits (RGPD)">
          <ul>
            <li>Accès, rectification et suppression de vos données</li>
            <li>Portabilité des données</li>
            <li>Opposition au traitement</li>
            <li>Retrait du consentement à tout moment</li>
          </ul>
          <p>Pour exercer ces droits : <a href="mailto:yagan_darren@hotmail.com" style={{ color: "var(--blue2)" }}>yagan_darren@hotmail.com</a></p>
        </Section>

        <Section title="8. Cookies">
          <p>Nous utilisons des cookies strictement nécessaires au fonctionnement du service (session, authentification) et des cookies analytiques anonymes. Aucun cookie publicitaire tiers.</p>
        </Section>

        <Section title="9. Réclamation">
          <p>Vous pouvez introduire une réclamation auprès de l&apos;<strong>Autorité de Protection des Données (APD)</strong> en Belgique : <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noreferrer" style={{ color: "var(--blue2)" }}>autoriteprotectiondonnees.be</a></p>
        </Section>
      </main>

      <footer style={{ textAlign: "center", padding: "2rem", color: "#999", fontSize: "0.85rem", borderTop: "1px solid var(--border)" }}>
        <Link href="/" style={{ color: "var(--blue2)", textDecoration: "none" }}>← Retour à l&apos;accueil</Link>
      </footer>
    </div>
  );
}
