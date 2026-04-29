import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const prestataireId = form.get("prestataire_id") as string | null;

  if (!file || !prestataireId) {
    return NextResponse.json({ error: "Fichier ou prestataire manquant." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "mp4";
  const path = `videos/${prestataireId}/${Date.now()}.${ext}`;

  const service = createServiceClient();
  const { data, error } = await service.storage
    .from("presta-photos")
    .upload(path, file, { upsert: false, contentType: file.type || "video/mp4" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = service.storage
    .from("presta-photos")
    .getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}
