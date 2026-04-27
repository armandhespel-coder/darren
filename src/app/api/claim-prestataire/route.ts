import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { prestataire_id } = await req.json();
  if (!prestataire_id) return NextResponse.json({ error: "ID manquant." }, { status: 400 });

  const service = createServiceClient();

  // Vérifier que le prestataire est bien non-réclamé
  const { data: presta } = await service
    .from("prestataires")
    .select("id, owner_id")
    .eq("id", prestataire_id)
    .single();

  if (!presta) return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 });
  const unclaimed = !presta.owner_id;
  if (!unclaimed) return NextResponse.json({ error: "Ce profil est déjà réclamé." }, { status: 409 });

  // Claim : lier le user + passer role à 'pro'
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    service.from("prestataires").update({ owner_id: user.id }).eq("id", prestataire_id),
    service.from("profiles").update({ role: "pro" }).eq("id", user.id),
  ]);

  if (e1 || e2) return NextResponse.json({ error: "Erreur lors du claim." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
