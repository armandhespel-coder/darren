import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token manquant." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const service = createServiceClient();

  const { data: tokenData } = await service
    .from("edit_tokens")
    .select("prestataire_id")
    .eq("id", token)
    .single();

  if (!tokenData) return NextResponse.json({ error: "Token invalide." }, { status: 400 });

  await Promise.all([
    service.from("prestataires").update({ owner_id: user.id }).eq("id", tokenData.prestataire_id),
    service.from("profiles").update({ role: "prestataire" }).eq("id", user.id),
  ]);

  return NextResponse.json({ success: true });
}
