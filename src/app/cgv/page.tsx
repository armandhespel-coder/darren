import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions générales — Connect Event",
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

export default function CGVPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <header style={{ background: "var(--dark2)", padding: "1.2rem 2rem" }}>
        <Link href="/" style={{ color: "white", fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "1.4rem", textDecoration: "none" }}>
          Connect<span style={{ color: "var(--pink)" }}>Event</span>
        </Link>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-raleway)", fontWeight: 900, fontSize: "2rem", color: "var(--dark2)", marginBottom: "0.5rem" }}>
          Conditions générales d&apos;utilisation
        </h1>
        <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "2.5rem" }}>Dernière mise à jour : avril 2026</p>

        <Section title="1. Objet">
          <p>Les présentes conditions régissent l&apos;utilisation de Connect Event, marketplace de mise en relation entre clients organisateurs d&apos;événements et prestataires professionnels (DJ, traiteurs, photographes, décorateurs, etc.).</p>
        </Section>

        <Section title="2. Acceptation">
          <p>En créant un compte ou en utilisant la plateforme, vous acceptez sans réserve les présentes conditions.</p>
        </Section>

        <Section title="3. Description du service">
          <p>Connect Event est une plateforme de mise en relation. Elle n&apos;est pas partie au contrat conclu entre un client et un prestataire et ne garantit pas la qualité des prestations.</p>
        </Section>

        <Section title="4. Comptes utilisateurs">
          <ul>
            <li>Vous devez avoir au moins 18 ans pour créer un compte</li>
            <li>Vous êtes responsable de la confidentialité de vos identifiants</li>
            <li>Un compte par personne physique ou morale</li>
            <li>Les informations renseignées doivent être exactes et à jour</li>
          </ul>
        </Section>

        <Section title="5. Offre Premium prestataires">
          <p>L&apos;offre <strong>Premium</strong> (payante, via Stripe) permet :</p>
          <ul>
            <li>L&apos;affichage du numéro de téléphone sur la fiche</li>
            <li>Une mise en avant dans les résultats</li>
            <li>Un badge Premium visible par les clients</li>
          </ul>
          <p>L&apos;abonnement est mensuel et résiliable à tout moment. Aucun remboursement prorata pour la période en cours.</p>
        </Section>

        <Section title="6. Obligations des utilisateurs">
          <p>Il est interdit de :</p>
          <ul>
            <li>Publier des informations fausses ou trompeuses</li>
            <li>Utiliser la plateforme à des fins frauduleuses</li>
            <li>Scraper ou reproduire le contenu de la plateforme</li>
            <li>Porter atteinte aux droits des autres utilisateurs</li>
          </ul>
        </Section>

        <Section title="7. Responsabilité">
          <p>La responsabilité de Connect Event est limitée au montant des sommes perçues au cours des 3 derniers mois précédant le litige.</p>
        </Section>

        <Section title="8. Propriété intellectuelle">
          <p>Le contenu de la plateforme (logo, design, textes, code) est la propriété de Hesperides Studio. Les prestataires conservent la propriété de leurs contenus mais accordent à Connect Event une licence d&apos;affichage non exclusive.</p>
        </Section>

        <Section title="9. Résiliation">
          <p>Connect Event se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes conditions, sans préavis ni remboursement.</p>
        </Section>

        <Section title="10. Droit applicable">
          <p>Les présentes conditions sont soumises au droit belge. Tout litige relèvera de la compétence exclusive des tribunaux de Belgique.</p>
        </Section>

        <Section title="11. Contact">
          <p><a href="mailto:contact@connectevent.be" style={{ color: "var(--blue2)" }}>contact@connectevent.be</a></p>
        </Section>
      </main>

      <footer style={{ textAlign: "center", padding: "2rem", color: "#999", fontSize: "0.85rem", borderTop: "1px solid var(--border)" }}>
        <Link href="/" style={{ color: "var(--blue2)", textDecoration: "none" }}>← Retour à l&apos;accueil</Link>
      </footer>
    </div>
  );
}
