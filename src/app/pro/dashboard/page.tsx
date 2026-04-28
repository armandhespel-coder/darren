import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import DashboardClient from "./dashboard-client";
import Navbar from "@/components/Navbar";

export default async function ProDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/pro/dashboard");

  const service = createServiceClient();

  const { data: prestataire } = await service
    .from("prestataires")
    .select("*")
    .eq("owner_id", user!.id)
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
            Cet espace est réservé aux prestataires inscrits sur Connect Event — DJ, traiteur, photographe, etc.<br /><br />
            Pour créer votre profil prestataire, vous devez recevoir un lien d&apos;invitation de notre équipe.
          </p>
          <a href="mailto:contact@connect-event.be"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 14, background: "var(--grad)", color: "white", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>
            Contacter l&apos;équipe →
          </a>
          <div style={{ marginTop: 24 }}>
            <a href="/" style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}>← Retour à l&apos;accueil</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      prestataire={prestataire}
      userEmail={user.email ?? ""}
    />
  );
}
