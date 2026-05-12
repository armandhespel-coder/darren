import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import EditClient from "@/app/p/edit/[id]/edit-client";
import Navbar from "@/components/Navbar";
import ContactEquipe from "./contact-equipe";

export default async function ProDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/pro/dashboard");

  const service = createServiceClient();

  const { data: prestataire } = await service
    .from("prestataires")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!prestataire) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "120px 24px 48px", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 24 }}>🎵</div>
          <h1 style={{ fontWeight: 900, fontSize: 28, color: "var(--dark)", marginBottom: 12, fontFamily: "var(--font-raleway)" }}>
            Espace Prestataire
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Envoyez-nous un message pour rejoindre Connect Event en tant que prestataire.
          </p>
          <div style={{ textAlign: "left", background: "white", borderRadius: 20, padding: "28px 32px", border: "1px solid var(--border)", boxShadow: "var(--shadow2)" }}>
            <ContactEquipe userEmail={user.email ?? ""} />
          </div>
          <div style={{ marginTop: 24 }}>
            <a href="/" style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}>← Retour à l&apos;accueil</a>
          </div>
        </div>
      </div>
    );
  }

  return <EditClient prestataire={prestataire} userEmail={user.email ?? ""} isOwner />;
}
