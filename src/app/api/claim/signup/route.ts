import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const { email, password, token } = await req.json();
  if (!email || !password || !token) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: tokenData } = await service
    .from("edit_tokens")
    .select("prestataire_id, expires_at")
    .eq("id", token)
    .single();

  if (!tokenData) return NextResponse.json({ error: "Lien invalide." }, { status: 404 });
  if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
    return NextResponse.json({ error: "Lien expiré." }, { status: 410 });
  }

  const isInvite = !tokenData.prestataire_id;

  // Créer le compte (email confirmé immédiatement)
  let userId: string;
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email, password, email_confirm: true,
  });

  if (createError) {
    if (createError.message.includes("already")) {
      const { data: existing } = await service.auth.admin.listUsers();
      const found = existing?.users?.find(u => u.email === email);
      if (!found) return NextResponse.json({ error: "Email déjà utilisé." }, { status: 409 });
      userId = found.id;
    } else {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }
  } else {
    userId = created.user.id;
  }

  if (isInvite) {
    // Lien d'invitation : juste passer en pro, le prestataire crée sa fiche lui-même
    await service.from("profiles").update({ role: "pro" }).eq("id", userId);
    return NextResponse.json({ ok: true, isInvite: true });
  }

  // Lien de claim : vérifier que la fiche n'est pas déjà prise
  const { data: presta } = await service
    .from("prestataires")
    .select("id, owner_id")
    .eq("id", tokenData.prestataire_id)
    .single();

  if (!presta) return NextResponse.json({ error: "Prestataire introuvable." }, { status: 404 });
  if (presta.owner_id) return NextResponse.json({ error: "Ce profil est déjà associé à un compte." }, { status: 409 });

  await Promise.all([
    service.from("prestataires").update({ owner_id: userId }).eq("id", presta.id),
    service.from("profiles").update({ role: "pro" }).eq("id", userId),
  ]);

  return NextResponse.json({ ok: true, isInvite: false });
}
