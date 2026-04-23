import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const prestataireId = form.get("prestataire_id") as string | null;

  if (!file || !prestataireId) {
    return NextResponse.json({ error: "Fichier ou prestataire manquant." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${prestataireId}/${Date.now()}.${ext}`;

  const service = createServiceClient();
  const { data, error } = await service.storage
    .from("presta-photos")
    .upload(path, file, { upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = service.storage
    .from("presta-photos")
    .getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}
