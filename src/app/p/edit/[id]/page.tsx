import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { Prestataire } from "@/types";
import EditClient from "./edit-client";

function LinkExpired() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F8FC", fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", padding: "40px 24px", maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⏰</div>
        <h1 style={{ color: "#1E1C3A", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Lien expiré</h1>
        <p style={{ color: "#6B6A87", fontSize: 14, lineHeight: 1.6 }}>
          Ce lien de modification a expiré. Contactez l&apos;administrateur pour en obtenir un nouveau.
        </p>
        <a href="/" style={{ display: "inline-block", marginTop: 24, color: "#4A6CF7", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
          ← Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  // Try as a token first
  const { data: token } = await supabase
    .from("edit_tokens")
    .select("prestataire_id, expires_at")
    .eq("id", id)
    .single();

  if (token) {
    // Check expiry
    if (token.expires_at && new Date(token.expires_at) < new Date()) {
      return <LinkExpired />;
    }

    const { data } = await supabase
      .from("prestataires")
      .select("*")
      .eq("id", token.prestataire_id)
      .single();

    if (!data) notFound();
    return <EditClient prestataire={data as Prestataire} tokenId={id} />;
  }

  // Fallback: direct prestataire_id (admin direct access or claim link)
  const { data } = await supabase
    .from("prestataires")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const claimable = !data.owner_id;
  return <EditClient prestataire={data as Prestataire} claimable={claimable} />;
}
