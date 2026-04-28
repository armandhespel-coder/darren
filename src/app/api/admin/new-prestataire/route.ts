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

  const body = await req.json();
  const service = createServiceClient();
  const prestaId = body.id ?? crypto.randomUUID();

  const { error: prestaError } = await service.from("prestataires").insert({
    id: prestaId,
    owner_id: null,
    nom: body.nom,
    company: body.company ?? null,
    hide_company: body.hide_company ?? false,
    categorie: body.categorie,
    continent: body.continent ?? "Europe",
    prix: body.prix ?? 0,
    price_note: body.price_note ?? null,
    images: body.images ?? [],
    tags: body.tags ?? [],
    specialites: body.specialites ?? [],
    description: body.description ?? null,
    is_available: body.is_available ?? true,
    is_premium: body.is_premium ?? false,
    telephone: body.is_premium ? (body.telephone ?? null) : null,
    note: 0,
  });

  if (prestaError) return NextResponse.json({ error: prestaError.message }, { status: 500 });

  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: token, error: tokenError } = await service
    .from("edit_tokens")
    .insert({ prestataire_id: prestaId, expires_at: expiresAt })
    .select("id")
    .single();

  if (tokenError) return NextResponse.json({ error: tokenError.message }, { status: 500 });

  return NextResponse.json({ prestataire_id: prestaId, token_id: token.id });
}
