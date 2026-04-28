import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import ClaimClient from "./claim-client";

export default async function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: tokenData } = await supabase
    .from("edit_tokens")
    .select("prestataire_id, expires_at, prestataires(nom, categorie)")
    .eq("id", token)
    .single();

  if (!tokenData) notFound();

  if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F8FC" }}>
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: "#1E1C3A", marginBottom: 8 }}>Lien expiré</h1>
          <p style={{ color: "#6B6A87", fontSize: 14 }}>Contactez l&apos;administrateur pour obtenir un nouveau lien.</p>
        </div>
      </main>
    );
  }

  const presta = tokenData.prestataires as { nom: string; categorie: string } | null;

  return <ClaimClient token={token} prestataireId={tokenData.prestataire_id} prestaName={presta?.nom ?? ""} />;
}
