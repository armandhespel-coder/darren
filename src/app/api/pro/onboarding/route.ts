import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json();
  const { nom, company, categorie, description, prix, price_note, tags, email } = body;

  if (!nom?.trim()) return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });

  const service = createServiceClient();

  // Garantir que le profil existe avec le bon rôle
  await service.from("profiles").upsert({ id: user.id, role: "pro", email: user.email ?? "" }, { onConflict: "id" });

  const { error } = await service.from("prestataires").insert({
    owner_id: user.id,
    nom: nom.trim(),
    company: company?.trim() || null,
    categorie,
    continent: "Europe",
    description: description?.trim() || null,
    prix: Number(prix) || 0,
    price_note: price_note?.trim() || null,
    tags: tags ?? [],
    images: [],
    note: 0,
    is_available: true,
    is_premium: false,
    email: email?.trim() || null,
    telephone: null,
  });

  if (error) {
    console.error("[pro/onboarding]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
