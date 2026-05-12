import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const { email, message } = await req.json();
  if (!email || !message?.trim()) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  const service = createServiceClient();

  // Sauvegarder dans demandes pour l'admin
  await service.from("demandes").insert({
    prestataire_id: null,
    nom: email,
    email,
    contenu: `[Demande équipe] ${message.trim()}`,
    lu: false,
  });

  // Notifier l'admin par email
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Connect Event <contact@connect-event.be>",
      to: ["connect.eventbelgium@gmail.com", "armand.hespel@hotmail.com"],
      replyTo: email,
      subject: `[Demande Pro] ${email} — Connect Event`,
      html: `<p><strong>${email}</strong> souhaite rejoindre Connect Event en tant que prestataire.</p>
<p style="margin-top:12px;white-space:pre-wrap;">${message.trim()}</p>`,
    }).catch(err => console.error("[contact-equipe] Resend error:", err));
  }

  return NextResponse.json({ success: true });
}
