import { createClient } from "@/lib/supabase/server";
import AvisClient from "./avis-client";

export default async function AvisPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("avis_tokens")
    .select("id, used_at, expires_at, prestataires(id, nom, categorie)")
    .eq("id", token)
    .single();

  if (!data) {
    return <InvalidPage message="Ce lien est invalide ou n'existe pas." />;
  }
  if (data.used_at) {
    return <InvalidPage message="Cet avis a déjà été soumis. Merci !" icon="✅" />;
  }
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return <InvalidPage message="Ce lien a expiré. Contactez l'administrateur." icon="⏰" />;
  }

  const presta = data.prestataires as { id: string; nom: string; categorie: string } | null;
  if (!presta) {
    return <InvalidPage message="Prestataire introuvable." />;
  }

  return <AvisClient token={token} prestataire={presta} />;
}

function InvalidPage({ message, icon = "❌" }: { message: string; icon?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-center max-w-md mx-auto px-6">
        <div className="text-6xl mb-4">{icon}</div>
        <h1 className="font-black text-2xl mb-2" style={{ color: "var(--dark)", fontFamily: "var(--font-raleway)" }}>
          Lien invalide
        </h1>
        <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>{message}</p>
        <a href="/" className="inline-block mt-6 text-xs font-bold px-5 py-2.5 rounded-full text-white" style={{ background: "var(--grad)" }}>
          Retour au site
        </a>
      </div>
    </div>
  );
}
