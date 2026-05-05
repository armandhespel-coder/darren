import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const { prestataire_id, content, sender_name, sender_email, sender_phone } = await req.json();

  if (!content?.trim() || !sender_name?.trim() || !sender_email?.trim()) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }

  const service = createServiceClient();

  const { error } = await service.from("demandes").insert({
    prestataire_id: prestataire_id ?? null,
    nom: sender_name.trim(),
    email: sender_email.trim(),
    telephone: sender_phone?.trim() ?? null,
    contenu: content.trim(),
    lu: false,
  });

  if (error) {
    console.error("Demande insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
