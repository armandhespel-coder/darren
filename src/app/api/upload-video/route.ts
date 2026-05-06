import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { prestataireId, filename } = await req.json();
  if (!prestataireId || !filename) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  const ext = (filename as string).split(".").pop() ?? "mp4";
  const path = `${prestataireId}/video_${Date.now()}.${ext}`;

  const service = createServiceClient();
  const { data, error } = await service.storage.from("presta-photos").createSignedUploadUrl(path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = service.storage.from("presta-photos").getPublicUrl(path);

  return NextResponse.json({ signedUrl: data.signedUrl, publicUrl });
}
