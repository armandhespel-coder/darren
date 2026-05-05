import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const { prestataire_id, content, sender_name, sender_email } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }
  if (!sender_email?.trim() || !sender_name?.trim()) {
    return NextResponse.json({ error: "Nom et email requis." }, { status: 400 });
  }

  const service = createServiceClient();

  const { error } = await service.from("messages").insert({
    sender_id: null,
    sender_name: sender_name.trim(),
    sender_email: sender_email.trim(),
    receiver_id: null,
    prestataire_id: prestataire_id ?? null,
    content: content.trim(),
    read: false,
  });

  if (error) {
    console.error("DB insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
