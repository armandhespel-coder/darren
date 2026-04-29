import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ADMIN_EMAILS = ["armand.hespel@hotmail.com", "yagan_darren@hotmail.com"];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { prestataire_id, content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  const service = createServiceClient();

  const [{ data: adminProfiles }, { data: presta }] = await Promise.all([
    service.from("profiles").select("id").in("email", ADMIN_EMAILS).limit(1),
    prestataire_id
      ? service.from("prestataires").select("nom, email, owner_id").eq("id", prestataire_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const adminId = adminProfiles?.[0]?.id ?? null;

  const { data: msg, error } = await service
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: adminId,
      prestataire_id: prestataire_id ?? null,
      content: content.trim(),
      read: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send notification email to admins
  const prestaNom = (presta as { nom?: string } | null)?.nom ?? "";
  const prestaEmail = (presta as { email?: string | null } | null)?.email ?? "";
  const clientEmail = user.email ?? "client inconnu";
  const adminMessagesUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://connect-event.be"}/admin/messages`;

  const emailBody = [
    `Nouvelle demande reçue sur Connect Event`,
    ``,
    `Client : ${clientEmail}`,
    prestaNom ? `Prestataire : ${prestaNom}` : "",
    prestaEmail ? `Email prestataire : ${prestaEmail}` : "",
    ``,
    `--- Message du client ---`,
    content.trim(),
    `------------------------`,
    ``,
    `Voir les messages : ${adminMessagesUrl}`,
    prestaEmail
      ? `Transmettre par email : ${adminMessagesUrl} (bouton "Transmettre" dans la conversation)`
      : "",
  ].filter(l => l !== undefined).join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Connect Event <contact@connect-event.be>",
      to: ADMIN_EMAILS,
      subject: prestaNom
        ? `[Connect Event] Nouvelle demande de ${clientEmail} pour ${prestaNom}`
        : `[Connect Event] Nouveau message de ${clientEmail}`,
      text: emailBody,
    }),
  }).catch(() => null); // ne pas bloquer si Resend échoue

  return NextResponse.json({ message: msg });
}
