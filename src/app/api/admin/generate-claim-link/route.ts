import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ADMIN_EMAILS = ["armand.hespel@hotmail.com", "yagan_darren@hotmail.com"];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { prestataire_id } = await req.json();
  if (!prestataire_id) return NextResponse.json({ error: "ID manquant." }, { status: 400 });

  const service = createServiceClient();
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data: token, error } = await service
    .from("edit_tokens")
    .insert({ prestataire_id, expires_at: expiresAt })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ token_id: token.id });
}
