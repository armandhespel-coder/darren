import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const allowed = ["nom", "company", "description", "tags", "prix", "price_note", "telephone", "is_available", "images", "busy_dates", "video_url", "categorie"];
  const payload: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) payload[key] = body[key] ?? null;
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("prestataires").update(payload).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
