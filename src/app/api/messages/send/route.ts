import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { prestataire_id, receiver_id, content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: msg, error } = await service
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiver_id,
      prestataire_id: prestataire_id ?? null,
      content: content.trim(),
      read: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: msg });
}
